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

### المتطلبات الأولية
- Node.js 18+ ([تحميل من هنا](https://nodejs.org))
- PostgreSQL 12+ (لقاعدة البيانات)

### التثبيت

1. **تثبيت Node.js** (إذا لم يكن مثبتاً):
   - حمّل Node.js LTS من [nodejs.org](https://nodejs.org)
   - شغّل ملف التثبيت واتبع التعليمات
   - أعد تشغيل Terminal

2. **تثبيت المتطلبات:**
```bash
npm install
```

3. **إعداد قاعدة البيانات:**
```bash
# نسخ ملف البيئة
cp .env.example .env
# حرّر .env وأضف DATABASE_URL الصحيح

# توليد عميل Prisma
npm run prisma:generate

# تزامن قاعدة البيانات
npm run db:push
```

4. **تشغيل خادم التطوير:**
```bash
npm run dev
```

5. افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

> **ملاحظة**: للحصول على دليل مفصل، راجع [SETUP.md](./SETUP.md)

## هيكل المشروع

```
qaudit-pro/
├── app/                 # صفحات التطبيق (App Router)
│   ├── (app)/          # مجموعة صفحات التطبيق
│   ├── api/            # API Routes
│   ├── globals.css     # ملفات CSS العامة
│   ├── layout.tsx      # Layout الرئيسي
│   └── page.tsx        # الصفحة الرئيسية
├── components/         # المكونات القابلة لإعادة الاستخدام
│   └── ui/            # مكونات واجهة المستخدم
├── features/          # نطاقات العمل (planning, execution, etc.)
├── lib/               # مكتبات مساعدة
├── prisma/            # مخططات قاعدة البيانات
└── public/            # الملفات الثابتة
```

## التقنيات المستخدمة

- **Next.js 14**: إطار عمل React مع App Router
- **TypeScript**: لغة البرمجة مع أمان الأنواع
- **Tailwind CSS**: إطار عمل CSS المساعد
- **Tailwind RTL**: دعم الكتابة من اليمين إلى اليسار
- **Prisma**: ORM لإدارة قاعدة البيانات
- **React Hook Form**: إدارة النماذج
- **Zod**: التحقق من صحة البيانات
- **Lucide React**: مكتبة الأيقونات

## المساهمة

المشروع قيد التطوير النشط. للمساهمة، يرجى:

1. عمل Fork للمستودع
2. إنشاء فرع جديد للميزة
3. إجراء التغييرات المطلوبة
4. إرسال Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.