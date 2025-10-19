README_PHASE3.txt
==================

ملخص خطوات التشغيل الجذري لتطبيق Phase 3 على قاعدة بيانات PostgreSQL 18:

1. توليد تقرير المطابقة:
   pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"

2. تنفيذ التسلسل الكامل (الحل الجذري):
   pwsh -NoProfile -ExecutionPolicy Bypass -File .\apply_full_phase3.ps1

3. تحديث الـMV يدويًا:
   pwsh -NoProfile -ExecutionPolicy Bypass -File .\refresh_mv.ps1

4. (اختياري) خطة ترحيل ديناميكية:
   pwsh -NoProfile -ExecutionPolicy Bypass -File .\plan_and_apply_core_migration.ps1
   أو مع التنفيذ:
   pwsh -NoProfile -ExecutionPolicy Bypass -File .\plan_and_apply_core_migration.ps1 -Execute

المخرجات:
---------
- تقارير المطابقة: C:\Temp\CoreAlignment\db_compare_report.json و db_compare_report.md
- لوج التنفيذ الكامل: C:\Temp\CoreAlignment\apply_full_phase3.log
- تقرير التحقق النهائي: C:\Temp\CoreAlignment\verify_phase3_report.txt

ملاحظات مهمة:
-------------
- جميع السكربتات idempotent وآمنة للإعادة، ولا تستخدم DROP.
- كل SQL يبدأ بـ: \c auditdb ثم SET search_path TO core, public;
- تفعيل RLS: يجب على التطبيق بعد المصادقة تنفيذ SET app.user_id = '<user_id>' لكل اتصال.
- لا تخزن كلمات مرور نصية في users.password_hash، بل استخدم hash فقط.
- أي خطأ في التنفيذ سيوقف التسلسل ويطبع رسالة واضحة مع اقتراح الإجراء اليدوي.
- جميع المسارات، كلمات المرور، المنافذ، والخدمة مطابقة للبيئة الفعلية.
