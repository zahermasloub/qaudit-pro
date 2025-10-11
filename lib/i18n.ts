const I18N = {
  ar: {
    app: {
      title: "نظام التدقيق الاحترافي"
    },
    auth: {
      signin: "تسجيل الدخول",
      signup: "إنشاء حساب",
      forgot: "نسيت كلمة المرور؟",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب؟",
      logout: "تسجيل خروج"
    },
    menu: {
      dashboard: "لوحة القيادة",
      planning: "1) التخطيط",
      processRisk: "2) فهم العملية والمخاطر",
      program: "3) البرنامج والعينات",
      fieldwork: "4) الأعمال الميدانية والأدلة",
      agile: "5) اللمسات الرشيقة",
      findings: "6) النتائج",
      reporting: "7) التقرير",
      followup: "8) المتابعة",
      closeout: "9) الإقفال",
      qa: "ضمان الجودة"
    },
    actions: {
      newEngagement: "مهمة جديدة",
      exportCSV: "تصدير CSV",
      refresh: "تحديث",
      createPlan: "إنشاء خطة",
      newPBC: "طلب PBC جديد",
      importCSV: "استيراد CSV",
      addRisk: "إضافة مخاطر",
      addControl: "إضافة ضابط",
      linkTest: "ربط اختبار",
      newTest: "اختبار جديد",
      assignOwner: "تعيين مسؤول",
      drawSample: "سحب عينة",
      recalcHash: "إعادة حساب Hash",
      importPopulation: "استيراد مجتمع",
      uploadEvidence: "رفع دليل",
      scanAV: "فحص الفيروسات",
      linkEvidence: "ربط دليل",
      standUp: "Stand-up",
      sprintLog: "سجل Sprint",
      newFinding: "ملاحظة جديدة",
      genCCER: "توليد C-C-E-R",
      preview: "معاينة",
      exportPDF: "تصدير PDF",
      sendToSign: "إرسال للتوقيع",
      newCheck: "فحص جديد",
      remindOwners: "تذكير الملاك",
      followupReport: "تقرير متابعة",
      closeFile: "إقفال الملف",
      qaReview: "مراجعة الجودة"
    },
    sections: {
      planning: "التخطيط وطلبات PBC",
      processRisk: "خرائط العملية وإدارة المخاطر",
      program: "برنامج الاختبارات والعينات",
      fieldwork: "تنفيذ الإجراءات والأدلة",
      agile: "لوحة Sprint والمتابعة الرشيقة",
      findings: "تحرير النتائج والتوصيات",
      reporting: "بناء التقرير النهائي",
      followup: "تتبع الإجراءات التصحيحية",
      closeout: "إقفال الملف",
      qa: "مراجعة الجودة الداخلية"
    },
    common: {
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      name: "الاسم",
      confirm: "تأكيد كلمة المرور",
      submit: "إرسال",
      loading: "جاري التحميل...",
      required: "هذا الحقل مطلوب",
      emailInvalid: "البريد الإلكتروني غير صحيح",
      passwordMismatch: "كلمات المرور غير متطابقة",
      search: "بحث...",
      notifications: "الإشعارات",
      accessDenied: "الوصول مرفوض للدور:"
    }
  },
  en: {
    app: {
      title: "Professional Audit System"
    },
    auth: {
      signin: "Sign in",
      signup: "Create account",
      forgot: "Forgot password?",
      alreadyHaveAccount: "Already have an account?",
      noAccount: "Don't have an account?",
      logout: "Logout"
    },
    menu: {
      dashboard: "Dashboard",
      planning: "1) Planning",
      processRisk: "2) Process & Risk",
      program: "3) Program & Sampling",
      fieldwork: "4) Fieldwork & Evidence",
      agile: "5) Agile Touchpoints",
      findings: "6) Findings",
      reporting: "7) Reporting",
      followup: "8) Follow-up",
      closeout: "9) Closeout",
      qa: "Quality Assurance"
    },
    actions: {
      newEngagement: "New Engagement",
      exportCSV: "Export CSV",
      refresh: "Refresh",
      createPlan: "Create Plan",
      newPBC: "New PBC Request",
      importCSV: "Import CSV",
      addRisk: "Add Risk",
      addControl: "Add Control",
      linkTest: "Link Test",
      newTest: "New Test",
      assignOwner: "Assign Owner",
      drawSample: "Draw Sample",
      recalcHash: "Recalc Hash",
      importPopulation: "Import Population",
      uploadEvidence: "Upload Evidence",
      scanAV: "Scan AV",
      linkEvidence: "Link Evidence",
      standUp: "Stand-up",
      sprintLog: "Sprint Log",
      newFinding: "New Finding",
      genCCER: "Generate C-C-E-R",
      preview: "Preview",
      exportPDF: "Export PDF",
      sendToSign: "Send to Sign",
      newCheck: "New Check",
      remindOwners: "Remind Owners",
      followupReport: "Follow-up Report",
      closeFile: "Close File",
      qaReview: "QA Review"
    },
    sections: {
      planning: "Planning & PBC Requests",
      processRisk: "Process Maps & Risk Management",
      program: "Test Program & Sampling",
      fieldwork: "Fieldwork Procedures & Evidence",
      agile: "Sprint Board & Agile Touchpoints",
      findings: "Findings & Recommendations",
      reporting: "Final Report Building",
      followup: "Corrective Action Tracking",
      closeout: "File Closeout",
      qa: "Internal Quality Assurance"
    },
    common: {
      email: "Email",
      password: "Password",
      name: "Name",
      confirm: "Confirm password",
      submit: "Submit",
      loading: "Loading...",
      required: "This field is required",
      emailInvalid: "Invalid email address",
      passwordMismatch: "Passwords do not match",
      search: "Search...",
      notifications: "Notifications",
      accessDenied: "Access denied for role:"
    }
  }
} as const;

export type Locale = 'ar' | 'en';
export type I18nKeys = typeof I18N;

export function useI18n(locale: Locale = 'ar') {
  return I18N[locale];
}

export { I18N };
