'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const t = useI18n('ar'); // Default to Arabic with RTL
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = t.common.required;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.common.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.common.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
        callbackUrl: "/shell"
      });

      if (res?.ok) {
        router.push("/shell");
      } else {
        setErrors({ password: 'بيانات غير صحيحة' });
      }
    } catch (error) {
      setErrors({ password: 'حدث خطأ في تسجيل الدخول' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t.auth.signin}
          </h2>
        </div>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t.common.email}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              required
              className="text-right"
              placeholder={t.common.email}
            />

            <Input
              label={t.common.password}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
              className="text-right"
              placeholder={t.common.password}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {t.auth.forgot}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? t.common.loading : t.auth.signin}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {t.auth.noAccount}{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t.auth.signup}
                </Link>
              </span>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
