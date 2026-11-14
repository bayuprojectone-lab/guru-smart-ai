#!/usr/bin/env node
/**
 * Build Tailwind CSS locally for GURU SMART AI.
 * Run: npm install && npm run build:css
 */
const fs = require("node:fs");
const path = require("node:path");
const tailwindcss = require("tailwindcss");

const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "src", "tailwind.input.css");
const outputPaths = [
  path.join(root, "assets", "tailwind.css"),
  path.join(root, "public", "assets", "tailwind.css"),
];

function collectSources(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectSources(full, output);
    else if (/\.(html|js)$/.test(entry.name) && !full.includes(`${path.sep}scripts${path.sep}`)) {
      output.push(full);
    }
  }
  return output;
}

function collectCandidates() {
  const candidates = new Set();
  const tokenPattern = /[^\s"'`<>]+/g;
  const allowed = /^[A-Za-z0-9_:/.[\]#%!,()-]+$/;
  for (const file of collectSources(root)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(tokenPattern)) {
      const token = match[0].replace(/^[(){};,]+|[(){};,]+$/g, "");
      if (token.length > 1 && token.length <= 120 && allowed.test(token) && /[a-zA-Z]/.test(token)) {
        candidates.add(token);
      }
    }
  }
  return [...candidates];
}

async function main() {
  const compiler = await tailwindcss.compile(fs.readFileSync(inputPath, "utf8"), {
    base: root,
    loadStylesheet: async (id, base) => {
      let file;
      if (id === "tailwindcss") file = require.resolve("tailwindcss/index.css");
      else {
        try { file = require.resolve(id, { paths: [base, root] }); }
        catch { file = path.resolve(base, id); }
      }
      return { path: file, base: path.dirname(file), content: fs.readFileSync(file, "utf8") };
    },
  });
  const css = compiler.build(collectCandidates());
  for (const output of outputPaths) {
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, css);
  }
  console.log(`Tailwind CSS selesai dibuat: ${Buffer.byteLength(css)} byte`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
