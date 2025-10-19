[WHAT]
هذه الحزمة تفحص مشروعك وقاعدة PostgreSQL 18، وتوحد الجداول ضمن مخطط core، وتصلّح الفروقات (بدون DROP)، ثم تطبق Phase 3 (Schema + Views + RLS) وتتحقق.

[HOW]
1) pwsh -NoProfile -ExecutionPolicy Bypass -File .\apply_full_phase3.ps1
2) راجع اللوج: C:\Temp\CoreAlignment\apply_full_phase3.log
3) لتحديث الـMV يدويًا: pwsh -NoProfile -ExecutionPolicy Bypass -File .\refresh_mv.ps1

[NOTES]
- كل SQL يبدأ بـ \c auditdb و SET search_path TO core, public.
- لا تُخزن كلمات المرور نصًا صريحًا في users، فقط password_hash (argon2id/bcrypt).
- من التطبيق، مرِّر SET app.user_id='<USER_ID>' بعد المصادقة لاستخدام RLS.
