# QAudit Pro

نظام إدارة التدقيق الاحترافي المطور باستخدام Next.js وTypeScript.

## المميزات

- 🚀 تطبيق Next.js 14 مع App Router
- 💎 TypeScript للحصول على أمان الأنواع
- 🎨 Tailwind CSS للتصميم
- 🌍 دعم RTL للغة العربية
- 📱 تصميم متجاوب
- 🔒 نظام إدارة المستخدمين والصلاحيات
- 📊 إدارة شاملة لعمليات التدقيق

## البدء

### المتطلبات

- Node.js 18+ ([تحميل من هنا](https://nodejs.org))
- PostgreSQL 12+ (لقاعدة البيانات)

### ⚡ إعداد سريع

1. **تثبيت Node.js** (إذا لم يكن مثبتاً):
   - حمّل Node.js LTS من [nodejs.org](https://nodejs.org)
   - شغّل ملف التثبيت واتبع التعليمات
   - أعد تشغيل Terminal

2. **تثبيت المتطلبات:**

```bash
npm install
```

3. **إعداد قاعدة البيانات:**

   **خيار أ: باستخدام Docker (موصى به):**

   ```bash
   # إنشاء حاوية PostgreSQL
   docker run --name qauditpg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=qaudit_pro -p 5432:5432 -d postgres:16

   # إنشاء المستخدم والصلاحيات
   docker exec -it qauditpg psql -U postgres -c "CREATE USER qaudit_user WITH PASSWORD 'qaudit_pass_2024';"
   docker exec -it qauditpg psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE qaudit_pro TO qaudit_user;"
   docker exec -it qauditpg psql -U postgres -d qaudit_pro -c "GRANT ALL ON SCHEMA public TO qaudit_user;"
   ```

   **خيار ب: خدمة Windows المحلية:**

   ```powershell
   # فحص المنفذ
   Test-NetConnection 127.0.0.1 -Port 5432

   # تشغيل الخدمة إذا لم تكن تعمل
   services.msc # ← PostgreSQL → Start
   ```

   **تكوين متغيرات البيئة:**

   ```bash
   # نسخ وتحديث ملف البيئة
   cp .env.example .env
   # تأكد من أن DATABASE_URL في .env يحتوي على:
   # DATABASE_URL="postgresql://qaudit_user:qaudit_pass_2024@127.0.0.1:5432/qaudit_pro?schema=public"

   # توليد عميل Prisma
   npm run prisma:generate

   # تزامن قاعدة البيانات
   npm run db:push
   ```

4. **تشغيل خادم التطوير:**

```bash
npm run dev
```

5. افتح [http://localhost:3001](http://localhost:3001) في متصفحك.

## نظام المصادقة والتسجيل

المشروع يستخدم NextAuth.js مع قاعدة بيانات PostgreSQL:

- **صفحة تسجيل الدخول:** `/auth/login`
- **صفحة التسجيل:** `/auth/register` - ينشئ مستخدمين جدد في قاعدة البيانات
- **حماية المسارات:** تلقائية عبر Middleware
- **إدارة الجلسات:** JWT مع NextAuth.js
- **تشفير كلمات المرور:** bcrypt مع salt rounds = 10

### التدفق:

1. التسجيل: `/auth/register` → إنشاء مستخدم في DB مع كلمة مرور مشفرة
2. تسجيل الدخول: `/auth/login` → التحقق من البيانات مقابل قاعدة البيانات
3. الجلسة: JWT token مع معلومات المستخدم (role, locale)
4. الحماية: تحويل تلقائي إلى `/auth/login` للصفحات المحمية
5. الخروج: مسح JWT وإعادة التوجيه

### اختبار النظام:

**المستخدم التجريبي:**

- البريد: `test@test.com`
- كلمة المرور: `Passw0rd!`

**اختبارات إضافية:**

```bash
# فحص الاتصال بقاعدة البيانات
npx tsx scripts/quick-db-check.ts

# التحقق من وجود المستخدمين
npx tsx scripts/check-user-exists.ts

# اختبار تشفير كلمات المرور
npx tsx scripts/test-login.ts
```

# qaudit-pro

Documentation in SETUP.md

## 📄 دليل كتابة الكود

[CODESTYLE.md](docs/CODESTYLE.md)

## 🏗️ الهيكل المعماري

[ARCHITECTURE.md](docs/ARCHITECTURE.md)

## هيكل المشروع

```
qaudit-pro/
├── app/                 # صفحات التطبيق (App Router)
│   ├── (app)/          # مجموعة صفحات التطبيق
│   ├── api/            # API Routes
│   ├── globals.css     # ملفات CSS العامة
│   ├── layout.tsx      # Layout الرئيسي
│   ├── page.tsx        # الصفحة الرئيسية (تستورد AppShell)
│   └── shell/          # مكونات AppShell الأساسية
├── components/         # المكونات القابلة لإعادة الاستخدام
│   └── ui/            # مكونات واجهة المستخدم
├── features/          # نطاقات العمل (planning, execution, etc.)
├── lib/               # مكتبات مساعدة
├── prisma/            # مخططات قاعدة البيانات
└── public/            # الملفات الثابتة
```

## التقنيات المستخدمة

## المساهمة

المشروع قيد التطوير النشط. للمساهمة، يرجى:

1. عمل Fork للمستودع
2. إنشاء فرع جديد للميزة
3. إجراء التغييرات المطلوبة
4. إرسال Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
