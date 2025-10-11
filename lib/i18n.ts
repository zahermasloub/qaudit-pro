const I18N = {
  ar: {
    app: { title: "نظام التدقيق الداخلي" },
    auth: {
      signin: "تسجيل الدخول",
      signup: "إنشاء حساب",
      forgot: "نسيت كلمة المرور؟",
      logout: "خروج",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب؟"
    },
    menu: {
      dashboard: "لوحة القيادة",
      planning: "1) التخطيط",
      processRisk: "2) فهم العملية والمخاطر",
      program: "3) برنامج العمل والعينات",
      fieldwork: "4) الأعمال الميدانية والأدلة",
      agile: "5) اللمسات الرشيقة",
      findings: "6) النتائج والتوصيات",
      reporting: "7) التقرير النهائي",
      followup: "8) المتابعة",
      closeout: "9) الإقفال",
      qa: "ضمان الجودة"
    },
    actions: {
      newEng: "إنشاء مهمة", exportCSV: "تصدير CSV", refresh: "تحديث",
      createPlan: "إنشاء خطة", addMilestone: "إضافة مرحلة", addTask: "إضافة مهمة",
      newPBC: "طلب جديد", importCSV: "استيراد CSV",
      addRisk: "إضافة خطر", addControl: "إضافة ضابط", linkTest: "ربط اختبار",
      newTest: "اختبار جديد", assignOwner: "تعيين مسؤول",
      drawSample: "سحب عيّنة", recalcHash: "إعادة حساب Hash", importPopulation: "استيراد مجتمع",
      uploadEv: "رفع دليل", scanAV: "فحص فيروسات", linkTo: "ربط بعينة/اختبار",
      newFinding: "ملاحظة جديدة", genCCER: "توليد C-C-E-R",
      preview: "معاينة", exportPDF: "تصدير PDF", sendSign: "إرسال للتوقيع",
      newCheck: "تحقق جديد", remindOwners: "تذكير الملاك", followReport: "تقرير متابعة",
      closeFile: "إقفال الملف", qaReview: "مراجعة جودة"
    },
    sections: {
      planning: "الخطة ومهام PBC",
      processRisk: "خرائط العملية و RCM",
      program: "برنامج الاختبارات والعينات",
      fieldwork: "تنفيذ الإجراءات والأدلة",
      agile: "لوحة Sprint / Stand-up",
      findings: "تحرير النتائج والتوصيات",
      reporting: "بناء التقرير النهائي",
      followup: "تعقّب الإجراءات التصحيحية",
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
      search: "بحث…",
      lead: "القائد",
      status: "الحالة",
      alerts: "إشعارات",
      accessDenied: "ممنوع الوصول للدور",
      comingSoon: "قريباً..."
    }
  },
  en: {
    app: { title: "Internal Audit Suite" },
    auth: {
      signin: "Sign in",
      signup: "Create account",
      forgot: "Forgot password?",
      logout: "Logout",
      alreadyHaveAccount: "Already have an account?",
      noAccount: "Don't have an account?"
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
      qa: "QA"
    },
    actions: {
      newEng: "New Engagement", exportCSV: "Export CSV", refresh: "Refresh",
      createPlan: "Create Plan", addMilestone: "Add Milestone", addTask: "Add Task",
      newPBC: "New Request", importCSV: "Import CSV",
      addRisk: "Add Risk", addControl: "Add Control", linkTest: "Link Test",
      newTest: "New Test", assignOwner: "Assign Owner",
      drawSample: "Draw Sample", recalcHash: "Recalc Hash", importPopulation: "Import Population",
      uploadEv: "Upload Evidence", scanAV: "Scan AV", linkTo: "Link to Sample/Test",
      newFinding: "New Finding", genCCER: "Generate C-C-E-R",
      preview: "Preview", exportPDF: "Export PDF", sendSign: "Send to Sign",
      newCheck: "New Check", remindOwners: "Remind Owners", followReport: "Follow-up Report",
      closeFile: "Close File", qaReview: "QA Review"
    },
    sections: {
      planning: "Plan & PBC",
      processRisk: "Process maps & RCM",
      program: "Test program & sampling",
      fieldwork: "Procedures & evidence",
      agile: "Sprint / Stand-up board",
      findings: "Findings & recommendations",
      reporting: "Final report",
      followup: "Action plans",
      closeout: "File closeout",
      qa: "Internal QA"
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
      search: "Search…",
      lead: "Lead",
      status: "Status",
      alerts: "Alerts",
      accessDenied: "Access denied for role",
      comingSoon: "Coming soon..."
    }
  }
} as const;

export type Locale = 'ar' | 'en';
export type I18nKeys = typeof I18N;

export function useI18n(locale: Locale = 'ar') {
  return I18N[locale];
}

export { I18N };
