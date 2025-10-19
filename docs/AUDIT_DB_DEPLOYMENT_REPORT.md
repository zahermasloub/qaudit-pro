# تقرير تصميم ونشر قاعدة بيانات لنظام "إدارة نشاط التدقيق الداخلي" (Windows / On‑Prem / Free)

## 0) سياق التقنية الحالية
- لغة ومنصة التطبيق: .NET 8 (قابل للتعديل)
- نمط التطبيق: Web API + Blazor
- بيئة التشغيل: Kestrel + IIS
- نظام التحكم بالنسخ: Git (GitHub/Azure DevOps)
- نمط المصادقة: Active Directory (AD) + محلي
- هل يوجد كود/جداول حالية؟ لا (بناء جديد)

## 1) المستخدمون والأحمال
- إجمالي المستخدمين: 30
- المتزامنون (Concurrent): 8
- ذروة العمليات/الدقيقة (قراءة/كتابة): 120R / 20W
- الشبكة ومواقع المستخدمين: LAN + VPN

## 2) الوحدات الوظيفية الأساسية
- تخطيط برامج التدقيق (سنوي/ربع سنوي)
- مهمات التدقيق (النطاق، إجراءات الاختبار، العينات)
- الأدلة والمرفقات (أنواع، أحجام، حدود)
- الملاحظات/التوصيات/إجراءات التصحيح والمتابعة
- إدارة المخاطر والضوابط
- سير العمل والموافقات (مستويات الاعتماد، SLA)
- التقارير ولوحات المتابعة (KPIs)
- تتبّع الاستخدام (Audit Trail) والامتثال

## 3) النموذج البياني وأحجام البيانات
- الكيانات الأساسية: Users, Roles, Teams, Audits, Engagements, Scopes, TestProcedures, Samples, Findings, Recommendations, Actions, Evidence, Risks, Controls, Orgs, Depts, Workflows, AuditLogs, AttachmentsMeta
- تقدير السجلات السنوي (min/avg/max):  Users: 2/5/10  Audits: 10/20/40  Engagements: 20/40/80  Evidence: 100/300/600  AttachmentsMeta: 200/500/1000
- النمو المتوقع لـ 3 و5 سنوات: نمو 20% سنويًا
- متوسط عدد/حجم المرفقات لكل مهمة: 5 ملفات × 2MB
- دعم العربية: ICU Collation (PostgreSQL) أو Arabic_CI_AI (SQL Server)

## 4) التكاملات الخارجية
- Active Directory: OU=Audit, Groups=AuditAdmins/AuditUsers
- أنظمة أرشفة/مراسلات: File Drop (مجلد مشترك)، HR عبر REST
- بروتوكولات: REST/File Drop
- متطلبات تدقيق التكامل: سجلات زمنية، سلامة البيانات

## 5) المتطلبات غير الوظيفية
- SLA: 99.9%، RPO: 1 ساعة، RTO: 2 ساعة
- التشفير: At‑Rest (BitLocker)، In‑Transit (TLS 1.2+)
- الحساسية/التصنيف: مقيد
- الامتثال: ISO 27001
- المراقبة والتنبيهات: مراقبة أخطاء الاتصال، حجم قاعدة البيانات، فشل النسخ الاحتياطي
- النسخ الاحتياطي/الاحتفاظ/الأرشفة: احتفاظ 3 سنوات، أرشفة سنوية
- قيود الترخيص والميزانية: صفر تكلفة لقاعدة البيانات

## 6) الاستعلامات والتقارير الحرجة
- أهم 10 تقارير (< 3 ثوانٍ):  سجل التدقيق الزمني  قائمة المهمات حسب الحالة  تقارير الأدلة والمرفقات  مؤشرات الأداء  سجل التوصيات والإجراءات  تقارير المخاطر  تتبع المستخدمين  تقارير العينات  تقارير الموافقات  ملخص البرامج السنوية
- الاستعلامات الثقيلة: Joins بين Audits/Engagements/Evidence، Aggregations على KPIs
- البحث النصي (عربي): دعم LIKE/ILIKE/Full Text
- SSRS/Power BI: اختياري، أو بديل مجاني مثل Metabase

