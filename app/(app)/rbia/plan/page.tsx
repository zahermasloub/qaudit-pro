'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import RbiaPlanView from './RbiaPlanView';
import CreatePlanWizard from './CreatePlanWizard';

export default function PlanPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    // Show wizard if ?new=1 is present
    if (searchParams.get('new') === '1') {
      setShowWizard(true);
    }
  }, [searchParams]);

  const handleCloseWizard = () => {
    setShowWizard(false);
    // Remove ?new=1 from URL
    router.replace('/rbia/plan');
  };

  if (showWizard) {
    return (
      <div className="w-full min-h-screen bg-gray-50 py-8 px-4">
        <CreatePlanWizard onClose={handleCloseWizard} />
      </div>
    );
  }

  return <RbiaPlanView mode="plan" />;
}

