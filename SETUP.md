# دليل تثبيت Node.js وتشغيل المشروع

## الخطوة 1: تثبيت Node.js

### للنوافذ (Windows):
1. انتقل إلى الموقع الرسمي: https://nodejs.org
2. حمّل النسخة LTS (الحالية v20.x أو v18.x)
3. شغّل ملف التثبيت واتبع التعليمات
4. أعد تشغيل PowerShell أو Command Prompt

### للتحقق من التثبيت:
```powershell
node --version
npm --version
```

## الخطوة 2: تثبيت حزم المشروع

بعد تثبيت Node.js، شغّل الأوامر التالية:

```powershell
# الانتقال لمجلد المشروع
cd "D:\AUDITOR-PRO\qaudit-pro"

# تثبيت جميع الحزم
npm install

# توليد عميل Prisma
npm run prisma:generate

# (اختياري) تزامن قاعدة البيانات إذا كانت PostgreSQL مُعدّة
npm run db:push
```

## الخطوة 3: تشغيل المشروع

```powershell
# تشغيل خادم التطوير
npm run dev
```

المشروع سيعمل على: http://localhost:3000

## استكشاف الأخطاء

### إذا واجهت مشكلة "node is not recognized":
1. تأكد من تثبيت Node.js بشكل صحيح
2. أعد تشغيل PowerShell
3. تحقق من متغيرات البيئة (Environment Variables)

### إذا فشل npm install:
```powershell
# مسح cache npm
npm cache clean --force

# حذف node_modules وإعادة التثبيت
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## الحزم المُحدّثة

### حزم التشغيل (Dependencies):
- **React**: 18.2.0 (مُحدّث من ^18)
- **Next.js**: 14.2.5 (ثابت)
- **Lucide React**: ^0.453.0 (مُحدّث من ^0.292.0)
- **Zod**: ^3.23.8 (مُحدّث من ^3.22.4)
- **React Hook Form**: ^7.52.0 (مُحدّث من ^7.47.0)
- **@hookform/resolvers**: ^3.9.0 (مُحدّث من ^3.3.2)
- **@prisma/client**: 5.19.0 (مُحدّث من ^5.6.0)

### حزم التطوير (DevDependencies):
- **TypeScript**: 5.4.2 (مُحدّث من ^5)
- **ESLint**: 8.57.0 (مُحدّث من ^8)
- **Tailwind CSS**: 3.4.10 (مُحدّث من ^3.3.0)
- **PostCSS**: 8.4.31 (مُحدّث من ^8)
- **Autoprefixer**: 10.4.17 (مُحدّث من ^10.0.1)
- **Prisma**: 5.19.0 (مُحدّث من ^5.6.0)
- **ts-node**: ^10.9.2 (جديد - مطلوب لـ TypeScript)