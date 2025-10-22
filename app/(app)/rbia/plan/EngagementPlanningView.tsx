'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';

interface SubTask {
  id?: string;
  title: string;
  scope: string;
  startDateTime: string;
  endDateTime: string;
  assignee: string;
  wpRef?: string;
  expectedOutputs?: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface MainEngagement {
  id?: string;
  code: string;
  title: string;
  department: string;
  riskLevel: string;
  priority: string;
  quarter: string;
  estimatedHours: number;
  owner: string;
  scope: string;
  objectives: string;
  standards: string[]; // IPPF, COSO, ISO, Qatar regulations
  status: 'draft' | 'planned' | 'in_field' | 'report' | 'closed';
  progress: number;
  subTasks: SubTask[];
}

export default function EngagementPlanningView() {
  const [engagements, setEngagements] = useState<MainEngagement[]>([]);
  const [expandedEngagement, setExpandedEngagement] = useState<string | null>(null);
  const [showMainForm, setShowMainForm] = useState(false);
  const [showSubTaskForm, setShowSubTaskForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Main Engagement Form State
  const [mainForm, setMainForm] = useState<MainEngagement>({
    code: '',
    title: '',
    department: '',
    riskLevel: 'medium',
    priority: 'medium',
    quarter: 'Q1',
    estimatedHours: 0,
    owner: '',
    scope: '',
    objectives: '',
    standards: [],
    status: 'draft',
    progress: 0,
    subTasks: [],
  });

  // Sub-Task Form State
  const [subTaskForm, setSubTaskForm] = useState<SubTask>({
    title: '',
    scope: '',
    startDateTime: '',
    endDateTime: '',
    assignee: '',
    wpRef: '',
    expectedOutputs: '',
    status: 'not_started',
  });

  useEffect(() => {
    loadEngagements();
  }, []);

  const loadEngagements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plan/latest');
      if (response.ok) {
        const plan = await response.json();
        if (plan?.id) {
          const tasksResponse = await fetch(`/api/plan/${plan.id}/tasks`);
          if (tasksResponse.ok) {
            const data = await tasksResponse.json();
            // Transform tasks to engagements format
            const transformedEngagements = (data.tasks || []).map((task: any) => ({
              id: task.id,
              code: task.code || generateEngCode(),
              title: task.title,
              department: task.department || 'عام',
              riskLevel: task.riskLevel || 'medium',
              priority: task.riskLevel || 'medium',
              quarter: task.plannedQuarter || 'Q1',
              estimatedHours: task.estimatedHours || 0,
              owner: task.owner || '',
              scope: task.scope || '',
              objectives: task.objectives || '',
              standards: task.standards || [],
              status: task.status || 'draft',
              progress: 0,
              subTasks: [],
            }));
            setEngagements(transformedEngagements);
          }
        }
      }
    } catch (error) {
      console.error('Error loading engagements:', error);
      toast.error('فشل تحميل المهام');
    } finally {
      setLoading(false);
    }
  };

