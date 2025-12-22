const PricingForm = ({ pricing = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...pricing,
      [field]: value,
    });
  };

  return (
    <div className="pricing-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
          <input
            type="number"
            id="hourlyRate"
            value={pricing.hourlyRate || ''}
            onChange={(e) => handleChange('hourlyRate', e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dailyRate">Daily Rate (₹)</label>
          <input
            type="number"
            id="dailyRate"
            value={pricing.dailyRate || ''}
            onChange={(e) => handleChange('dailyRate', e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="weeklyRate">Weekly Rate (₹) - Optional</label>
          <input
            type="number"
            id="weeklyRate"
            value={pricing.weeklyRate || ''}
            onChange={(e) => handleChange('weeklyRate', e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label htmlFor="monthlyRate">Monthly Rate (₹) - Optional</label>
          <input
            type="number"
            id="monthlyRate"
            value={pricing.monthlyRate || ''}
            onChange={(e) => handleChange('monthlyRate', e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="securityDeposit">Security Deposit (₹) - Optional</label>
        <input
          type="number"
          id="securityDeposit"
          value={pricing.securityDeposit || ''}
          onChange={(e) => handleChange('securityDeposit', e.target.value)}
          placeholder="0"
          min="0"
          step="0.01"
        />
      </div>

      <div className="pricing-note">
        <small>* At least hourly or daily rate is required</small>
      </div>
    </div>
  );
};

export default PricingForm;
