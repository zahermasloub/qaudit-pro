# CHECKLIST-Phase2.md
**قائمة تحقق بعد مرحلة Hardening & TLS & Password Rotation**

- [ ] تغيير كلمات المرور الافتراضية (postgres و app_user) وتخزينها بأمان.
- [ ] تمكين TLS/SSL في postgresql.conf و pg_hba.conf.
- [ ] اختبار الاتصال عبر psql مع sslmode=require والتأكد من current_setting('ssl') = 'on'.
- [ ] تحديث Connection Strings في التطبيق ليشمل Ssl Mode=Require أو VerifyFull مع CA.
- [ ] تقييد الجدار الناري للسيرفر على المنافذ والشبكات المسموح بها فقط.
- [ ] مراجعة pg_hba.conf للسماح فقط لشبكتنا الداخلية أو عناوين محددة.
- [ ] جدولة مهمة النسخ الاحتياطي ومراجعة مخرجاتها دوريًا.
- [ ] الاحتفاظ بنسخة من الشهادات وكلمات المرور في مكان آمن.
