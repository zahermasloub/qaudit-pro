/**
 * ========================================
 * Light Theme - Component Patches
 * ========================================
 * مقتطفات كود لتطبيق Light Theme على المكونات الأخرى
 * (Buttons، Tables، Forms، Modals، etc)
 */

/* ============================================
   BUTTONS
   ============================================ */

// ✅ Primary Button
<button
  className="
    inline-flex items-center justify-center
    px-4 py-2.5 rounded-lg
    font-semibold text-sm
    transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  "
  style={{
    backgroundColor: 'var(--primary)',
    color: 'var(--color-text-inverse)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.24)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--primary)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  حفظ
</button>

// ✅ Secondary Button
<button
  className="
    inline-flex items-center justify-center
    px-4 py-2.5 rounded-lg
    border font-semibold text-sm
    transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  "
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
    e.currentTarget.style.borderColor = 'var(--color-border-strong)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--surface)';
    e.currentTarget.style.borderColor = 'var(--border)';
  }}
>
  إلغاء
</button>

// ✅ Ghost/Icon Button
<button
  className="
    inline-flex items-center justify-center
    p-2 rounded-lg
    transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  "
  style={{
    backgroundColor: 'transparent',
    color: 'var(--text-2)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
    e.currentTarget.style.color = 'var(--text)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.color = 'var(--text-2)';
  }}
  aria-label="إجراء"
>
  <Icon size={20} aria-hidden="true" />
</button>

// ✅ Danger Button
<button
  className="
    inline-flex items-center justify-center
    px-4 py-2.5 rounded-lg
    font-semibold text-sm
    transition-all
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
  "
  style={{
    backgroundColor: 'var(--danger)',
    color: 'var(--color-text-inverse)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-danger-700)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--danger)';
  }}
>
  حذف
</button>

/* ============================================
   TABLES
   ============================================ */

// ✅ Table Container
<div
  className="rounded-lg border overflow-hidden"
  style={{
    borderColor: 'var(--border)',
    backgroundColor: 'var(--surface)',
    boxShadow: 'var(--shadow-card)',
  }}
>
  <table className="w-full">
    {/* Table Header */}
    <thead
      style={{
        backgroundColor: 'var(--table-header-bg)', // #F3F4F6
      }}
    >
      <tr>
        <th
          className="px-4 py-3 text-right text-sm font-semibold"
          style={{
            color: 'var(--table-header-text)', // #374151
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--border)',
          }}
        >
          الاسم
        </th>
        <th
          className="px-4 py-3 text-right text-sm font-semibold"
          style={{
            color: 'var(--table-header-text)',
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--border)',
          }}
        >
          الحالة
        </th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody>
      <tr
        className="transition-colors"
        style={{
          backgroundColor: 'var(--surface)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--row-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface)';
        }}
      >
        <td
          className="px-4 py-3 text-sm"
          style={{
            color: 'var(--text)',
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--border)',
          }}
        >
          محمد أحمد
        </td>
        <td
          className="px-4 py-3"
          style={{
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--border)',
          }}
        >
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-success-100)',
              color: 'var(--color-success-700)',
            }}
          >
            نشط
          </span>
        </td>
      </tr>

      {/* Selected Row */}
      <tr
        className="transition-colors"
        style={{
          backgroundColor: 'var(--row-selected)', // #E8F1FF
        }}
        aria-selected="true"
      >
        <td
          className="px-4 py-3 text-sm font-medium"
          style={{
            color: 'var(--text)',
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--primary)',
          }}
        >
          أحمد محمد
        </td>
        <td
          className="px-4 py-3"
          style={{
            borderBottomWidth: '1px',
            borderBottomColor: 'var(--primary)',
          }}
        >
          <span
            className="px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'var(--color-info-100)',
              color: 'var(--color-info-700)',
            }}
          >
            قيد المراجعة
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

/* ============================================
   FORMS (Input, Select, Textarea)
   ============================================ */

// ✅ Text Input
<input
  type="text"
  className="
    w-full px-3 py-2.5 rounded-lg
    border transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-1
  "
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  placeholder="أدخل النص هنا"
/>

// ✅ Select Dropdown
<select
  className="
    w-full px-3 py-2.5 rounded-lg
    border transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-1
  "
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  <option value="">اختر...</option>
  <option value="1">خيار 1</option>
  <option value="2">خيار 2</option>
</select>