## 7) البنية التحتية المحلية (On‑Prem)
- نوع الخوادم: افتراضي (VM)، 4 أنوية، 16GB RAM، 500GB SSD
- تخطيط الأقراص: OS/Logs/Data/Backups منفصلة
- إصدار Windows Server: 2022
- الشبكة والجدار الناري: فتح منفذ DB فقط داخليًا
- التدرّج: عمودي الآن، أفقي لاحقًا

---

## 8) مخرجات إلزامية للتسليم

### 1) توصية قاعدة بيانات مجانية
- PostgreSQL 16 (Windows Installer):  مجاني بالكامل، دعم UTF-8 والعربية، أداء قوي، أدوات نسخ احتياطي متقدمة، مجتمع واسع، دعم RLS وICU Collation.
  - حدود: لا يدعم Windows Auth مباشرة، يحتاج pgAdmin أو DBeaver.
- SQL Server 2022 Express:  مجاني حتى 10GB/DB، دعم Windows Auth وSSMS، أداء جيد، دعم FILESTREAM.
  - حدود: حجم قاعدة البيانات، بعض الميزات محدودة (Agent، CDC).

التوصية: PostgreSQL 16 إلا إذا كان مطلوبًا Windows Auth وSSMS، حينها SQL Server Express.

---

### 2) DDL كامل للكيانات الأساسية (PostgreSQL مثال)

```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    ad_guid UUID,
    role_id INT REFERENCES roles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    status VARCHAR(50),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    audit_id INT REFERENCES audits(id),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attachments_meta (
    id SERIAL PRIMARY KEY,
    evidence_id INT REFERENCES evidence(id),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    sha256 CHAR(64),
    uploaded_by INT REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    record_id INT,
    changed_by INT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    details JSONB
);

CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_evidence_audit_id ON evidence(audit_id);
CREATE INDEX idx_attachments_evidence_id ON attachments_meta(evidence_id);
```

---

### 3) تصميم الصلاحيات وربطها بـ AD
- أدوار: AuditAdmin, AuditUser, Viewer
- ربط المستخدمين بمجموعات AD عبر جدول users (حقل ad_guid)
- صلاحيات عبر RLS أو GRANT/REVOKE حسب الدور

---

### 4) استراتيجية المرفقات
- File Server + جدول Metadata + SHA‑256: بسيط، سهل النسخ الاحتياطي، لا يستهلك مساحة DB، دعم ملفات كبيرة.
- FILESTREAM/FileTable (SQL Server): تكامل مع DB، إدارة مركزية، حدود الحجم حسب Express.

الخيار المختار: File Server + Metadata + SHA‑256
خطوات التنفيذ:
1. مجلد مشترك على السيرفر
2. جدول attachments_meta
3. تخزين SHA‑256 لكل ملف
4. صلاحيات NTFS للمجلد

---

### 5) التتبع والتدقيق

```sql
CREATE OR REPLACE FUNCTION log_audit() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs(table_name, operation, record_id, changed_by, details)
  VALUES (TG_TABLE_NAME, TG_OP, NEW.id, NEW.changed_by, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 6) خطة النسخ الاحتياطي المجانية

```powershell
# backup_postgres.ps1
$PG_PATH = "C:\Program Files\PostgreSQL\16\bin"
$BACKUP_DIR = "D:\DBBackups"
$DATE = Get-Date -Format "yyyyMMdd_HHmm"
& "$PG_PATH\pg_basebackup.exe" -D "$BACKUP_DIR\$DATE" -Ft -z -U postgres -P
```

---

### 7) ضبط الأداء الأولي
- أحجام الملفات: data/log منفصلة
- Autogrowth: ضبط max_connections, shared_buffers=4GB, work_mem=64MB
- الفهارس: على الأعمدة المستخدمة في التقارير
- صيانة أسبوعية: VACUUM/REINDEX

---

### 8) سكربتات PowerShell للتثبيت والإعداد

```powershell
# install_postgres.ps1
$installer = "postgresql-16.0-windows-x64.exe"
$datadir = "D:\PostgresData"
$superpass = "StrongPass123"
Start-Process -FilePath $installer -ArgumentList "--mode unattended --superpassword '$superpass' --datadir '$datadir'" -Wait

