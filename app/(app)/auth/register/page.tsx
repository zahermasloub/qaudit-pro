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
    role: 'User', // Default role
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
      role?: string;
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

    if (!formData.role) {
      newErrors.role = 'يرجى اختيار الصلاحية';
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
              className="text-right text-base px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="text-right text-base px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="text-right text-base px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="text-right text-base px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t.common.confirm}
            />

            {/* Role Selection Dropdown */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                نوع الحساب <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, role: e.target.value }));
                  if (errors.role) {
                    setErrors(prev => ({ ...prev, role: undefined }));
                  }
                }}
                className={`
                  w-full text-right text-base px-4 py-2 rounded-lg border
                  ${errors.role ? 'border-red-500' : 'border-gray-300'}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  bg-white
                `}
                required
              >
                <option value="">اختر نوع الحساب</option>
                <option value="Admin">مدير - صلاحيات كاملة (Admin)</option>
                <option value="User">مستخدم - صلاحيات محدودة (User)</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600 text-right">{errors.role}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 text-right">
                {formData.role === 'Admin'
                  ? '✓ المدير لديه صلاحيات كاملة للوصول إلى لوحة الإدارة وجميع الميزات'
                  : formData.role === 'User'
                  ? '✓ المستخدم لديه صلاحيات محدودة للوصول إلى الميزات الأساسية فقط'
                  : 'اختر نوع الحساب المناسب'}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 text-base rounded-lg font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
            >
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
