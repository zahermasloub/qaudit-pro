'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalSettings: 0,
    recentLogs: 0,
  });

  useEffect(() => {
    // Fetch stats (simplified for now)
    async function fetchStats() {
      try {
        const [users, roles, settings] = await Promise.all([
          fetch('/api/admin/users').then(r => r.json()),
          fetch('/api/admin/roles').then(r => r.json()),
          fetch('/api/admin/settings').then(r => r.json()),
        ]);
        setStats({
          totalUsers: users.users?.length || 0,
          totalRoles: roles.roles?.length || 0,
          totalSettings: settings.items?.length || 0,
          recentLogs: 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container-shell">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">لوحة أدمن</h1>
        <p className="text-gray-600">نظرة عامة على النظام والمستخدمين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">الأدوار</div>
          <div className="text-3xl font-bold text-green-600">{stats.totalRoles}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">الإعدادات</div>
          <div className="text-3xl font-bold text-purple-600">{stats.totalSettings}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">السجلات الأخيرة</div>
          <div className="text-3xl font-bold text-orange-600">{stats.recentLogs}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">الوصول السريع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <a
            href="/admin/users"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium text-gray-800">إدارة المستخدمين</div>
            <div className="text-sm text-gray-600 mt-1">عرض وإدارة المستخدمين</div>
          </a>

          <a
            href="/admin/roles"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <div className="font-medium text-gray-800">الأدوار والصلاحيات</div>
            <div className="text-sm text-gray-600 mt-1">تعيين الصلاحيات</div>
          </a>

          <a
            href="/admin/settings"
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <div className="font-medium text-gray-800">الإعدادات</div>
            <div className="text-sm text-gray-600 mt-1">تكوين النظام</div>
          </a>

          <a
            href="/admin/logs"
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
          >
            <div className="font-medium text-gray-800">سجلات النشاط</div>
            <div className="text-sm text-gray-600 mt-1">مراقبة النشاط</div>
          </a>

          <a
            href="/admin/backups"
            className="p-4 border border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            <div className="font-medium text-gray-800">النسخ الاحتياطية</div>
            <div className="text-sm text-gray-600 mt-1">إدارة النسخ</div>
          </a>
        </div>
      </div>
    </div>
  );
}