Set-Content -Path "$datadir\postgresql.conf" -Value "listen_addresses = '*'"
Restart-Service postgresql-x64-16

Add-Content -Path "$datadir\postgresql.conf" -Value "shared_buffers = 4GB`nwork_mem = 64MB`nmaintenance_work_mem = 256MB"
Restart-Service postgresql-x64-16
```

---

### 9) نماذج استعلامات للتقارير الحرجة

```sql
SELECT * FROM audit_logs WHERE changed_at >= NOW() - INTERVAL '1 month';
SELECT e.id, e.description, a.file_name, a.file_path
FROM evidence e
JOIN attachments_meta a ON e.id = a.evidence_id
WHERE e.audit_id = 5;
SELECT COUNT(*) FROM audits WHERE status = 'Completed';
```

---

### 10) خطة ترحيل مستقبلية للسحابة
- توافق كامل مع Azure Database for PostgreSQL أو AWS RDS
- نقل البيانات عبر pg_dump/pg_restore
- توافق الميزات: RLS, Collation, Triggers مدعومة

---

### 11) مصفوفة مخاطر فنية وخطة تخفيف
| الخطر | التأثير | الاحتمالية | خطة التخفيف |
|-------|---------|------------|-------------|
| فقدان بيانات | عالي | منخفض | نسخ احتياطي يومي واختبار DR شهري |
| امتلاء القرص | متوسط | متوسط | مراقبة المساحة وتنبيه تلقائي |
| اختراق أمني | عالي | منخفض | تشفير، صلاحيات دقيقة، مراقبة |
| فشل تكامل AD | متوسط | منخفض | fallback للمصادقة المحلية |
| تعطل الخدمة | عالي | منخفض | خطة استعادة، مراقبة تلقائية |

---

## 9) جداول تلخيصية مطلوبة
| الكيان | Rows/Year | Avg Row Size | Storage/Year |
|--------|-----------|--------------|--------------|
| Users | 5 | 200B | 1KB |
| Audits | 20 | 500B | 10KB |
| Evidence | 300 | 1KB | 300KB |
| AttachmentsMeta | 500 | 200B | 100KB |

| الاستخدام | Reads/Hour | Writes/Hour | Heavy Queries/Hour |
|-----------|------------|-------------|-------------------|
| متوسط | 100 | 20 | 5 |

مصفوفة MoSCoW
| الميزة | Must | Should | Could | Won't |
|--------|------|--------|-------|-------|
| تدقيق زمني | X | | | |
| دعم العربية | X | | | |
| ربط AD | X | | | |
| دعم SSRS | | X | | |
| ترحيل سحابي | | | X | |

خريطة مجموعات AD إلى أدوار قاعدة البيانات
| مجموعة AD | دور DB |
|-----------|--------|
| AuditAdmins | AuditAdmin |
| AuditUsers | AuditUser |
| AuditViewers | Viewer |

---

## 10) افتراضات مبدئية
- قاعدة بيانات مجانية: PostgreSQL 16 (Windows Installer)
- تخزين المرفقات: File Server + Metadata + SHA‑256
- التقارير: SSRS أو Metabase
- التشفير: TLS 1.2/1.3، BitLocker
- الفهرسة: حسب أهم الاستعلامات

---

## 11) قائمة الملفات/الأكواد المطلوبة للتسليم
- audit_db_schema.sql (DDL كامل)
- install_postgres.ps1 (تثبيت وإعداد)
- backup_postgres.ps1 (نسخ احتياطي)
- settings.ini (إعدادات الاتصال)
- أمثلة تقارير .rdl (إن وُجد)
- docs/operation_guide.md (تشغيل وصيانة)
