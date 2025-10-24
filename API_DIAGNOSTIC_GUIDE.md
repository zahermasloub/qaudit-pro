# 🔍 دليل تشخيص API - PlanShell

## ✅ ما تم تنفيذه:

### 1. **تحديث `src/lib/api.ts`**
- ✅ إضافة دعم `NEXT_PUBLIC_API_BASE_URL` من متغيرات البيئة
- ✅ دالة `buildUrl()` لبناء URLs كاملة مع المعاملات
- ✅ إضافة `credentials: "include"` لإرسال الكوكيز والتصاريح
- ✅ Fallback للبيانات الوهمية في بيئة التطوير فقط
- ✅ دالة `generateMockRows()` لتوليد 2500 صف تجريبي
- ✅ معالجة أخطاء HTTP بشكل صحيح

### 2. **إنشاء `.env.local`**
- ✅ `NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"`
- ✅ إعدادات قاعدة البيانات والـ Auth
- ✅ تم توثيق جميع المتغيرات

### 3. **تحديث `PlanTable.tsx`**
- ✅ تحديث استدعاء `fetchPlanTasks` لاستخدام الصيغة الجديدة (object opts)

---

## 🛠️ نقاط التشخيص السريعة

### 1️⃣ فتح DevTools → Network Tab

```bash
# افتح المتصفح على: http://localhost:3001/shell
# افتح DevTools (F12) → Network
# راقب الطلبات للـ API
```

### 2️⃣ تحليل الأخطاء الشائعة:

#### ❌ **404 Not Found**
```
GET /api/annual-plans/sample-plan-2025 404
```
**الحل:**
- تأكد من وجود الـ API endpoint في `app/api/annual-plans/[id]/route.ts`
- تحقق من `planId` المستخدم في الطلب
- جرّب URL يدوياً في المتصفح

#### ❌ **401/403 Unauthorized**
```
GET /api/annual-plans/sample-plan-2025 401
```
**الحل:**
- تأكد من تسجيل الدخول
- افحص الكوكيز في DevTools → Application → Cookies
- تحقق من `credentials: "include"` في fetch
- راجع NextAuth session

#### ❌ **CORS Error**
```
Access to fetch at '...' from origin '...' has been blocked by CORS
```
**الحل:**
- إذا كان API على منفذ مختلف، أضف CORS headers في الـ API
- أو استخدم Next.js Proxy في `next.config.js`:
```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};
```

#### ❌ **500 Internal Server Error**
```
GET /api/annual-plans/sample-plan-2025 500
```
**الحل:**
- افحص logs الخادم في Terminal
- تحقق من اتصال قاعدة البيانات
- راجع `DATABASE_URL` في `.env.local`

---

## 🧪 اختبار يدوي للـ API

### في المتصفح:
```
http://localhost:3001/api/annual-plans/sample-plan-2025
```

### باستخدام cURL:
```powershell
curl http://localhost:3001/api/annual-plans/sample-plan-2025
```

### باستخدام PowerShell:
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/annual-plans/sample-plan-2025" -Method Get
```

---

## 📦 البيانات الوهمية (Fallback)

عند فشل الـ API في بيئة التطوير، ستظهر:
- ✅ 2500 صف تجريبي
- ✅ 4 أقسام مختلفة (الإدارة العامة، المالية، الموارد البشرية، تقنية المعلومات)
- ✅ 4 أنواع تدقيق (compliance, financial, operational, it-audit)
- ✅ توزيع على 4 أرباع سنوية (Q1-Q4)

**مثال على الصف:**
```json
{
  "id": "dev-1",
  "code": "T-001",
  "title": "مهمة تجريبية 1 - فحص الامتثال المالي",
  "dept": "الإدارة العامة",
  "type": "compliance",
  "start": "2025-Q1",
  "end": "2025-Q1"
}
```

---

## ⚙️ تعديل مسار الـ API

في `src/lib/api.ts`، يمكنك تغيير المسار حسب بنية API الخاصة بك:

```typescript
// الخيار 1: /api/plans/:id/tasks (مستحسن)
const path = `/api/plans/${opts.planId}/tasks`;

// الخيار 2: /api/annual-plans/:id (المستخدم حالياً)
const path = `/api/annual-plans/${opts.planId}`;

// الخيار 3: /v1/api/audits/:id/tasks
const path = `/v1/api/audits/${opts.planId}/tasks`;
```

---

## 🔐 متغيرات البيئة

### `.env.local` (التطوير):
```bash
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
```

### `.env.production` (الإنتاج):
```bash
NEXT_PUBLIC_API_BASE_URL="https://your-domain.com"
```

### للتعطيل (استخدام نفس المنفذ):
```bash
NEXT_PUBLIC_API_BASE_URL=""
# سيستخدم window.location.origin تلقائياً
```

---

## 🎯 الخطوات التالية:

1. ✅ افتح http://localhost:3001/shell
2. ✅ افتح DevTools → Network
3. ✅ راقب طلب `/api/annual-plans/sample-plan-2025`
4. ✅ إذا ظهر 404، جرّب الـ URL يدوياً في المتصفح
5. ✅ إذا ظهرت بيانات، فالـ fallback يعمل بنجاح!
6. ✅ عند إصلاح الـ API، ستظهر البيانات الحقيقية تلقائياً

---

## 📝 ملاحظات مهمة:

⚠️ **الـ Fallback للتطوير فقط:**
```typescript
if (process.env.NODE_ENV === 'development') {
  // بيانات وهمية
}
```

⚠️ **في الإنتاج:** سيتم رمي الخطأ مباشرة بدون fallback

⚠️ **إعادة التشغيل مطلوبة:** بعد تعديل `.env.local`، أعد تشغيل `npm run dev`

---

## 📊 Console Output المتوقع:

### عند نجاح الـ API:
```
✅ لا توجد رسائل في Console
✅ البيانات تظهر مباشرة في الجدول
```

### عند فشل الـ API (Development):
```
⚠️ fetchPlanTasks fallback to mock data due to: Error: HTTP 404: Not Found
✅ البيانات الوهمية تظهر في الجدول
✅ الواجهة تعمل بدون توقف
```

### عند فشل الـ API (Production):
```
❌ Error: Failed to fetch tasks
❌ رسالة خطأ تظهر للمستخدم
```

---

**تاريخ الإنشاء:** 2025-10-24  
**الإصدار:** 1.0.0
