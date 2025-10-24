import dynamic from 'next/dynamic';

// تحميل PlanShell بشكل ديناميكي بدون SSR
const PlanShell = dynamic(() => import('@/src/components/shell/PlanShell'), {
  ssr: false,
});

type PlanPageProps = {
  params: {
    id: string;
  };
};

export default function PlanPage({ params }: PlanPageProps) {
  return <PlanShell planIdFromRoute={params.id} />;
}
