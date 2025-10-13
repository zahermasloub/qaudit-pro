# Prisma Database Setup Guide

## إعداد قاعدة البيانات

### المتطلبات الأولية

- PostgreSQL 12+ مثبت ومُشغّل
- Node.js 18+
- npm أو yarn

### خطوات الإعداد

1. **تثبيت PostgreSQL وإنشاء قاعدة البيانات:**

```sql
-- الاتصال بـ PostgreSQL كمستخدم admin
CREATE DATABASE qaudit_pro;
CREATE USER qaudit_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE qaudit_pro TO qaudit_user;
```

2. **تكوين متغيرات البيئة:**

```bash
# نسخ ملف المثال
cp .env.example .env

# تحرير ملف .env وتحديث DATABASE_URL
DATABASE_URL="postgresql://qaudit_user:your_password_here@localhost:5432/qaudit_pro?schema=public"
```

3. **تثبيت التبعيات:**

```bash
npm install
```

4. **توليد عميل Prisma:**

```bash
npm run prisma:generate
```

5. **تزامن قاعدة البيانات:**

```bash
npm run db:push
```

6. **التحقق من النتيجة (اختياري):**

```bash
npm run prisma:studio
```

## النماذج المُعرّفة

### Engagement (المشاريع)

- **id**: معرّف فريد
- **code**: رمز المشروع (فريد)
- **title**: عنوان المشروع
- **objective**: الهدف
- **scopeJson**: نطاق العمل (JSON)
- **criteriaJson**: المعايير (JSON)
- **constraintsJson**: القيود (JSON)
- **auditeeUnitsJson**: الوحدات المُدققة (JSON)
- **stakeholdersJson**: أصحاب المصلحة (JSON)
- **startDate** & **endDate**: تواريخ البداية والنهاية
- **budgetHours**: الساعات المخططة
- **independenceDisclosureUrl**: رابط إقرار الاستقلالية
- **status**: الحالة (planned, in_progress, completed, cancelled)
- **createdBy**: المنشئ
- **createdAt** & **updatedAt**: تواريخ الإنشاء والتحديث

### Plan (الخطط)

- **id**: معرّف فريد
- **engagementId**: مرجع للمشروع
- **timelineJson**: الجدول الزمني (JSON)
- **milestonesJson**: المعالم (JSON)
- **communicationCadence**: وتيرة التواصل
- **dataStrategyJson**: استراتيجية البيانات (JSON)
- **raciJson**: مصفوفة RACI (JSON)

### PBCRequest (طلبات البيانات)

- **id**: معرّف فريد
- **engagementId**: مرجع للمشروع
- **code**: رمز الطلب
- **description**: وصف الطلب
- **ownerId**: المسؤول عن الطلب
- **dueDate**: تاريخ الاستحقاق
- **status**: الحالة (open, in_progress, completed, overdue)
- **attachmentsJson**: المرفقات (JSON)
- **notes**: ملاحظات إضافية

## الأوامر المفيدة

```bash
# إعادة توليد العميل
npm run prisma:generate

# تزامن Schema مع قاعدة البيانات (Development)
npm run db:push

# إنشاء Migration جديدة (Production)
npm run db:migrate

# فتح Prisma Studio
npm run prisma:studio

# إعادة تعيين قاعدة البيانات (حذر!)
npx prisma migrate reset
```

## استخدام النماذج في الكود

```typescript
import { prisma } from '@/lib/prisma';

// إنشاء مشروع جديد
const engagement = await prisma.engagement.create({
  data: {
    code: 'AUD-2024-001',
    title: 'تدقيق النظام المالي',
    objective: 'التأكد من دقة التقارير المالية',
    // ... باقي البيانات
  },
});

// الحصول على مشروع مع الخطط والطلبات
const engagementWithRelations = await prisma.engagement.findUnique({
  where: { id: 'engagement-id' },
  include: {
    plans: true,
    pbcRequests: true,
  },
});
```

## استكشاف الأخطاء

1. **خطأ الاتصال بقاعدة البيانات:**
   - تأكد من تشغيل PostgreSQL
   - تحقق من صحة DATABASE_URL في .env

2. **خطأ Prisma Client not generated:**

   ```bash
   npm run prisma:generate
   ```

3. **خطأ في Schema:**
   - تحقق من صحة prisma/schema.prisma
   - تأكد من تطابق أنواع البيانات
