import crypto from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

const dir = "./reports";
const files = readdirSync(dir)
  .filter(f => f.endsWith(".json") && f !== "summary.json");

const phases = files.map(file => {
  const full = `${dir}/${file}`;
  const raw = readFileSync(full, "utf8");
  const size = statSync(full).size;
  const hash = sha256(raw);
  return { file, size, sha256: hash, ...JSON.parse(raw) };
});

const out = {
  generated_at: new Date().toISOString(),
  phases,
  aggregate_sha256: sha256(JSON.stringify(phases)),
  files_count: phases.length
};

const toStdout = process.argv.includes("--stdout");
if (toStdout) {
  console.log(JSON.stringify(out, null, 2));
} else {
  (async () => {
    writeFileSync(`${dir}/summary.json`, JSON.stringify(out, null, 2));
    console.log(`[aggregate] wrote ${dir}/summary.json (${out.files_count} files)`);
  })();
}
