const I18N = {
  ar: {
    auth: {
      signin: "تسجيل الدخول",
      signup: "إنشاء حساب",
      forgot: "نسيت كلمة المرور؟",
      alreadyHaveAccount: "لديك حساب بالفعل؟",
      noAccount: "ليس لديك حساب؟"
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
      passwordMismatch: "كلمات المرور غير متطابقة"
    }
  },
  en: {
    auth: {
      signin: "Sign in",
      signup: "Create account",
      forgot: "Forgot password?",
      alreadyHaveAccount: "Already have an account?",
      noAccount: "Don't have an account?"
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
      passwordMismatch: "Passwords do not match"
    }
  }
} as const;

export type Locale = 'ar' | 'en';
export type I18nKeys = typeof I18N;

export function useI18n(locale: Locale = 'ar') {
  return I18N[locale];
}

export { I18N };
