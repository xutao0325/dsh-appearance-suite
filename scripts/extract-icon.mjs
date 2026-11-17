import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = readFileSync(root + "/lib/client.js", "utf8");
const m = src.match(/var MARKET_SVG = "((?:[^"\\]|\\.)*)";/);
if (!m) throw new Error("MARKET_SVG not found");
const svg = m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
mkdirSync(root + "/assets", { recursive: true });
writeFileSync(root + "/assets/icon.svg", svg);
console.log("wrote assets/icon.svg", svg.length);