// ✅ Textarea
<textarea
  className="
    w-full px-3 py-2.5 rounded-lg
    border transition-colors
    focus:outline-none focus:ring-2 focus:ring-offset-1
  "
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
    minHeight: '120px',
  }}
  onFocus={(e) => {
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(37, 99, 235, 0.1)`;
  }}
  onBlur={(e) => {
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  placeholder="أدخل الملاحظات"
/>

// ✅ Checkbox
<label className="inline-flex items-center gap-2 cursor-pointer">
  <input
    type="checkbox"
    className="
      w-5 h-5 rounded
      border-2 transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-1
    "
    style={{
      borderColor: 'var(--border)',
      accentColor: 'var(--primary)',
    }}
  />
  <span style={{ color: 'var(--text)' }}>أوافق على الشروط</span>
</label>

/* ============================================
   MODALS / DIALOGS
   ============================================ */

// ✅ Modal Overlay
<div
  className="fixed inset-0 z-50 flex items-center justify-center"
  style={{
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // --color-bg-overlay
  }}
  onClick={onClose}
>
  {/* Modal Content */}
  <div
    className="
      w-full max-w-lg mx-4
      rounded-lg shadow-xl
      animate-in fade-in zoom-in-95
    "
    style={{
      backgroundColor: 'var(--surface)',
      borderColor: 'var(--border)',
      borderWidth: '1px',
    }}
    onClick={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    {/* Modal Header */}
    <div
      className="px-6 py-4 border-b"
      style={{
        borderColor: 'var(--border)',
      }}
    >
      <h2
        id="modal-title"
        className="text-lg font-semibold"
        style={{ color: 'var(--text)' }}
      >
        عنوان النافذة
      </h2>
    </div>

    {/* Modal Body */}
    <div className="px-6 py-4">
      <p style={{ color: 'var(--text-2)' }}>
        محتوى النافذة المنبثقة هنا...
      </p>
    </div>

    {/* Modal Footer */}
    <div
      className="px-6 py-4 border-t flex items-center justify-end gap-3"
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface-hover)',
      }}
    >
      <button
        className="btn-secondary"
        onClick={onClose}
      >
        إلغاء
      </button>
      <button
        className="btn-primary"
        onClick={onConfirm}
      >
        تأكيد
      </button>
    </div>
  </div>
</div>

/* ============================================
   PROGRESS BAR
   ============================================ */

// ✅ Progress Bar
<div
  className="w-full h-2 rounded-full overflow-hidden"
  style={{
    backgroundColor: 'var(--progress-track)', // #E5E7EB
  }}
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
>
  <div
    className="h-full transition-all"
    style={{
      backgroundColor: 'var(--progress-fill)', // #2563EB
      width: `${progress}%`,
    }}
  />
</div>

/* ============================================
   SKELETON LOADER
   ============================================ */

// ✅ Skeleton
<div
  className="animate-pulse rounded-lg"
  style={{
    backgroundColor: 'var(--skeleton-base)', // #E5E7EB
    height: '40px',
  }}
  aria-hidden="true"
/>

// ✅ Skeleton with Shimmer
<div
  className="relative overflow-hidden rounded-lg"
  style={{
    backgroundColor: 'var(--skeleton-base)',
    height: '40px',
  }}
  aria-hidden="true"
>
  <div
    className="absolute inset-0 animate-shimmer"
    style={{
      background: `linear-gradient(
        90deg,
        transparent 0%,
        var(--skeleton-shine) 50%,
        transparent 100%
      )`,
    }}
  />
</div>

/* ============================================
   STATUS BADGES
   ============================================ */

// ✅ Info Badge (Open)
<span
  className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
  style={{
    backgroundColor: 'var(--color-info-100)',
    color: 'var(--color-info-700)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--info)' }} />
  مفتوح
</span>

// ✅ Success Badge (Closed)
<span
  className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
  style={{
    backgroundColor: 'var(--color-success-100)',
    color: 'var(--color-success-700)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--success)' }} />
  مكتمل
</span>

// ✅ Warning Badge (In Progress)
<span
  className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
  style={{
    backgroundColor: 'var(--color-warning-100)',
    color: 'var(--color-warning-700)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--warning)' }} />
  قيد التنفيذ
</span>

// ✅ Danger Badge (Failed)
<span
  className="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1"
  style={{
    backgroundColor: 'var(--color-danger-100)',
    color: 'var(--color-danger-700)',
  }}
>
  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--danger)' }} />
  فشل
</span>

/* ============================================
   EMPTY STATE
   ============================================ */

// ✅ Empty State
<div
  className="flex flex-col items-center justify-center py-12 px-6 text-center"
  style={{
    backgroundColor: 'var(--surface)',
    borderRadius: 'var(--radius)',
    borderWidth: '1px',
    borderColor: 'var(--border)',
    borderStyle: 'dashed',
  }}
>
  <div
    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
    style={{
      backgroundColor: 'var(--color-bg-muted)',
    }}
  >
    <Icon size={32} style={{ color: 'var(--muted)' }} aria-hidden="true" />
  </div>
  <h3
    className="text-base font-semibold mb-2"
    style={{ color: 'var(--text)' }}
  >
    لا توجد بيانات
  </h3>
  <p
    className="text-sm mb-4"
    style={{ color: 'var(--text-2)' }}
  >
    لم يتم العثور على أي سجلات حتى الآن
  </p>
  <button className="btn-primary">
    إضافة جديد
  </button>
</div>

/* ============================================
   TOAST / NOTIFICATION
   ============================================ */

// ✅ Success Toast
<div
  className="
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
    animate-in slide-in-from-top-2
  "
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--success)',
    borderWidth: '1px',
    borderLeftWidth: '4px',
  }}
  role="alert"
>
  <CheckCircle size={20} style={{ color: 'var(--success)' }} aria-hidden="true" />
  <p style={{ color: 'var(--text)' }}>تم الحفظ بنجاح</p>
</div>

// ✅ Error Toast
<div
  className="
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
    animate-in slide-in-from-top-2
  "
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--danger)',
    borderWidth: '1px',
    borderLeftWidth: '4px',
  }}
  role="alert"
>
  <AlertCircle size={20} style={{ color: 'var(--danger)' }} aria-hidden="true" />
  <p style={{ color: 'var(--text)' }}>حدث خطأ</p>
</div>

/* ============================================
   CSS ANIMATION FOR SHIMMER
   ============================================ */

/**
 * أضف هذا في globals.css أو theme-light.css:
 */

/*
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}
*/
