'use client';
import React, { useState, useEffect, useMemo } from 'react';
import KpiCards from '../../../(components)/KpiCards';
import ProcessStepper, { ProcessStep } from './ProcessStepper';
import CreatePlanWizard from './CreatePlanWizard';
import { toast } from 'sonner';
import { Search, Download, Eye, Plus, FileText } from 'lucide-react';

interface PlanItem {
  id: string;
  code: string;
  title: string;
  department: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  quarter: string;
  hours: number;
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  assignee?: string;
  notes?: string;
}

type ContentView =
  | 'empty'
  | 'annualPlan'
  | 'planning'
  | 'understanding'
  | 'workProgram'
  | 'fieldwork'
  | 'drafts'
  | 'results'
  | 'finalReport'
  | 'followup'
  | 'closure'
  | 'qa';

interface RbiaPlanViewProps {
  mode?: 'plan' | 'execution';
}

export default function RbiaPlanView({ mode = 'plan' }: RbiaPlanViewProps) {
  // State management
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // New state for dynamic content
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [contentView, setContentView] = useState<ContentView>('empty');
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

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

  // Check for existing plan on mount
  useEffect(() => {
    checkForExistingPlan();
  }, []);

  const checkForExistingPlan = async () => {
    try {
      const planResponse = await fetch('/api/plan/latest');
      if (planResponse.ok) {
        const planData = await planResponse.json();
        if (planData?.id) {
          setCurrentPlanId(planData.id);
          setSelectedPlan(planData);
        }
      }
    } catch (error) {
      console.error('Error checking for plan:', error);
    }
  };

  const fetchPlanData = async (planIdToFetch?: string) => {
    const targetPlanId = planIdToFetch || currentPlanId;

    if (!targetPlanId) {
      console.log('No plan ID available to fetch data');
      return;
    }

    try {
      setLoading(true);

      // Fetch plan details
      const planResponse = await fetch(`/api/plan/${targetPlanId}`);
      if (planResponse.ok) {
        const planData = await planResponse.json();
        setSelectedPlan(planData);
      }

      // Fetch tasks for this plan
      const tasksResponse = await fetch(`/api/plan/${targetPlanId}/tasks`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();

        // API returns { tasks: [...] } not array directly
        const tasksList = tasksData.tasks || tasksData || [];

        // Transform tasks to PlanItem format
        const items: PlanItem[] = tasksList.map((task: any) => {
          // Handle risk level conversion (enum to lowercase string)
          let riskLevel: PlanItem['risk_level'] = 'medium';
          const taskRisk = (task.riskLevel || '').toLowerCase();
          if (taskRisk === 'very_high' || taskRisk === 'critical') riskLevel = 'critical';
          else if (taskRisk === 'high') riskLevel = 'high';
          else if (taskRisk === 'low' || taskRisk === 'very_low') riskLevel = 'low';
          else riskLevel = 'medium';

          // Handle status conversion
          let status: PlanItem['status'] = 'planned';
          const taskStatus = (task.status || '').toLowerCase();
          if (taskStatus === 'in_progress') status = 'in-progress';
          else if (taskStatus === 'completed') status = 'completed';
          else if (taskStatus === 'not_started') status = 'planned';
          else status = 'planned';

          return {
            id: task.id,
            code: task.taskRef || task.code || '',
            title: task.title || '',
            department: task.deptId || task.department || 'عام',
            risk_level: riskLevel,
            type: task.taskType || task.auditType || 'امتثال',
            quarter: task.scheduledQuarter || task.plannedQuarter || 'Q1',
            hours: task.durationDays || task.estimatedHours || 0,
            status: status,
            assignee: task.assignee || task.leadAuditor || '',
            notes: task.notes || task.objectiveAndScope || '',
          };
        });

        setPlanItems(items);

        // Mark step 1 as completed after successful load
        if (!completedSteps.includes(1)) {
          setCompletedSteps([...completedSteps, 1]);
        }

        toast.success(`تم تحميل ${items.length} مهمة بنجاح`);
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
      toast.error('حدث خطأ في تحميل بيانات الخطة');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPlan = () => {
    setShowCreatePlanModal(true);
  };

  const handlePlanCreated = async () => {
    // Close modal first
    setShowCreatePlanModal(false);

    // Fetch the latest plan (the one just created)
    try {
      const planResponse = await fetch('/api/plan/latest');
      if (planResponse.ok) {
        const planData = await planResponse.json();
        if (planData?.id) {
          // Update state with new plan
          setCurrentPlanId(planData.id);
          setSelectedPlan(planData);

          // Switch to annual plan view
          setActiveStepId(1);
          setContentView('annualPlan');

          // Load tasks for this plan
          await fetchPlanData(planData.id);
        }
      }
    } catch (error) {
      console.error('Error loading plan after creation:', error);
      toast.error('تم إنشاء الخطة ولكن حدث خطأ في التحميل. يرجى تحديث الصفحة.');
    }
  };

  const handleStepClick = (stepId: number) => {
    // Check if plan exists for most steps
    if (stepId > 1 && !currentPlanId) {
      toast.error('يرجى إنشاء خطة أولاً');
      return;
    }

    setActiveStepId(stepId);

    // Map step to content view
    switch (stepId) {
      case 1: // الخطة السنوية
        setContentView('annualPlan');
        if (currentPlanId && planItems.length === 0) {
          fetchPlanData();
        }
        break;
      case 2: // التخطيط
        setContentView('planning');
        break;
      case 3: // فهم العملية والمخاطر
        setContentView('understanding');
        break;
      case 4: // برنامج العمل والعينات
        setContentView('workProgram');
        break;
      case 5: // الأعمال الميدانية والأدلة
        setContentView('fieldwork');
        break;
      case 6: // المسودات الأولية
        setContentView('drafts');
        break;
      case 7: // النتائج والتوصيات
        setContentView('results');
        break;
      case 8: // التقرير النهائي
        setContentView('finalReport');
        break;
      case 9: // المتابعة
        setContentView('followup');
        break;
      case 10: // الإقفال
        setContentView('closure');
        break;
      case 11: // ضمان الجودة
        setContentView('qa');
        break;
      default:
        setContentView('empty');
    }
  };

  const filteredItems = useMemo(() => {
    return planItems.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === 'all' || item.department === filterDepartment;
      const matchesRisk = filterRisk === 'all' || item.risk_level === filterRisk;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesDepartment && matchesRisk && matchesStatus;
    });
  }, [planItems, searchTerm, filterDepartment, filterRisk, filterStatus]);

  // Complete RBIA process steps
  const processSteps: ProcessStep[] = [
    {
      id: 1,
      label: 'الخطة السنوية',
      status: completedSteps.includes(1) ? 'completed' : (activeStepId === 1 ? 'active' : 'available')
    },
    {
      id: 2,
      label: 'التخطيط',
      status: completedSteps.includes(2) ? 'completed' : (activeStepId === 2 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 3,
      label: 'فهم العملية والمخاطر',
      status: completedSteps.includes(3) ? 'completed' : (activeStepId === 3 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 4,
      label: 'برنامج العمل والعينات',
      status: completedSteps.includes(4) ? 'completed' : (activeStepId === 4 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 5,
      label: 'الأعمال الميدانية والأدلة',
      status: completedSteps.includes(5) ? 'completed' : (activeStepId === 5 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 6,
      label: 'المسودات الأولية',
      status: completedSteps.includes(6) ? 'completed' : (activeStepId === 6 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 7,
      label: 'النتائج والتوصيات',
      status: completedSteps.includes(7) ? 'completed' : (activeStepId === 7 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 8,
      label: 'التقرير النهائي',
      status: completedSteps.includes(8) ? 'completed' : (activeStepId === 8 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 9,
      label: 'المتابعة',
      status: completedSteps.includes(9) ? 'completed' : (activeStepId === 9 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 10,
      label: 'الإقفال',
      status: completedSteps.includes(10) ? 'completed' : (activeStepId === 10 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
    {
      id: 11,
      label: 'ضمان الجودة',
      status: completedSteps.includes(11) ? 'completed' : (activeStepId === 11 ? 'active' : (currentPlanId ? 'available' : 'locked')),
      lockReason: currentPlanId ? undefined : 'قم بإنشاء خطة أولاً'
    },
  ];

  const getRiskBadgeColor = (level: PlanItem['risk_level']) => {
    const colors = {
      critical: 'bg-purple-100 text-purple-800 border-purple-300',
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[level];
  };

  const getRiskLabel = (level: PlanItem['risk_level']) => {
    const labels = {
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      low: 'منخفض',
    };
    return labels[level];
  };

  const getStatusBadgeColor = (status: PlanItem['status']) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800 border-blue-300',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      delayed: 'bg-red-100 text-red-800 border-red-300',
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

  const handleEdit = async (item: PlanItem) => {
    toast.info(`تعديل: ${item.title}`);
    // TODO: Open edit modal
  };

  const handleDelete = async (item: PlanItem) => {
    if (!currentPlanId) return;

    const confirmed = confirm(`هل أنت متأكد من حذف المهمة "${item.title}"؟`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/plan/${currentPlanId}/tasks/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPlanItems(planItems.filter(i => i.id !== item.id));
        toast.success('تم حذف المهمة بنجاح');
      } else {
        throw new Error('فشل الحذف');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.warning('لا توجد بيانات للتصدير');
      return;
    }

    const headers = ['الرمز', 'العنوان', 'الإدارة', 'المخاطر', 'النوع', 'الربع', 'الساعات', 'الحالة'];
    const rows = filteredItems.map(item => [
      item.code,
      item.title,
      item.department,
      getRiskLabel(item.risk_level),
      item.type,
      item.quarter,
      item.hours.toString(),
      getStatusLabel(item.status),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `annual-plan-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('تم تصدير البيانات بنجاح');
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">لم يتم اختيار أي مرحلة</h3>
      <p className="text-slate-600 text-center max-w-md mb-8">
        اختر مرحلة من قائمة مراحل العملية على اليسار لعرض المحتوى المتعلق بها
      </p>
      {!currentPlanId && (
        <button
          onClick={handleCreateNewPlan}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          إنشاء خطة جديدة
        </button>
      )}
    </div>
  );

  // Render annual plan table
  const renderAnnualPlanTable = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      );
    }

    if (planItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">لا توجد مهام في الخطة</h3>
          <p className="text-slate-600 text-center max-w-md mb-8">
            قم بإضافة مهام إلى الخطة السنوية للبدء
          </p>
          <button
            onClick={handleCreateNewPlan}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            إضافة خطة جديدة
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-200">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في المهام..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            <select
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
            >
              <option value="all">كل الإدارات</option>
              <option value="المشتريات">المشتريات</option>
              <option value="الموارد البشرية">الموارد البشرية</option>
              <option value="المالية">المالية</option>
              <option value="تقنية المعلومات">تقنية المعلومات</option>
            </select>

            <select
              value={filterRisk}
              onChange={e => setFilterRisk(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
            >
              <option value="all">كل المخاطر</option>
              <option value="critical">حرج</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm min-w-[140px]"
            >
              <option value="all">كل الحالات</option>
              <option value="planned">مخطط</option>
              <option value="in-progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="delayed">متأخر</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
              title="تصدير CSV"
            >
              <Download className="w-4 h-4" />
              تصدير
            </button>
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200">
          <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                <tr>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">الرمز</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">العنوان</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">الإدارة</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">المخاطر</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">النوع</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">الربع</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">الساعات</th>
                  <th className="px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider">الحالة</th>
                  <th className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      لا توجد نتائج تطابق معايير البحث
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="px-3 py-4 text-sm font-mono text-slate-700 truncate" title={item.code}>
                        {item.code}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-800 font-medium whitespace-normal leading-6">
                        {item.title}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600 truncate" title={item.department}>
                        {item.department}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(item.risk_level)}`}>
                          {getRiskLabel(item.risk_level)}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600 truncate" title={item.type}>
                        {item.type}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600 text-center font-medium">
                        {item.quarter}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600 text-center font-medium">
                        {item.hours}
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition-all hover:shadow-md border-2 border-blue-300 hover:border-blue-400 font-semibold text-sm"
                            title="تعديل المهمة"
                            aria-label={`تعديل ${item.title}`}
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 rounded-lg transition-all hover:shadow-md border-2 border-red-300 hover:border-red-400 font-semibold text-sm"
                            title="حذف المهمة"
                            aria-label={`حذف ${item.title}`}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        {/* Cards - Mobile */}
        <div className="md:hidden grid gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="text-xs font-mono text-slate-500 mb-1">{item.code}</div>
                  <h3 className="text-sm font-semibold text-slate-800 leading-6">{item.title}</h3>
                </div>
                <div className="flex gap-2 mr-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-all border border-blue-200 font-semibold text-xs"
                    title="تعديل المهمة"
                    aria-label={`تعديل ${item.title}`}
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-all border border-red-200 font-semibold text-xs"
                    title="حذف المهمة"
                    aria-label={`حذف ${item.title}`}
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">الإدارة:</span>
                  <span className="text-slate-700 font-medium mr-1">{item.department}</span>
                </div>
                <div>
                  <span className="text-slate-500">النوع:</span>
                  <span className="text-slate-700 font-medium mr-1">{item.type}</span>
                </div>
                <div>
                  <span className="text-slate-500">الربع:</span>
                  <span className="text-slate-700 font-medium mr-1">{item.quarter}</span>
                </div>
                <div>
                  <span className="text-slate-500">الساعات:</span>
                  <span className="text-slate-700 font-medium mr-1">{item.hours}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(item.risk_level)}`}>
                  {getRiskLabel(item.risk_level)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-xl p-4 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{filteredItems.length}</div>
              <div className="text-xs text-slate-300">إجمالي المهام</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredItems.filter(i => i.status === 'completed').length}</div>
              <div className="text-xs text-slate-300">مكتملة</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredItems.filter(i => i.status === 'in-progress').length}</div>
              <div className="text-xs text-slate-300">قيد التنفيذ</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredItems.reduce((sum, item) => sum + item.hours, 0)}</div>
              <div className="text-xs text-slate-300">إجمالي الساعات</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render placeholder for other views
  const renderPlaceholderView = (title: string, description: string) => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 text-center max-w-md">
        {description}
      </p>
    </div>
  );

  // Render content based on active view
  const renderContent = () => {
    switch (contentView) {
      case 'empty':
        return renderEmptyState();
      case 'annualPlan':
        return renderAnnualPlanTable();
      case 'planning':
        return renderPlaceholderView('التخطيط', 'محتوى مرحلة التخطيط قيد التطوير');
      case 'understanding':
        return renderPlaceholderView('فهم العملية والمخاطر', 'محتوى مرحلة فهم العملية والمخاطر قيد التطوير');
      case 'workProgram':
        return renderPlaceholderView('برنامج العمل والعينات', 'محتوى مرحلة برنامج العمل والعينات قيد التطوير');
      case 'fieldwork':
        return renderPlaceholderView('الأعمال الميدانية والأدلة', 'محتوى مرحلة الأعمال الميدانية والأدلة قيد التطوير');
      case 'drafts':
        return renderPlaceholderView('المسودات الأولية', 'محتوى مرحلة المسودات الأولية قيد التطوير');
      case 'results':
        return renderPlaceholderView('النتائج والتوصيات', 'محتوى مرحلة النتائج والتوصيات قيد التطوير');
      case 'finalReport':
        return renderPlaceholderView('التقرير النهائي', 'محتوى مرحلة التقرير النهائي قيد التطوير');
      case 'followup':
        return renderPlaceholderView('المتابعة', 'محتوى مرحلة المتابعة قيد التطوير');
      case 'closure':
        return renderPlaceholderView('الإقفال', 'محتوى مرحلة الإقفال قيد التطوير');
      case 'qa':
        return renderPlaceholderView('ضمان الجودة', 'محتوى مرحلة ضمان الجودة قيد التطوير');
      default:
        return renderEmptyState();
    }
  };

  return (
    <div className="w-full px-2 sm:px-3 lg:px-4 max-w-[1920px] mx-auto" dir="rtl">
      {/* KPI Cards - Show once at top */}
      <KpiCards planId={currentPlanId || undefined} />

      {/* Main Grid with Content and Sidebar */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-[1fr_300px]">
        {/* Dynamic Content Area */}
        <div className="min-w-0 overflow-hidden">{renderContent()}
        </div>

        {/* Sidebar Process Stepper */}
        <div>
          <ProcessStepper
            steps={processSteps}
            activeStepId={activeStepId || 0}
            onStepClick={handleStepClick}
            completedCount={completedSteps.length}
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
            <CreatePlanWizard
              onClose={() => setShowCreatePlanModal(false)}
              onSuccess={handlePlanCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
