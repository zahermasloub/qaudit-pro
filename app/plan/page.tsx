import dynamic from 'next/dynamic';

const PlanShell = dynamic(() => import('@/src/components/shell/PlanShell'), { ssr: false });

export default function PlanPage() {
  return <PlanShell />;
}
