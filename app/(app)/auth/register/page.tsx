'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import Card from '@/components/ui/Card-v2';
import Input from '@/components/ui/Input-v2';
import { useI18n } from '@/lib/i18n';

export default function RegisterPage() {
  const router = useRouter();
  const t = useI18n('ar'); // Default to Arabic with RTL
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User',
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.name.trim()) {
      newErrors.name = t.common.required;
    }

    if (!formData.email) {
      newErrors.email = t.common.required;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.common.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.common.required;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.common.required;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.common.passwordMismatch;
    }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        // Success - redirect to login
        router.push('/auth/login?message=registration_success');
      } else {
        // Handle error
        if (result.error === 'user_exists') {
          setErrors({ email: 'البريد الإلكتروني مستخدم بالفعل' });
        } else if (result.error === 'invalid_email_format') {
          setErrors({ email: 'تنسيق البريد الإلكتروني غير صحيح' });
        } else if (result.error === 'password_too_short') {
          setErrors({ password: 'كلمة المرور قصيرة جداً' });
        } else {
          setErrors({ name: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ name: 'حدث خطأ في الشبكة، يرجى المحاولة مرة أخرى' });
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
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      dir="rtl"
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">{t.auth.signup}</h2>
        </div>

        <Card className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <Input
              label={t.common.name}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
              className="text-right"
              placeholder={t.common.name}
            />

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

            <div>
              <label className="block text-sm font-medium mb-1">الصلاحية</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-right"
                required
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>

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

            <Input
              label={t.common.confirm}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={errors.confirmPassword}
              required
              className="text-right"
              placeholder={t.common.confirm}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? t.common.loading : t.auth.signup}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                {t.auth.alreadyHaveAccount}{' '}
                <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                  {t.auth.signin}
                </Link>
              </span>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
