import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { partnerAPI } from '../api/partner.api';
import './PartnerPage.css';

const PartnerPage = () => {
  const equipmentTypes = [
    'CNC Machines',
    '3D Printers',
    'Electronics Lab Equipment',
    'GPU Workstations',
    'AI Servers',
    'Total Station',
    'Rainwater Harvesting Systems',
    'Material Testing Equipment'
  ];

  const [formData, setFormData] = useState({
    instituteName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    instrumentsAvailable: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await partnerAPI.submitApplication(formData);
      
      if (response.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            instituteName: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            instrumentsAvailable: '',
            message: '',
          });
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container">
        <section className="hero">
          <h1 style={{ color: 'white' }}>Partner With LabLinc</h1>
          <p style={{ color: 'white' }}>Join our network and make your equipment accessible to innovators</p>
        </section>

        <section className="benefits">
          <h2>Why Partner With LabLinc?</h2>
          <div className="benefitGrid">
            <div className="benefit">
              <h3>💰 Generate Revenue</h3>
              <p>Monetize idle equipment and generate additional income for your institution</p>
            </div>
            <div className="benefit">
              <h3>🤝 Industry Collaboration</h3>
              <p>Connect with startups, MSMEs, and innovators for potential partnerships</p>
            </div>
            <div className="benefit">
              <h3>📊 Better Utilization</h3>
              <p>Maximize the ROI on expensive equipment investments</p>
            </div>
            <div className="benefit">
              <h3>🎓 Student Exposure</h3>
              <p>Provide students with real-world industry exposure and networking</p>
            </div>
          </div>
        </section>

        <section className="equipment">
          <h2>Accepted Equipment Types</h2>
          <div className="equipmentList">
            {equipmentTypes.map((type) => (
              <div key={type} className="equipmentItem">
                ✓ {type}
              </div>
            ))}
          </div>
        </section>

        <section className="formSection">
          <h2>Partner Application Form</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="formGroup">
              <label>Institute Name *</label>
              <input 
                type="text" 
                name="instituteName"
                value={formData.instituteName}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="formGroup">
              <label>Coordinator Name *</label>
              <input 
                type="text" 
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="formGroup">
              <label>Email *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="formGroup">
              <label>Phone *</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="formGroup">
              <label>Address *</label>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                required 
                rows="3"
                placeholder="Complete address of your institute"
              ></textarea>
            </div>

            <div className="formGroup">
              <label>Available Instruments *</label>
              <textarea 
                name="instrumentsAvailable"
                value={formData.instrumentsAvailable}
                onChange={handleChange}
                required 
                rows="5"
                placeholder="Please describe the instruments you would like to list"
              ></textarea>
            </div>

            <div className="formGroup">
              <label>Message</label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us about your equipment and facilities..."
              ></textarea>
            </div>

            {error && (
              <div className="errorMessage">
                {error}
              </div>
            )}

            <button type="submit" className="submitBtn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          {submitted && (
            <div className="successMessage">
              ✓ Application submitted successfully! We'll contact you soon.
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default PartnerPage;
