import { useState, useMemo } from 'react';
import StepIndicator from './StepIndicator';
import StepWhere from './StepWhere';
import StepWhen from './StepWhen';
import StepConfirm from './StepConfirm';
import { useOpsConfig } from '../../hooks/useOpsConfig';

export default function BookPanel({ onSubmitSuccess }) {
  const { opsConfig } = useOpsConfig();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: null,
    time: '',
  });

  // Set default time based on service hours
  useMemo(() => {
    if (!opsConfig || formData.time) return;
    const svcStart = String(opsConfig.service_hours_start || '08:00').split(':').map(Number);
    const svcEnd = String(opsConfig.service_hours_end || '19:00').split(':').map(Number);
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    m = m > 30 ? 0 : 30;
    if (m === 0) h++;
    if (h < svcStart[0]) h = svcStart[0];
    if (h >= svcEnd[0]) h = svcStart[0];
    const defaultTime = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    setFormData(prev => ({ ...prev, time: defaultTime }));
  }, [opsConfig]);

  const handleSuccess = () => {
    setFormData({ pickup: '', dropoff: '', date: null, time: '' });
    setCurrentStep(1);
    onSubmitSuccess();
  };

  return (
    <>
      <StepIndicator currentStep={currentStep} />
      {currentStep === 1 && (
        <StepWhere
          data={formData}
          onChange={setFormData}
          onNext={() => setCurrentStep(2)}
          serviceScopeText={opsConfig?.serviceScopeText}
        />
      )}
      {currentStep === 2 && (
        <StepWhen
          data={formData}
          onChange={setFormData}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
          opsConfig={opsConfig}
        />
      )}
      {currentStep === 3 && (
        <StepConfirm
          data={formData}
          onBack={() => setCurrentStep(2)}
          onSuccess={handleSuccess}
          opsConfig={opsConfig}
        />
      )}
    </>
  );
}
