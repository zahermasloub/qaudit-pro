export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">لوحة التحكم</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">إجمالي المشاريع</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">المشاريع النشطة</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">المشاريع المكتملة</h3>
          </div>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </div>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">معدل الإنجاز</h3>
          </div>
          <div className="text-2xl font-bold">0%</div>
          <p className="text-xs text-muted-foreground">
            +0% من الشهر الماضي
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold">المشاريع الأخيرة</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">لا توجد مشاريع حتى الآن</p>
          </div>
        </div>
        <div className="col-span-3 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-semibold">الإحصائيات</h3>
          <div className="mt-4">
            <p className="text-muted-foreground">ستظهر الإحصائيات هنا</p>
          </div>
        </div>
      </div>
    </div>
  );
}