'use client';

/**
 * RBIA Annual Plan View Component
 * Shared component for displaying annual plan in both /rbia/plan and home page
 *
 * Features:
 * - RTL Support
 * - 4 Summary Cards (Progress, Hours, Tasks, Status)
 * - Filters (3 dropdowns + search + CSV export)
 * - Plan Items Table with actions
 * - Sidebar Stepper (11 steps)
 * - Import/Export CSV
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Search,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import ProcessStepper, { ProcessStep } from './ProcessStepper';
import CreatePlanWizard from './CreatePlanWizard';

// Types
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
  au_name?: string;
  priority?: string;
  effort_days?: number;
  period_start?: string;
  period_end?: string;
}

interface RbiaPlanViewProps {
  mode?: 'home' | 'plan';
}

export default function RbiaPlanView({ mode = 'plan' }: RbiaPlanViewProps) {
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<PlanItem | null>(null);
  const [activeStepId, setActiveStepId] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showWizard, setShowWizard] = useState(false);

  // Load data
  useEffect(() => {
    loadPlanData();
    loadFiltersFromStorage();
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'rbia_filters',
        JSON.stringify({
          department: filterDepartment,
          risk: filterRisk,
          status: filterStatus,
        })
      );
    }
  }, [filterDepartment, filterRisk, filterStatus]);

  const loadFiltersFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('rbia_filters');
        if (saved) {
          const filters = JSON.parse(saved);
          setFilterDepartment(filters.department || 'all');
          setFilterRisk(filters.risk || 'all');
          setFilterStatus(filters.status || 'all');
        }
      } catch (e) {
        console.error('Failed to load filters:', e);
      }
    }
  };

  const loadPlanData = async () => {
    setLoading(true);
    try {
      // Get latest annual plan
      const planRes = await fetch('/api/plan/latest');

      if (planRes.ok) {
        const currentPlan = await planRes.json();

        if (currentPlan && currentPlan.id) {
          // Fetch audit tasks for this plan
          const tasksRes = await fetch(`/api/plan/${currentPlan.id}/tasks`);

          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            const tasks = tasksData.tasks || [];

            const items: PlanItem[] = tasks.map((task: any) => ({
              id: task.id,
              code: task.code,
              title: task.title,
              department: task.department,
              risk_level: mapRiskLevel(task.riskLevel),
              type: mapAuditType(task.auditType),
              quarter: task.plannedQuarter,
              hours: task.estimatedHours,
              status: mapTaskStatus(task.status),
              au_name: task.title,
              priority: task.riskLevel,
              effort_days: Math.ceil(task.estimatedHours / 8),
              period_start: task.plannedQuarter,
              period_end: task.plannedQuarter,
            }));

            setPlanItems(items);
          } else {
            // No tasks yet
            setPlanItems([]);
            toast.info('لا توجد مهام في الخطة الحالية');
          }
        } else {
          // No plan found
          setPlanItems([]);
          toast.info('لا توجد خطة سنوية');
        }
      } else {
        // Generate sample data for demo
        setPlanItems(generateSampleData());
        toast.info('عرض بيانات تجريبية');
      }
    } catch (error) {
      console.error('Error loading plan data:', error);
      setPlanItems(generateSampleData());
      toast.error('خطأ في تحميل البيانات');
      toast.error('فشل تحميل البيانات، تم استخدام بيانات تجريبية');
    } finally {
      setLoading(false);
    }
  };

  // Mapping functions for data transformation
  const mapRiskLevel = (riskLevel: string): 'high' | 'medium' | 'low' => {
    const level = riskLevel.toLowerCase();
    if (level === 'very_high' || level === 'high') return 'high';
    if (level === 'medium') return 'medium';
    return 'low';
  };

  const mapAuditType = (auditType: string): string => {
    const types: { [key: string]: string } = {
      financial: 'مالي',
      operational: 'تشغيلي',
      compliance: 'امتثال',
      it: 'تقنية معلومات',
      investigative: 'تحقيقات',
    };
    return types[auditType] || auditType;
  };

  const mapTaskStatus = (status: string): PlanItem['status'] => {
    const statusMap: { [key: string]: PlanItem['status'] } = {
      not_started: 'planned',
      in_progress: 'in-progress',
      completed: 'completed',
      on_hold: 'delayed',
    };
    return statusMap[status] || 'planned';
  };

  const getRiskLevel = (score?: number): 'high' | 'medium' | 'low' => {
    if (!score) return 'low';
    if (score >= 15) return 'high';
    if (score >= 8) return 'medium';
    return 'low';
  };

  const getQuarter = (dateStr?: string): string => {
    if (!dateStr) return 'Q1';
    const month = new Date(dateStr).getMonth() + 1;
    if (month <= 3) return 'Q1';
    if (month <= 6) return 'Q2';
    if (month <= 9) return 'Q3';
    return 'Q4';
  };

  const getStatus = (item: any): PlanItem['status'] => {
    if (!item.period_start) return 'planned';
    const now = new Date();
    const start = new Date(item.period_start);
    const end = item.period_end ? new Date(item.period_end) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000);

    if (now < start) return 'planned';
    if (now > end) return 'delayed';
    if (now >= start && now <= end) return 'in-progress';
    return 'planned';
  };

  const generateSampleData = (): PlanItem[] => {
    return [
      {
        id: '1',
        code: 'RBIA-2025-001',
        title: 'مراجعة نظام المشتريات',
        department: 'المشتريات',
        risk_level: 'high',
        type: 'مراجعة داخلية',
        quarter: 'Q1',
        hours: 120,
        status: 'in-progress',
      },
      {
        id: '2',
        code: 'RBIA-2025-002',
        title: 'تدقيق الرواتب والأجور',
        department: 'الموارد البشرية',
        risk_level: 'high',
        type: 'مراجعة مالية',
        quarter: 'Q1',
        hours: 80,
        status: 'planned',
      },
      {
        id: '3',
        code: 'RBIA-2025-003',
        title: 'مراجعة أمن المعلومات',
        department: 'تقنية المعلومات',
        risk_level: 'medium',
        type: 'مراجعة تقنية',
        quarter: 'Q2',
        hours: 160,
        status: 'planned',
      },
      {
        id: '4',
        code: 'RBIA-2025-004',
        title: 'فحص الامتثال التنظيمي',
        department: 'الامتثال',
        risk_level: 'medium',
        type: 'مراجعة امتثال',
        quarter: 'Q2',
        hours: 100,
        status: 'planned',
      },
      {
        id: '5',
        code: 'RBIA-2025-005',
        title: 'تقييم إدارة المخاطر',
        department: 'المخاطر',
        risk_level: 'low',
        type: 'استشارية',
        quarter: 'Q3',
        hours: 60,
        status: 'planned',
      },
    ];
  };

  // Filtered data with useMemo
  const filteredItems = useMemo(() => {
    return planItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        filterDepartment === 'all' || item.department === filterDepartment;

      const matchesRisk = filterRisk === 'all' || item.risk_level === filterRisk;

      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesDepartment && matchesRisk && matchesStatus;
    });
  }, [planItems, searchTerm, filterDepartment, filterRisk, filterStatus]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalHours = planItems.reduce((sum, item) => sum + item.hours, 0);
    const completedItems = planItems.filter((item) => item.status === 'completed').length;
    const completionRate = planItems.length > 0 ? (completedItems / planItems.length) * 100 : 0;

    return {
      completionRate: Math.round(completionRate),
      totalHours,
      totalTasks: planItems.length,
      status: 'معتمدة',
    };
  }, [planItems]);

  // Get unique values for filters
  const departments = useMemo(
    () => ['all', ...Array.from(new Set(planItems.map((item) => item.department)))],
    [planItems]
  );

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['الرمز', 'العنوان', 'الإدارة', 'المخاطر', 'النوع', 'الربع', 'الساعات', 'الحالة'];
    const rows = filteredItems.map((item) => [
      item.code,
      item.title,
      item.department,
      item.risk_level === 'high' ? 'عالية' : item.risk_level === 'medium' ? 'متوسطة' : 'منخفضة',
      item.type,
      item.quarter,
      item.hours,
      getStatusLabel(item.status),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `annual_plan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('تم تصدير الخطة بنجاح');
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());

        // Skip header
        const dataLines = lines.slice(1);
        const imported: PlanItem[] = dataLines.map((line, idx) => {
          const [code, title, department, risk, type, quarter, hours, status] = line.split(',');
          return {
            id: `imported-${idx}`,
            code: code || `RBIA-IMP-${idx}`,
            title: title || 'مهمة مستوردة',
            department: department || 'عام',
            risk_level: (risk?.toLowerCase() as any) || 'low',
            type: type || 'مراجعة',
            quarter: quarter || 'Q1',
            hours: parseInt(hours) || 40,
            status: (status?.toLowerCase() as any) || 'planned',
          };
        });

        setPlanItems([...planItems, ...imported]);
        toast.success(`تم استيراد ${imported.length} بند`);
      } catch (error) {
        toast.error('فشل استيراد الملف');
      }
    };
    reader.readAsText(file);
  };

  // Actions
  const handleView = (item: PlanItem) => {
    setSelectedItem(item);
    setViewMode('view');
  };

  const handleEdit = (item: PlanItem) => {
    setSelectedItem(item);
    setViewMode('edit');
  };

  const handleDelete = (item: PlanItem) => {
    if (confirm(`هل أنت متأكد من حذف "${item.title}"؟`)) {
      setPlanItems(planItems.filter((i) => i.id !== item.id));
      toast.success('تم الحذف بنجاح');
    }
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

  // Process steps with detailed states
  const processSteps: ProcessStep[] = [
    { id: 1, label: 'الخطة السنوية', status: 'active' },
    { id: 2, label: 'تحديد الأولويات', status: 'available' },
    { id: 3, label: 'تخصيص الموارد', status: 'available' },
    { id: 4, label: 'الجدول الزمني', status: 'locked', lockReason: 'أكمل المرحلة 3 أولاً' },
    { id: 5, label: 'اعتماد الخطة', status: 'locked', lockReason: 'أكمل المرحلة 4 أولاً' },
    { id: 6, label: 'تنفيذ المهام', status: 'locked', lockReason: 'يتطلب اعتماد الخطة' },
    { id: 7, label: 'المتابعة والرقابة', status: 'locked', lockReason: 'يتطلب بدء التنفيذ' },
    { id: 8, label: 'إعداد التقارير', status: 'locked', lockReason: 'يتطلب مهام قيد التنفيذ' },
    { id: 9, label: 'المراجعة والتقييم', status: 'locked', lockReason: 'يتطلب وجود تقارير' },
    { id: 10, label: 'التوصيات', status: 'locked', lockReason: 'يتطلب إتمام المراجعة' },
    { id: 11, label: 'الإغلاق والأرشفة', status: 'locked', lockReason: 'يتطلب إتمام جميع المراحل' },
  ];

  const completedSteps = processSteps.filter(s => s.status === 'completed').length;

  const handleStepChange = (stepId: number) => {
    setActiveStepId(stepId);
    const stepLabel = processSteps.find(s => s.id === stepId)?.label;
    toast.success(`تم الانتقال إلى: ${stepLabel}`);
    // Scroll to top of content area smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeStep = processSteps.find(s => s.id === activeStepId);

  // Render different content based on active step
  const renderStepContent = () => {
    switch (activeStepId) {
      case 1: // الخطة السنوية
        return renderPlanOverview();
      case 2: // تحديد الأولويات
        return renderPrioritization();
      case 3: // تخصيص الموارد
        return renderResourceAllocation();
      default:
        // For steps 4-11, show coming soon message
        return renderComingSoon();
    }
  };

  const renderPlanOverview = () => (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-blue-600">{stats.completionRate}%</span>
          </div>
          <p className="text-sm text-gray-600">نسبة الإنجاز</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-green-600">{stats.totalHours}</span>
          </div>
          <p className="text-sm text-gray-600">إجمالي الساعات</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-3xl font-bold text-purple-600">{stats.totalTasks}</span>
          </div>
          <p className="text-sm text-gray-600">المهام المخططة</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
              {stats.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">حالة الخطة</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">كل الإدارات</option>
            {departments.filter((d) => d !== 'all').map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">كل المخاطر</option>
            <option value="high">عالية</option>
            <option value="medium">متوسطة</option>
            <option value="low">منخفضة</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">كل الحالات</option>
            <option value="planned">مخطط</option>
            <option value="in-progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="delayed">متأخر</option>
          </select>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            استيراد
          </Button>

          <Button onClick={handleExportCSV} size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الرمز
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  العنوان
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الإدارة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  المخاطر
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الربع
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الساعات
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    لا توجد بيانات
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{item.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.department}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(item.risk_level)}`}
                      >
                        {item.risk_level === 'high'
                          ? 'عالية'
                          : item.risk_level === 'medium'
                            ? 'متوسطة'
                            : 'منخفضة'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.quarter}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.hours}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(item.status)}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="flex items-center gap-1.5 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 text-sm font-medium"
                          aria-label="عرض التفاصيل"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-600">عرض</span>
                        </button>

                        <button
                          onClick={() => handleEdit(item)}
                          className="flex items-center gap-1.5 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors border border-green-200 text-sm font-medium"
                          aria-label="تعديل"
                          title="تعديل المهمة"
                        >
                          <Edit2 className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">تعديل</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="flex items-center gap-1.5 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors border border-red-200 text-sm font-medium"
                          aria-label="حذف"
                          title="حذف المهمة"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            عرض {filteredItems.length} من {planItems.length} بند
          </p>
        </div>
      </div>
    </>
  );

  const renderPrioritization = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">تحديد الأولويات</h3>
        <p className="text-gray-600 mb-6">
          في هذه المرحلة، يتم تحديد أولويات المهام بناءً على تقييم المخاطر والأهمية الاستراتيجية.
        </p>
        <div className="bg-blue-50 rounded-lg p-6 text-right space-y-3">
          <h4 className="font-semibold text-blue-900 mb-3">الخطوات الرئيسية:</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>تحليل مستوى المخاطر لكل مهمة</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>تقييم الأثر المتوقع على المنظمة</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>ترتيب المهام حسب الأولوية</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>مراجعة واعتماد الأولويات من الإدارة</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderResourceAllocation = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">تخصيص الموارد</h3>
        <p className="text-gray-600 mb-6">
          تخصيص الموارد البشرية والمادية المطلوبة لتنفيذ كل مهمة بكفاءة.
        </p>
        <div className="bg-purple-50 rounded-lg p-6 text-right space-y-3">
          <h4 className="font-semibold text-purple-900 mb-3">الخطوات الرئيسية:</h4>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>تحديد الكفاءات المطلوبة لكل مهمة</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>تخصيص المدققين المناسبين</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>توزيع ساعات العمل والميزانية</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>التأكد من توازن العبء بين الفريق</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderComingSoon = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">قريبًا</h3>
        <p className="text-gray-600 text-lg">
          محتوى هذه المرحلة قيد التطوير
        </p>
        <p className="text-sm text-gray-500 mt-2">
          يمكنك التنقل إلى المراحل المتاحة الأخرى
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-b-2xl py-3 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">الخطة السنوية للمراجعة الداخلية</h1>
            <p className="text-sm text-slate-300">السنة المالية 2025</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowWizard(true)}
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء خطة جديدة
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 overflow-x-hidden">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Step Header */}
            {activeStep && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 mb-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                    {activeStep.id}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{activeStep.label}</h2>
                    <p className="text-sm text-blue-100">المرحلة النشطة</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Content Based on Active Step */}
            {renderStepContent()}
          </div>

          {/* Process Stepper Sidebar */}
          <ProcessStepper
            steps={processSteps}
            activeStepId={activeStepId}
            onStepClick={handleStepChange}
            completedCount={completedSteps}
          />
        </div>
      </div>

      {/* View/Edit Sheet (Simple Modal) */}
      {viewMode && selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewMode(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {viewMode === 'view' ? 'عرض التفاصيل' : 'تعديل البند'}
              </h3>
              <button
                onClick={() => setViewMode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الرمز</label>
                <input
                  type="text"
                  value={selectedItem.code}
                  disabled={viewMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={selectedItem.title}
                  disabled={viewMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الإدارة</label>
                <input
                  type="text"
                  value={selectedItem.department}
                  disabled={viewMode === 'view'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الساعات</label>
                  <input
                    type="number"
                    value={selectedItem.hours}
                    disabled={viewMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الربع</label>
                  <select
                    value={selectedItem.quarter}
                    disabled={viewMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
              </div>

              {viewMode === 'edit' && (
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setViewMode(null)} className="flex-1">
                    حفظ التغييرات
                  </Button>
                  <Button
                    onClick={() => setViewMode(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* معالج إنشاء الخطة */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">معالج إنشاء خطة التدقيق السنوية</h2>
              <button
                onClick={() => setShowWizard(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="إغلاق"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CreatePlanWizard
                onClose={() => {
                  setShowWizard(false);
                  loadPlanData(); // Refresh data after creating plan
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
