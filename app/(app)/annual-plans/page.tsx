'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AnnualPlan = {
  id: string;
  title: string;
  fiscalYear: number;
  status: string;
  totalAvailableHours: number;
};

export default function AnnualPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<AnnualPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/annual-plans')
      .then((res) => res.json())
      .then((data) => {
        setPlans(data.plans || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">جاري تحميل الخطط السنوية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">الخطط السنوية</h1>
          <p className="text-slate-600">اختر خطة لعرض التفاصيل وإدارة المهام</p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-500 mb-4">لا توجد خطط سنوية متاحة</p>
            <Link
              href="/shell"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة إلى لوحة التحكم
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Link
                key={plan.id}
                href={`/annual-plans/${plan.id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 hover:border-blue-400"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{plan.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>السنة المالية: {plan.fiscalYear}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">الحالة:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        plan.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : plan.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {plan.status === 'approved'
                        ? 'معتمدة'
                        : plan.status === 'draft'
                          ? 'مسودة'
                          : plan.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">الساعات المتاحة:</span>
                    <span className="font-semibold text-slate-900">
                      {plan.totalAvailableHours.toLocaleString()} ساعة
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm text-blue-600 font-semibold">
                    <span>عرض التفاصيل</span>
                    <span>←</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/shell"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>←</span>
            <span>العودة إلى لوحة التحكم</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
