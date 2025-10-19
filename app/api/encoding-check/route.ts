import { json } from "@/app/api/_lib/json";
export async function GET() {
  return json({
    ok: true,
    text: "اختبار واجهة برمجية – العربية تظهر دون ?????",
    now: new Date().toISOString(),
  });
}
