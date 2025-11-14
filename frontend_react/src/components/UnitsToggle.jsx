import React from 'react';

// PUBLIC_INTERFACE
function UnitsToggle({ units, onChange }) {
  /** Toggle between metric and imperial units. */
  const isMetric = units.temperature === 'celsius';

  const handleToggle = () => {
    if (isMetric) {
      onChange({ temperature: 'fahrenheit', wind: 'mph', precip: 'inch' });
    } else {
      onChange({ temperature: 'celsius', wind: 'kmh', precip: 'mm' });
    }
  };

  return (
    <button
      className="btn-toggle"
      onClick={handleToggle}
      aria-label="Toggle units"
      title="Toggle units"
    >
      {isMetric ? '°C • km/h • mm' : '°F • mph • in'}
    </button>
  );
}

export default React.memo(UnitsToggle);
