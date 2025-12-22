import { useState } from 'react';
import NoFooterLayout from '../components/layout/NoFooterLayout';
import { contactAPI } from '../api/contact.api';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      const response = await contactAPI.submitMessage(formData);
      
      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoFooterLayout>
      <div className="container">
        <h1>Contact Us</h1>
        
        <div className="content">
          <div className="formSection">
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="form">
              <div className="formGroup">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
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
                <label>Subject *</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required 
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="formGroup">
                <label>Message *</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required 
                  rows="5"
                  placeholder="Tell us about your requirements..."
                ></textarea>
              </div>

              {success && (
                <div className="successMessage">
                  ✓ Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {error && (
                <div className="errorMessage">
                  {error}
                </div>
              )}

              <button type="submit" className="submitBtn" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="infoSection">
            <h2>Contact Information</h2>
            
            <div className="infoItem">
              <h3>📧 Email</h3>
              <a href="mailto:lablinc.global@gmail.com">lablinc.global@gmail.com</a>
            </div>

            <div className="infoItem">
              <h3>📞 Phone</h3>
              <a href="tel:+917353957307">+91 73539 57307</a>
              <a href="tel:+918217076246">+91 82170 76246</a>
            </div>

            <div className="infoItem">
              <h3>📍 Address</h3>
              <p>VTU, Jnana Sangama<br />Belagavi – 590018<br />Karnataka, India</p>
            </div>

            <div className="infoItem">
              <h3>🔗 Social Media</h3>
              <div className="social">
                <a href="https://www.instagram.com/lablinc" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href="https://www.linkedin.com/company/lablinc" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NoFooterLayout>
  );
};

export default ContactPage;
