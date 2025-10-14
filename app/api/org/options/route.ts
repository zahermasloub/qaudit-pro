export async function GET() {
  return Response.json({
    ok: true,
    items: [
      {
        id: "FIN",
        name: "الإدارة المالية",
        depts: [
          { id: "AR", name: "الحسابات" },
          { id: "TR", name: "الخزينة" }
        ]
      },
      {
        id: "HR",
        name: "إدارة الموارد البشرية",
        depts: [
          { id: "RE", name: "التوظيف" },
          { id: "PY", name: "الرواتب" }
        ]
      },
      {
        id: "IT",
        name: "تقنية المعلومات",
        depts: [
          { id: "DEV", name: "التطوير" },
          { id: "SEC", name: "أمن المعلومات" }
        ]
      },
      {
        id: "OPS",
        name: "العمليات",
        depts: [
          { id: "LOG", name: "اللوجستيات" },
          { id: "QA", name: "ضمان الجودة" }
        ]
      }
    ]
  });
}
