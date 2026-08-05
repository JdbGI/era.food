import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const protectedRoutes = {
  "menuqr/index.html": "fcf9a489f3391c97d7e01b03cefde7e0315fde94f4e04094ae3ad59861e254c9",
  "t1/index.html": "82e565b9344dbf148abd89d4cd706200d11151c7f8b076bd301b507d00224346",
  "t2/index.html": "dad6641d85ecd7574a92d5eaaab761447d51f0a8570c3c120ca9b6d4de63fe4c",
  "t3/index.html": "b8d70e49e4bd80aa059a63c8d748750d51db93d957ab7bdf686b5b607efb10ad",
  "t4/index.html": "9daf1aa8f840e2d0a194cc7b217e2b367be5b0e02ee9969dc5cc3bc88e265bc9",
  "t5/index.html": "e1a591cb5cf91ef40e78b48a363728e9119a5b9731e51ea2c3917d55093275cd",
  "t6/index.html": "337cfa27623569c9b40778add0698f0190579412203ec91ba49f1a7fb5f5a31a",
  "t7/index.html": "d84ce171999bee3b305d18987b22c6af94e53219555ac6b941e1affd2787d2d0",
};

const controlPages = [
  "control/index.html",
  "control/privacy-policy.html",
  "control/end-user-license-agreement.html",
  "control/disconnected.html",
];
const pages = [
  "index.html",
  "menu.html",
  "visit.html",
  "about.html",
  "loyalty.html",
  "404.html",
  "401.html",
  ...controlPages,
];
const publicPages = ["index.html", "menu.html", "visit.html", "about.html", ...controlPages];
const failures = [];

for (const [file, expected] of Object.entries(protectedRoutes)) {
  const content = await readFile(resolve(root, file));
  const actual = createHash("sha256").update(content).digest("hex");
  if (actual !== expected) failures.push(`${file}: protected QR route changed`);
}

for (const page of pages) {
  const pagePath = resolve(root, page);
  const content = await readFile(pagePath, "utf8");
  if (!/<html\b[^>]*\blang="en"/i.test(content)) failures.push(`${page}: missing lang="en"`);
  if (!/<meta\b[^>]*name="viewport"/i.test(content)) failures.push(`${page}: missing viewport metadata`);
  if (!["404.html", "401.html"].includes(page) && !/<link\b[^>]*rel="canonical"/i.test(content)) failures.push(`${page}: missing canonical link`);

  const mains = content.match(/<main\b/gi) || [];
  if (mains.length !== 1) failures.push(`${page}: expected one main landmark, found ${mains.length}`);

  for (const match of content.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch {
      failures.push(`${page}: invalid JSON-LD`);
    }
  }

  for (const match of content.matchAll(/\b(?:href|src)="([^"]+)"/gi)) {
    const reference = match[1];
    if (/^(?:#|[a-z]+:|\/\/)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/, 1)[0];
    if (!clean) continue;
    let target = clean.startsWith("/") ? resolve(root, `.${clean}`) : resolve(dirname(pagePath), clean);
    if (clean.endsWith("/")) target = resolve(target, "index.html");
    try {
      await access(target);
    } catch {
      failures.push(`${page}: missing local target ${reference}`);
    }
  }

  for (const match of content.matchAll(/<a\b[^>]*href="#"[^>]*>/gi)) {
    if (!/\bid="(?:close|mobile-menu-trig)"/i.test(match[0])) failures.push(`${page}: placeholder link ${match[0]}`);
  }

  const ids = [...content.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) failures.push(`${page}: duplicate ids ${duplicateIds.join(", ")}`);

  if (/Visit\.html/.test(content)) failures.push(`${page}: uppercase Visit.html reference`);
}

for (const page of publicPages) {
  const content = await readFile(resolve(root, page), "utf8");
  const headings = content.match(/<h1\b/gi) || [];
  if (headings.length !== 1) failures.push(`${page}: expected one h1, found ${headings.length}`);
}

for (const page of controlPages) {
  const content = await readFile(resolve(root, page), "utf8");
  if (!/Barton Solutions Limited/.test(content)) failures.push(`${page}: legal operator missing`);
  if (!/Intuit and QuickBooks are registered trademarks of Intuit Inc\. Used with permission\./.test(content)) failures.push(`${page}: required Intuit trademark notice missing`);
  if (/LEGAL OPERATOR|REGISTERED OR PRINCIPAL|legal draft|must not be published/i.test(content)) failures.push(`${page}: unresolved legal placeholder or draft warning`);
  if (/quickbooks\.era\.food/i.test(content)) failures.push(`${page}: Intuit brand used in proposed host name`);
  if (/action=["']\/api\/quickbooks/i.test(content)) failures.push(`${page}: callback action incorrectly points at era.food`);
}

const privacyNotice = await readFile(resolve(root, "control/privacy-policy.html"), "utf8");
if (!/individual OpenAI account/.test(privacyNotice)) failures.push("control privacy: Personal-account boundary missing");
if (!/gra\.gi\/data-protection\/complaints/.test(privacyNotice)) failures.push("control privacy: GRA complaint route missing");
if (!/no later than 30 days afterward/.test(privacyNotice)) failures.push("control privacy: Codex retention limit missing");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${Object.keys(protectedRoutes).length} protected QR routes and ${pages.length} site pages, including ${controlPages.length} Control pages.`);
}