  const generateEngCode = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ENG-${year}-${random}`;
  };

  const handleCreateMainEngagement = () => {
    // Validation
    if (!mainForm.title.trim()) {
      toast.error('الرجاء استكمال الحقول الإلزامية: العنوان*');
      return;
    }
    if (!mainForm.department.trim()) {
      toast.error('الرجاء استكمال الحقول الإلزامية: الإدارة/العملية*');
      return;
    }
    if (!mainForm.owner.trim()) {
      toast.error('الرجاء استكمال الحقول الإلزامية: المالك التنفيذي*');
      return;
    }
    if (!mainForm.scope.trim()) {
      toast.error('الرجاء استكمال الحقول الإلزامية: النطاق*');
      return;
    }
    if (!mainForm.objectives.trim()) {
      toast.error('الرجاء استكمال الحقول الإلزامية: الأهداف*');
      return;
    }
    if (mainForm.standards.length === 0) {
      toast.error('الرجاء استكمال الحقول الإلزامية: المعايير المرجعية*');
      return;
    }

    // Generate code if not exists
    const newEngagement: MainEngagement = {
      ...mainForm,
      code: mainForm.code || generateEngCode(),
      id: Date.now().toString(),
    };

    setEngagements([...engagements, newEngagement]);
    toast.success('تم إنشاء المهمة بنجاح');

    // Reset form
    setMainForm({
      code: '',
      title: '',
      department: '',
      riskLevel: 'medium',
      priority: 'medium',
      quarter: 'Q1',
      estimatedHours: 0,
      owner: '',
      scope: '',
      objectives: '',
      standards: [],
      status: 'draft',
      progress: 0,
      subTasks: [],
    });
    setShowMainForm(false);
  };

  const handleCreateSubTask = (engagementId: string) => {
    // Validation
    if (!subTaskForm.title.trim()) {
      toast.error('لا يمكن إنشاء مهمة جزئية بدون تحديد: عنوان الجزئية*');
      return;
    }
    if (!subTaskForm.scope.trim()) {
      toast.error('لا يمكن إنشاء مهمة جزئية بدون تحديد: نطاق مختصر*');
      return;
    }
    if (!subTaskForm.startDateTime || !subTaskForm.endDateTime) {
      toast.error('لا يمكن إنشاء مهمة جزئية بدون تحديد: وقت البداية والنهاية*');
      return;
    }
    if (!subTaskForm.assignee.trim()) {
      toast.error('لا يمكن إنشاء مهمة جزئية بدون تحديد: المسؤول*');
      return;
    }

    // Check for time conflicts
    const engagement = engagements.find(e => e.id === engagementId);
    if (engagement) {
      const hasConflict = engagement.subTasks.some(st => {
        if (st.assignee !== subTaskForm.assignee) return false;
        const newStart = new Date(subTaskForm.startDateTime);
        const newEnd = new Date(subTaskForm.endDateTime);
        const existingStart = new Date(st.startDateTime);
        const existingEnd = new Date(st.endDateTime);
        return (
          (newStart >= existingStart && newStart <= existingEnd) ||
          (newEnd >= existingStart && newEnd <= existingEnd) ||
          (newStart <= existingStart && newEnd >= existingEnd)
        );
      });

      if (hasConflict) {
        toast.error('تداخل زمني: يوجد للمسؤول مهمة جزئية أخرى في نفس الفترة.');
        return;
      }
    }

    // Add sub-task
    const newSubTask: SubTask = {
      ...subTaskForm,
      id: Date.now().toString(),
    };

    setEngagements(
      engagements.map(eng => {
        if (eng.id === engagementId) {
          const updatedSubTasks = [...eng.subTasks, newSubTask];
          const completedCount = updatedSubTasks.filter(st => st.status === 'completed').length;
          const progress =
            updatedSubTasks.length > 0
              ? Math.round((completedCount / updatedSubTasks.length) * 100)
              : 0;

          return {
            ...eng,
            subTasks: updatedSubTasks,
            progress,
          };
        }
        return eng;
      }),
    );

    toast.success('تم إنشاء المهمة الجزئية بنجاح');

    // Reset form
    setSubTaskForm({
      title: '',
      scope: '',
      startDateTime: '',
      endDateTime: '',
      assignee: '',
      wpRef: '',
      expectedOutputs: '',
      status: 'not_started',
    });
    setShowSubTaskForm(null);
  };

  const handlePublishEngagement = (engagementId: string) => {
    const engagement = engagements.find(e => e.id === engagementId);
    if (!engagement) return;

    if (!engagement.scope || !engagement.objectives || engagement.standards.length === 0) {
      toast.error('لا يمكن نشر المهمة بدون نطاق/أهداف/معايير مرجعية.');
      return;
    }

    setEngagements(
      engagements.map(eng => (eng.id === engagementId ? { ...eng, status: 'planned' } : eng)),
    );
    toast.success('تم نشر المهمة بنجاح');
  };

  const getRiskLevelBadge = (level: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      planned: 'bg-blue-100 text-blue-800',
      in_field: 'bg-purple-100 text-purple-800',
      report: 'bg-orange-100 text-orange-800',
      closed: 'bg-green-100 text-green-800',
    };
    const labels = {
      draft: 'مسودة',
      planned: 'مخطط',
      in_field: 'ميداني',
      report: 'تقرير',
      closed: 'مغلق',
    };
    return {
      color: colors[status as keyof typeof colors] || colors.draft,
      label: labels[status as keyof typeof labels] || status,
    };
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تخطيط المهمات</h2>
          <p className="text-sm text-gray-600 mt-1">
            إدارة المهام التدقيقية بناءً على الخطة السنوية وفق معايير IPPF 2024/2025
          </p>
        </div>
        <Button
          onClick={() => setShowMainForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 ml-2" />
          إنشاء مهمة تدقيقية
        </Button>
      </div>

      {/* Main Engagement Form */}
      {showMainForm && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">إنشاء مهمة تدقيقية جديدة</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              وفق معايير IPPF 2024/2025
            </span>
          </div>

          {/* Info Box */}
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">ملاحظة هامة:</p>
              <p>
                يتم إنشاء المهام التدقيقية بناءً على الخطة السنوية المعتمدة. تأكد من استكمال جميع
                الحقول الإلزامية (*) وتحديد المعايير المرجعية وفق الإطار الدولي للممارسة المهنية
                (IPPF) ومعايير COSO و ISO 31000.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رمز المهمة</label>
              <input
                type="text"
                value={mainForm.code}
                onChange={e => setMainForm({ ...mainForm, code: e.target.value })}
                placeholder="سيتم التوليد تلقائياً"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mainForm.title}
                onChange={e => setMainForm({ ...mainForm, title: e.target.value })}
                placeholder="مثال: تدقيق نظام المشتريات والعقود"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الإدارة/العملية <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mainForm.department}
                onChange={e => setMainForm({ ...mainForm, department: e.target.value })}
                placeholder="مثال: إدارة المشتريات"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الأولوية/المخاطر <span className="text-red-500">*</span>
              </label>
              <select
                value={mainForm.riskLevel}
                onChange={e =>
                  setMainForm({ ...mainForm, riskLevel: e.target.value, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">عالي</option>
                <option value="medium">متوسط</option>
                <option value="low">منخفض</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الربع <span className="text-red-500">*</span>
              </label>
              <select
                value={mainForm.quarter}
                onChange={e => setMainForm({ ...mainForm, quarter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Q1">الربع الأول</option>
                <option value="Q2">الربع الثاني</option>
                <option value="Q3">الربع الثالث</option>
                <option value="Q4">الربع الرابع</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تقدير الساعات <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={mainForm.estimatedHours}
                onChange={e => setMainForm({ ...mainForm, estimatedHours: Number(e.target.value) })}
                placeholder="120"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">الساعات التقديرية للمهمة بالكامل</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المالك التنفيذي <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mainForm.owner}
                onChange={e => setMainForm({ ...mainForm, owner: e.target.value })}
                placeholder="مثال: أحمد محمد - مدير التدقيق"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النطاق <span className="text-red-500">*</span>
              </label>
              <textarea
                value={mainForm.scope}
                onChange={e => setMainForm({ ...mainForm, scope: e.target.value })}
                rows={3}
                placeholder="حدد نطاق المهمة التدقيقية بوضوح: الأنشطة المشملة، الفترة الزمنية، المواقع..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                يجب تحديد النطاق بدقة لضمان فعالية التدقيق
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الأهداف <span className="text-red-500">*</span>
              </label>
              <textarea
                value={mainForm.objectives}
                onChange={e => setMainForm({ ...mainForm, objectives: e.target.value })}
                rows={3}
                placeholder="أهداف المهمة التدقيقية: التحقق من كفاءة الضوابط الداخلية، تقييم الامتثال..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                يجب أن تكون الأهداف واضحة وقابلة للقياس (SMART)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المعايير المرجعية <span className="text-red-500">*</span>
              </label>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'IPPF', label: 'IPPF 2024 - الإطار الدولي للممارسة المهنية' },
                    { value: 'COSO', label: 'COSO - إطار الضوابط الداخلية' },
                    { value: 'ISO 31000', label: 'ISO 31000 - إدارة المخاطر' },
                    { value: 'لوائح قطر', label: 'اللوائح والقوانين القطرية' },
                  ].map(standard => (
                    <label
                      key={standard.value}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={mainForm.standards.includes(standard.value)}
                        onChange={e => {
                          if (e.target.checked) {
                            setMainForm({
                              ...mainForm,
                              standards: [...mainForm.standards, standard.value],
                            });
                          } else {
                            setMainForm({
                              ...mainForm,
                              standards: mainForm.standards.filter(s => s !== standard.value),
                            });
                          }
                        }}
                        className="rounded mt-1"
                      />
                      <span className="text-sm">{standard.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                اختر معيار واحد على الأقل - يُنصح باختيار IPPF لجميع مهام التدقيق الداخلي
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              onClick={handleCreateMainEngagement}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 font-medium shadow-md"
            >
              {loading ? 'جاري الحفظ...' : '✓ حفظ المهمة'}
            </Button>
            <Button
              onClick={() => setShowMainForm(false)}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 font-medium"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Engagements List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : engagements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">لا توجد مهام. ابدأ بإنشاء مهمة رئيسية جديدة.</p>
          </div>
        ) : (
          engagements.map(engagement => (
            <div key={engagement.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Main Engagement Header */}
              <div className="bg-white p-4">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() =>
                      setExpandedEngagement(
                        expandedEngagement === engagement.id ? null : engagement.id || null,
                      )
                    }
                    className="flex items-start gap-3 flex-1 text-right"
                  >
                    {expandedEngagement === engagement.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono text-gray-500">{engagement.code}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getRiskLevelBadge(engagement.riskLevel)}`}
                        >
                          {engagement.riskLevel === 'high'
                            ? 'عالي'
                            : engagement.riskLevel === 'medium'
                              ? 'متوسط'
                              : 'منخفض'}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(engagement.status).color}`}
                        >
                          {getStatusBadge(engagement.status).label}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{engagement.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {engagement.department} • {engagement.quarter} • {engagement.estimatedHours}{' '}
                        ساعة
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-700">
                        التقدم: {engagement.progress}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${engagement.progress}%` }}
                        />
                      </div>
                    </div>
                    {engagement.status === 'draft' && (
                      <Button
                        onClick={() => handlePublishEngagement(engagement.id!)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        نشر
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedEngagement === engagement.id && (
                <div className="bg-gray-50 border-t border-gray-200 p-4">
                  {/* Engagement Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-1">النطاق</h4>
                      <p className="text-sm text-gray-600">{engagement.scope || 'غير محدد'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-1">الأهداف</h4>
                      <p className="text-sm text-gray-600">{engagement.objectives || 'غير محدد'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-1">المعايير المرجعية</h4>
                      <p className="text-sm text-gray-600">
                        {engagement.standards.length > 0
                          ? engagement.standards.join(', ')
                          : 'غير محدد'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 mb-1">المالك التنفيذي</h4>
                      <p className="text-sm text-gray-600">{engagement.owner || 'غير محدد'}</p>
                    </div>
                  </div>

                  {/* Sub-Tasks Section */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900">المهام الجزئية</h4>
                      <Button
                        onClick={() => setShowSubTaskForm(engagement.id!)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-3 h-3 ml-1" />
                        إنشاء مهمة جزئية
                      </Button>
                    </div>

                    {/* Sub-Task Form */}
                    {showSubTaskForm === engagement.id && (
                      <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                        <h5 className="font-bold text-gray-900 mb-3">مهمة جزئية جديدة</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              عنوان الجزئية <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={subTaskForm.title}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, title: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              المسؤول <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={subTaskForm.assignee}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, assignee: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              تاريخ ووقت البداية <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={subTaskForm.startDateTime}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, startDateTime: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              تاريخ ووقت النهاية <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="datetime-local"
                              value={subTaskForm.endDateTime}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, endDateTime: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              نطاق مختصر <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={subTaskForm.scope}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, scope: e.target.value })
                              }
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              ربط بـ WPRef/اختبارات
                            </label>
                            <input
                              type="text"
                              value={subTaskForm.wpRef}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, wpRef: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              مخرجات متوقعة
                            </label>
                            <input
                              type="text"
                              value={subTaskForm.expectedOutputs}
                              onChange={e =>
                                setSubTaskForm({ ...subTaskForm, expectedOutputs: e.target.value })
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleCreateSubTask(engagement.id!)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            حفظ
                          </Button>
                          <Button
                            onClick={() => setShowSubTaskForm(null)}
                            size="sm"
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sub-Tasks List */}
                    {engagement.subTasks.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">لا توجد مهام جزئية</p>
                    ) : (
                      <div className="space-y-2">
                        {engagement.subTasks.map(subTask => (
                          <div
                            key={subTask.id}
                            className="bg-white border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 text-sm">
                                  {subTask.title}
                                </h5>
                                <p className="text-xs text-gray-600 mt-1">{subTask.scope}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                  <span>المسؤول: {subTask.assignee}</span>
                                  <span>
                                    البداية:{' '}
                                    {new Date(subTask.startDateTime).toLocaleString('ar-SA')}
                                  </span>
                                  <span>
                                    النهاية: {new Date(subTask.endDateTime).toLocaleString('ar-SA')}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  subTask.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : subTask.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {subTask.status === 'completed'
                                  ? 'مكتمل'
                                  : subTask.status === 'in_progress'
                                    ? 'جاري'
                                    : 'لم يبدأ'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
