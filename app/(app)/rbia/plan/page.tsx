'use client';

/**
 * RBIA Annual Plan Page
 * Risk-Based Internal Audit Planning Interface
 *
 * Features:
 * - Universe Management
 * - Risk Assessment with Heatmap
 * - Plan Items Management
 * - Resource Capacity
 * - Approval Workflow & Baseline
 * - Generate Engagements
 */

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Types
interface AuditUniverseItem {
  id: string;
  name: string;
  category?: string;
  owner?: string;
  strategy_importance?: number;
  system_refs?: string;
  last_audit_date?: string;
  notes?: string;
}

interface RiskAssessment {
  id?: string;
  au_id: string;
  likelihood: number;
  impact: number;
  weight: number;
  score?: number;
}

interface PlanItem {
  id?: string;
  plan_id: string;
  au_id: string;
  au_name?: string;
  type?: string;
  priority?: string;
  effort_days?: number;
  period_start?: string;
  period_end?: string;
  deliverable_type?: string;
  risk_score?: number;
}

interface PlanData {
  id: string;
  year: number;
  version: string;
  status: string;
  baseline_hash?: string;
  baseline_date?: string;
}

type TabType = 'universe' | 'risk' | 'items' | 'resources' | 'approvals';

export default function RBIAPlanPage() {
  const [activeTab, setActiveTab] = useState<TabType>('universe');
  const [universeItems, setUniverseItems] = useState<AuditUniverseItem[]>([]);
  const [selectedAUs, setSelectedAUs] = useState<Set<string>>(new Set());
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Risk assessment state
  const [riskForm, setRiskForm] = useState({
    au_id: '',
    likelihood: 3,
    impact: 3,
    weight: 50
  });
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);

  // Initialize or load plan
  useEffect(() => {
    loadUniverse();
    initializePlan();
    loadSelectedAUs();
  }, []);

  const loadSelectedAUs = () => {
    try {
      const saved = localStorage.getItem('rbia_selected_aus');
      if (saved) {
        setSelectedAUs(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error('Failed to load selected AUs:', e);
    }
  };

  const saveSelectedAUs = (selected: Set<string>) => {
    try {
      localStorage.setItem('rbia_selected_aus', JSON.stringify(Array.from(selected)));
    } catch (e) {
      console.error('Failed to save selected AUs:', e);
    }
  };

  const initializePlan = async () => {
    const currentYear = new Date().getFullYear();
    // Try to find existing plan or create one
    try {
      const res = await fetch(`/api/annual-plans?fiscalYear=${currentYear}`);
      if (res.ok) {
        const plans = await res.json();
        if (plans && plans.length > 0) {
          // Use first RBIA-type plan or first plan
          const plan = plans[0];
          setCurrentPlan({
            id: plan.id,
            year: plan.fiscalYear,
            version: plan.version || 'v1',
            status: 'draft'
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize plan:', error);
    }
  };

  const loadUniverse = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-universe');
      const data = await res.json();
      if (data.ok) {
        setUniverseItems(data.data || []);
      } else {
        toast.error('فشل في تحميل عناصر الكون');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleAUSelection = (auId: string, checked: boolean) => {
    const newSelected = new Set(selectedAUs);
    if (checked) {
      newSelected.add(auId);
    } else {
      newSelected.delete(auId);
    }
    setSelectedAUs(newSelected);
    saveSelectedAUs(newSelected);
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const [name, category, owner] = lines[i].split(',').map(s => s.trim());
          if (name) {
            await fetch('/api/audit-universe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, category, owner })
            });
          }
        }

        toast.success(`تم استيراد ${lines.length - 1} عنصر`);
        loadUniverse();
      } catch (error) {
        toast.error('فشل في استيراد الملف');
      }
    };
    reader.readAsText(file);
  };

  const handleRiskAssess = async () => {
    if (!riskForm.au_id) {
      toast.error('الرجاء اختيار عنصر من الكون');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/risk/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskForm)
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(`تم التقييم - النتيجة: ${data.score.toFixed(2)}`);
        setRiskAssessments([...riskAssessments, data.data]);
      } else {
        toast.error(data.error || 'فشل في التقييم');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const generatePlanItems = async () => {
    if (selectedAUs.size === 0) {
      toast.error('الرجاء اختيار عناصر من الكون أولاً');
      return;
    }

    if (!currentPlan) {
      toast.error('لا توجد خطة نشطة');
      return;
    }

    const newItems: PlanItem[] = [];

    const selectedArray = Array.from(selectedAUs);
    for (const auId of selectedArray) {
      const au = universeItems.find(u => u.id === auId);
      if (!au) continue;

      // Find risk score for this AU
      const riskAssessment = riskAssessments.find(r => r.au_id === auId);
      const riskScore = riskAssessment?.score || 0;

      newItems.push({
        plan_id: currentPlan.id,
        au_id: auId,
        au_name: au.name,
        type: au.category || 'compliance',
        priority: riskScore > 15 ? 'high' : riskScore > 8 ? 'medium' : 'low',
        effort_days: Math.ceil(riskScore * 2) || 5,
        risk_score: riskScore
      });
    }

    // Sort by risk score
    newItems.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));

    setPlanItems(newItems);
    toast.success(`تم توليد ${newItems.length} بند`);
  };

  const savePlanItems = async () => {
    if (!currentPlan) {
      toast.error('لا توجد خطة نشطة');
      return;
    }

    if (planItems.length === 0) {
      toast.error('لا توجد بنود للحفظ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/plan/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planItems)
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(data.message || 'تم الحفظ بنجاح');
      } else {
        toast.error(data.error || 'فشل في الحفظ');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowAction = async (action: 'submit' | 'approve' | 'baseline' | 'generate') => {
    if (!currentPlan) {
      toast.error('لا توجد خطة نشطة');
      return;
    }

    const endpoints: Record<string, string> = {
      submit: `/api/plan/${currentPlan.id}/submit-review`,
      approve: `/api/plan/${currentPlan.id}/approve`,
      baseline: `/api/plan/${currentPlan.id}/baseline`,
      generate: `/api/plan/${currentPlan.id}/generate-engagements`
    };

    setLoading(true);
    try {
      const res = await fetch(endpoints[action], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'current_user', created_by: 'current_user' })
      });

      const data = await res.json();
      if (data.ok) {
        toast.success(data.message || 'تمت العملية بنجاح');

        if (action === 'baseline') {
          setCurrentPlan({
            ...currentPlan,
            status: 'baselined',
            baseline_hash: data.hash,
            baseline_date: data.baseline_date
          });
        } else if (action === 'generate') {
          toast.success(`تم إنشاء ${data.created_count} مهمة مع ${data.pbc_count} طلب PBC`);
        } else {
          setCurrentPlan({
            ...currentPlan,
            status: data.status
          });
        }
      } else {
        toast.error(data.error || 'فشلت العملية');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const updatePlanItem = (index: number, field: keyof PlanItem, value: any) => {
    const updated = [...planItems];
    updated[index] = { ...updated[index], [field]: value };
    setPlanItems(updated);
  };

  const isBaselined = currentPlan?.status === 'baselined';
  const isApproved = currentPlan?.status === 'approved';

  const filteredUniverse = universeItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          الخطة السنوية (RBIA)
        </h1>
        <p className="text-gray-600">
          التخطيط المبني على المخاطر للمراجعة الداخلية
        </p>
        {currentPlan && (
          <div className="mt-4 flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
              السنة: {currentPlan.year}
            </div>
            <div className={`px-4 py-2 rounded-lg ${
              isBaselined ? 'bg-green-100 text-green-800' :
              isApproved ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              الحالة: {
                isBaselined ? 'مجمّدة ✓' :
                isApproved ? 'معتمدة' :
                currentPlan.status === 'under_review' ? 'قيد المراجعة' :
                'مسودة'
              }
            </div>
            {isBaselined && currentPlan.baseline_hash && (
              <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                Hash: {currentPlan.baseline_hash.substring(0, 12)}...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {[
          { id: 'universe' as TabType, label: 'الكون القابل للمراجعة' },
          { id: 'risk' as TabType, label: 'تقييم المخاطر' },
          { id: 'items' as TabType, label: 'بنود الخطة' },
          { id: 'resources' as TabType, label: 'الموارد' },
          { id: 'approvals' as TabType, label: 'الاعتمادات' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={isBaselined && (tab.id === 'universe' || tab.id === 'items')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Universe Tab */}
        {activeTab === 'universe' && (
          <UniverseTab
            items={filteredUniverse}
            selectedAUs={selectedAUs}
            onSelect={handleAUSelection}
            onCSVImport={handleCSVImport}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            loading={loading}
            isLocked={isBaselined}
          />
        )}

        {/* Risk Tab */}
        {activeTab === 'risk' && (
          <RiskTab
            universeItems={universeItems}
            riskForm={riskForm}
            onFormChange={setRiskForm}
            onAssess={handleRiskAssess}
            assessments={riskAssessments}
            loading={loading}
          />
        )}

        {/* Plan Items Tab */}
        {activeTab === 'items' && (
          <PlanItemsTab
            items={planItems}
            onGenerate={generatePlanItems}
            onSave={savePlanItems}
            onUpdate={updatePlanItem}
            loading={loading}
            isLocked={isBaselined}
            selectedCount={selectedAUs.size}
          />
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <ResourcesTab
            planItems={planItems}
          />
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && currentPlan && (
          <ApprovalsTab
            plan={currentPlan}
            onAction={handleWorkflowAction}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

// Component: Universe Tab
function UniverseTab({
  items,
  selectedAUs,
  onSelect,
  onCSVImport,
  searchTerm,
  onSearch,
  loading,
  isLocked
}: {
  items: AuditUniverseItem[];
  selectedAUs: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onCSVImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  loading: boolean;
  isLocked: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">الكون القابل للمراجعة</h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={onCSVImport}
            className="hidden"
            disabled={isLocked}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            disabled={isLocked}
          >
            استيراد CSV
          </Button>
        </div>
      </div>

      <input
        type="text"
        placeholder="بحث..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
      />

      {loading ? (
        <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">لا توجد عناصر</div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    disabled={isLocked}
                    onChange={(e) => {
                      items.forEach(item => onSelect(item.id, e.target.checked));
                    }}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الفئة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الم��لك</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الأهمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedAUs.has(item.id)}
                      onChange={(e) => onSelect(item.id, e.target.checked)}
                      disabled={isLocked}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.category || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.owner || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {item.strategy_importance ? '★'.repeat(item.strategy_importance) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        محدد: {selectedAUs.size} من {items.length}
      </div>
    </div>
  );
}

// Component: Risk Tab
function RiskTab({
  universeItems,
  riskForm,
  onFormChange,
  onAssess,
  assessments,
  loading
}: {
  universeItems: AuditUniverseItem[];
  riskForm: any;
  onFormChange: (form: any) => void;
  onAssess: () => void;
  assessments: RiskAssessment[];
  loading: boolean;
}) {
  const calculateScore = () => {
    return riskForm.likelihood * riskForm.impact * (riskForm.weight / 100);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">تقييم المخاطر</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-4">نموذج التقييم</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                عنصر الكون
              </label>
              <select
                value={riskForm.au_id}
                onChange={(e) => onFormChange({ ...riskForm, au_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">اختر...</option>
                {universeItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاحتمالية (1-5): {riskForm.likelihood}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={riskForm.likelihood}
                onChange={(e) => onFormChange({ ...riskForm, likelihood: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                التأثير (1-5): {riskForm.impact}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={riskForm.impact}
                onChange={(e) => onFormChange({ ...riskForm, impact: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوزن (%): {riskForm.weight}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={riskForm.weight}
                onChange={(e) => onFormChange({ ...riskForm, weight: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="pt-2">
              <div className="text-lg font-semibold text-blue-600">
                النتيجة المتوقعة: {calculateScore().toFixed(2)}
              </div>
            </div>

            <Button
              onClick={onAssess}
              disabled={!riskForm.au_id || loading}
              className="w-full"
            >
              {loading ? 'جاري الحساب...' : 'حساب وإضافة'}
            </Button>
          </div>
        </div>

        {/* Heatmap */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-4">خريطة المخاطر الحرارية</h3>
          <RiskHeatmap assessments={assessments} />
        </div>
      </div>

      {/* Assessments List */}
      {assessments.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium mb-3">التقييمات المسجلة</h3>
          <div className="space-y-2">
            {assessments.map((assessment, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">ID: {assessment.au_id.substring(0, 8)}</span>
                <span className="text-sm">L:{assessment.likelihood} × I:{assessment.impact} × W:{assessment.weight}%</span>
                <span className="font-semibold text-blue-600">
                  {assessment.score?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Risk Heatmap
function RiskHeatmap({ assessments }: { assessments: RiskAssessment[] }) {
  const getCellColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCellCount = (likelihood: number, impact: number) => {
    return assessments.filter(
      a => a.likelihood === likelihood && a.impact === impact
    ).length;
  };

  return (
    <div className="grid grid-cols-6 gap-1">
      {/* Header */}
      <div className="col-span-1"></div>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={`impact-${i}`} className="text-center text-xs font-medium p-1">
          {i}
        </div>
      ))}

      {/* Rows */}
      {[5, 4, 3, 2, 1].map(likelihood => (
        <>
          <div key={`like-${likelihood}`} className="text-center text-xs font-medium p-1">
            {likelihood}
          </div>
          {[1, 2, 3, 4, 5].map(impact => {
            const count = getCellCount(likelihood, impact);
            return (
              <div
                key={`cell-${likelihood}-${impact}`}
                className={`${getCellColor(likelihood, impact)} text-white text-center p-4 rounded flex items-center justify-center font-bold`}
              >
                {count > 0 ? count : ''}
              </div>
            );
          })}
        </>
      ))}
    </div>
  );
}

// Component: Plan Items Tab
function PlanItemsTab({
  items,
  onGenerate,
  onSave,
  onUpdate,
  loading,
  isLocked,
  selectedCount
}: {
  items: PlanItem[];
  onGenerate: () => void;
  onSave: () => void;
  onUpdate: (index: number, field: keyof PlanItem, value: any) => void;
  loading: boolean;
  isLocked: boolean;
  selectedCount: number;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">بنود الخطة</h2>
        <div className="flex gap-2">
          <Button
            onClick={onGenerate}
            variant="outline"
            disabled={selectedCount === 0 || isLocked}
          >
            توليد من AU المختارة ({selectedCount})
          </Button>
          <Button
            onClick={onSave}
            disabled={items.length === 0 || loading || isLocked}
          >
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </div>

      {isLocked && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          ⚠️ الخطة مجمّدة - التحرير معطّل
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          لا توجد بنود. اضغط "توليد من AU المختارة" للبدء.
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الأولوية</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الجهد (أيام)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">البداية</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">النهاية</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">المخرج</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">النتيجة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{item.au_name}</td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.type || ''}
                      onChange={(e) => onUpdate(idx, 'type', e.target.value)}
                      disabled={isLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={item.priority || 'medium'}
                      onChange={(e) => onUpdate(idx, 'priority', e.target.value)}
                      disabled={isLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="high">عالية</option>
                      <option value="medium">متوسطة</option>
                      <option value="low">منخفضة</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.effort_days || 0}
                      onChange={(e) => onUpdate(idx, 'effort_days', parseFloat(e.target.value))}
                      disabled={isLocked}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={item.period_start || ''}
                      onChange={(e) => onUpdate(idx, 'period_start', e.target.value)}
                      disabled={isLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={item.period_end || ''}
                      onChange={(e) => onUpdate(idx, 'period_end', e.target.value)}
                      disabled={isLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.deliverable_type || ''}
                      onChange={(e) => onUpdate(idx, 'deliverable_type', e.target.value)}
                      disabled={isLocked}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="تقرير"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    {item.risk_score?.toFixed(1) || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        إجمالي البنود: {items.length}
      </div>
    </div>
  );
}

// Component: Resources Tab
function ResourcesTab({ planItems }: { planItems: PlanItem[] }) {
  const totalEffort = planItems.reduce((sum, item) => sum + (item.effort_days || 0), 0);
  const availableDays = 250; // Example capacity
  const allocated = totalEffort;
  const remaining = availableDays - allocated;
  const utilizationPct = (allocated / availableDays) * 100;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">الموارد والسعة</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">الأيام المتاحة</div>
          <div className="text-3xl font-bold text-blue-600">{availableDays}</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">المخصّص</div>
          <div className="text-3xl font-bold text-green-600">{allocated.toFixed(1)}</div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">المتبقي</div>
          <div className={`text-3xl font-bold ${remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {remaining.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">نسبة الاستخدام</span>
          <span className="text-sm font-medium text-gray-700">{utilizationPct.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${
              utilizationPct > 100 ? 'bg-red-600' :
              utilizationPct > 80 ? 'bg-yellow-600' :
              'bg-green-600'
            }`}
            style={{ width: `${Math.min(utilizationPct, 100)}%` }}
          />
        </div>
      </div>

      {utilizationPct > 100 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          ⚠️ تحذير: تجاوز الجهد المخصّص السعة المتاحة بمقدار {(allocated - availableDays).toFixed(1)} يوم
        </div>
      )}
    </div>
  );
}

// Component: Approvals Tab
function ApprovalsTab({
  plan,
  onAction,
  loading
}: {
  plan: PlanData;
  onAction: (action: 'submit' | 'approve' | 'baseline' | 'generate') => void;
  loading: boolean;
}) {
  const isBaselined = plan.status === 'baselined';
  const isApproved = plan.status === 'approved';
  const isUnderReview = plan.status === 'under_review';

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">الاعتمادات والتجميد</h2>

      <div className="space-y-4">
        {/* Current Status */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-2">الحالة الحالية</h3>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg text-lg font-semibold ${
              isBaselined ? 'bg-green-100 text-green-800' :
              isApproved ? 'bg-yellow-100 text-yellow-800' :
              isUnderReview ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {isBaselined ? 'مجمّدة ✓' :
               isApproved ? 'معتمدة' :
               isUnderReview ? 'قيد المراجعة' :
               'مسودة'}
            </div>
          </div>

          {isBaselined && plan.baseline_hash && (
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Hash:</span>{' '}
                <span className="font-mono">{plan.baseline_hash}</span>
              </div>
              {plan.baseline_date && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">التاريخ:</span>{' '}
                  {new Date(plan.baseline_date).toLocaleString('ar')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-4">الإجراءات</h3>
          <div className="space-y-3">
            {!isUnderReview && !isApproved && !isBaselined && (
              <Button
                onClick={() => onAction('submit')}
                disabled={loading}
                className="w-full"
              >
                إرسال للمراجعة
              </Button>
            )}

            {(isUnderReview || isApproved) && !isBaselined && (
              <Button
                onClick={() => onAction('approve')}
                disabled={loading || isApproved}
                variant={isApproved ? 'secondary' : 'success'}
                className="w-full"
              >
                {isApproved ? 'تم الاعتماد ✓' : 'اعتماد'}
              </Button>
            )}

            {isApproved && !isBaselined && (
              <Button
                onClick={() => onAction('baseline')}
                disabled={loading}
                variant="primary"
                className="w-full"
              >
                تجميد الخطة (Baseline)
              </Button>
            )}

            {isBaselined && (
              <Button
                onClick={() => onAction('generate')}
                disabled={loading}
                variant="success"
                className="w-full"
              >
                توليد المهام والـ PBC
              </Button>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
          <p className="font-medium mb-2">ملاحظات:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>بعد التجميد، لا يمكن تعديل البنود</li>
            <li>التجميد يُنشئ نسخة ثابتة (snapshot) مع Hash للتحقق</li>
            <li>توليد المهام يتم فقط بعد التجميد</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
