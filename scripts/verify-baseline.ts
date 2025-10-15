import { execSync } from "node:child_process";

function run(command: string) {
  execSync(command, { stdio: "inherit" });
}

function main() {
  const startedAt = new Date().toISOString();
  console.log(`[verify-baseline] start: ${startedAt}`);
  try {
    run("pnpm lint"); // لا نفشل على التحذيرات (كما وثّقت)
    run("pnpm build"); // يحترم إعدادات next.config.js
    run("pnpm exec prisma validate");
    console.log("[verify-baseline] BASELINE_OK");
    process.exit(0);
  } catch {
    console.error("[verify-baseline] BASELINE_FAILED");
    process.exit(1);
  }
}

main();
