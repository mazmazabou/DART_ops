export default function StepIndicator({ currentStep }) {
  return (
    <div className="step-indicator mb-16" id="step-indicator">
      {[1, 2, 3].map(s => (
        <div
          key={s}
          className={`step-dot${s === currentStep ? ' active' : ''}${s < currentStep ? ' completed' : ''}`}
          data-step={s}
        />
      ))}
    </div>
  );
}
