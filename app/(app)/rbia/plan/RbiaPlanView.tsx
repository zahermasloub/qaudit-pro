'use client';
import React, { useState, useEffect, useMemo } from 'react';
import KpiCards from '../../../(components)/KpiCards';
import ProcessStepper, { ProcessStep } from './ProcessStepper';
import CreatePlanWizard from './CreatePlanWizard';
import { toast } from 'sonner';
import { Search, Download, Eye, Edit2, Trash2, Plus } from 'lucide-react';

interface PlanItem {
  id: string;
  code: string;
  title: string;
  department: string;
  risk_level: 'high' | 'medium' | 'low';
  type: string;
  quarter: string;
  hours: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
}

export default function RbiaPlanView() {
  const [locale, setLocale] = useState('ar');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeStepId, setActiveStepId] = useState(1);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCreatePlanModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCreatePlanModal]);

  const handleCreateNewPlan = () => {
    // يمكن فتح modal أو التوجيه إلى صفحة إنشاء الخطة
    setShowCreatePlanModal(true);
    toast.success('فتح معالج إنشاء الخطة السنوية الجديدة');
    // أو استخدام: window.location.href = '/rbia/plan/create';
  };

  const filteredItems = useMemo(() => {
    return planItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === 'all' || item.department === filterDepartment;
      const matchesRisk = filterRisk === 'all' || item.risk_level === filterRisk;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesRisk && matchesStatus;
    });
  }, [planItems, searchTerm, filterDepartment, filterRisk, filterStatus]);

  const processSteps: ProcessStep[] = [
    { id: 1, label: 'الخطة السنوية', status: 'active' },
    { id: 2, label: 'تحديد الأولويات', status: 'available' },
    { id: 3, label: 'تخصيص الموارد', status: 'available' },
    { id: 4, label: 'الجدول الزمني', status: 'locked', lockReason: 'أكمل المرحلة 3 أولاً' },
    { id: 5, label: 'اعتماد الخطة', status: 'locked', lockReason: 'أكمل المرحلة 4 أولاً' },
  ];

  const getRiskBadgeColor = (level: PlanItem['risk_level']) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[level];
  };

  const getStatusBadgeColor = (status: PlanItem['status']) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      delayed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status];
  };

  const getStatusLabel = (status: PlanItem['status']) => {
    const labels = {
      planned: 'مخطط',
      'in-progress': 'قيد التنفيذ',
      completed: 'مكتمل',
      delayed: 'متأخر',
    };
    return labels[status];
  };

  const handleView = (item: PlanItem) => {
    toast.info(`عرض: ${item.title}`);
  };

  const handleEdit = (item: PlanItem) => {
    toast.info(`تعديل: ${item.title}`);
  };

  const handleDelete = (item: PlanItem) => {
    if (confirm(`هل أنت متأكد من حذف "${item.title}"؟`)) {
      setPlanItems(planItems.filter(i => i.id !== item.id));
      toast.success('تم الحذف بنجاح');
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-[1200px]" dir="rtl">
      {/* KPI Cards */}
      <KpiCards planId={selectedPlan?.id} />

      {/* Main Grid with Filters, Table, and Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <select
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل الإدارات</option>
                <option value="المشتريات">المشتريات</option>
                <option value="الموارد البشرية">الموارد البشرية</option>
              </select>

              <select
                value={filterRisk}
                onChange={e => setFilterRisk(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل المخاطر</option>
                <option value="high">عالية</option>
                <option value="medium">متوسطة</option>
                <option value="low">منخفضة</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">كل الحالات</option>
                <option value="planned">مخطط</option>
                <option value="in-progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="delayed">متأخر</option>
              </select>

              <button
                onClick={() => toast.success('تم تصدير البيانات')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                تصدير CSV
              </button>

              <button
                onClick={handleCreateNewPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                إنشاء خطة جديدة
              </button>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="grid gap-3 md:hidden">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                جارٍ التحميل...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                {locale === 'ar' ? 'لا توجد مهام تدقيق' : 'No audit tasks found'}
              </div>
            ) : (
              filteredItems.map((item: PlanItem) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{item.code}</span>
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(
                        item.status,
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 mb-3 whitespace-normal leading-6 font-medium">
                    {item.title}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">{locale === 'ar' ? 'الإدارة' : 'Dept'}:</span>{' '}
                      {item.department}
                    </div>
                    <div>
                      <span className="font-medium">{locale === 'ar' ? 'المخاطر' : 'Risk'}:</span>{' '}
                      <span
                        className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded ${getRiskBadgeColor(
                          item.risk_level,
                        )}`}
                      >
                        {item.risk_level === 'high'
                          ? 'عالية'
                          : item.risk_level === 'medium'
                            ? 'متوسطة'
                            : 'منخفضة'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">{locale === 'ar' ? 'النوع' : 'Type'}:</span>{' '}
                      {item.type}
                    </div>
                    <div>
                      <span className="font-medium">{locale === 'ar' ? 'الربع' : 'Quarter'}:</span>{' '}
                      {item.quarter}
                    </div>
                    <div>
                      <span className="font-medium">{locale === 'ar' ? 'الساعات' : 'Hours'}:</span>{' '}
                      {item.hours}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleView(item)}
                      className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>عرض</span>
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 px-3 py-2 text-sm text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>تعديل</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="flex-1 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="table-fixed w-full">
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '4%' }} />
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    locale === 'ar' ? 'الرمز' : 'Code',
                    locale === 'ar' ? 'عنوان المهمة' : 'Task Title',
                    locale === 'ar' ? 'الإدارة' : 'Department',
                    locale === 'ar' ? 'المخاطر' : 'Risk',
                    locale === 'ar' ? 'النوع' : 'Type',
                    locale === 'ar' ? 'الربع' : 'Quarter',
                    locale === 'ar' ? 'الساعات' : 'Hours',
                    locale === 'ar' ? 'الحالة' : 'Status',
                    locale === 'ar' ? 'إجراءات' : 'Actions',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-3 text-start text-xs font-medium text-gray-600 leading-5 whitespace-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      جارٍ التحميل...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {locale === 'ar' ? 'لا توجد مهام تدقيق' : 'No audit tasks found'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: PlanItem) => (
                    <tr key={item.id} className="align-top hover:bg-gray-50">
                      <td className="px-3 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-normal leading-6">
                        {item.title}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 truncate">
                        {item.department}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getRiskBadgeColor(
                            item.risk_level,
                          )}`}
                        >
                          {item.risk_level === 'high'
                            ? 'عالية'
                            : item.risk_level === 'medium'
                              ? 'متوسطة'
                              : 'منخفضة'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 truncate">{item.type}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{item.quarter}</td>
                      <td className="px-3 py-3 text-sm text-gray-600">{item.hours}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getStatusBadgeColor(
                            item.status,
                          )}`}
                        >
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sticky right-0 bg-white">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleView(item)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="عرض"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="تعديل"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Process Stepper */}
        <div>
          <ProcessStepper
            steps={processSteps}
            activeStepId={activeStepId}
            onStepClick={setActiveStepId}
            completedCount={0}
          />
        </div>
      </div>

      {/* Create Plan Wizard Modal */}
      {showCreatePlanModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={() => setShowCreatePlanModal(false)}
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <CreatePlanWizard onClose={() => setShowCreatePlanModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
