const HelpPage = () => {
  return (
    <div className="container help-page">
      <h1>Help & Support</h1>

      <section className="help-section">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-item">
          <h3>How do I book equipment?</h3>
          <p>Browse available equipment, select your desired dates, and submit a booking request. The equipment owner will review and confirm your booking.</p>
        </div>

        <div className="faq-item">
          <h3>How do I list my equipment?</h3>
          <p>If you're registered as an Institute, go to your dashboard and click "Add Equipment". Fill in the details and upload photos of your equipment.</p>
        </div>

        <div className="faq-item">
          <h3>What payment methods are accepted?</h3>
          <p>We accept credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.</p>
        </div>

        <div className="faq-item">
          <h3>Can I cancel a booking?</h3>
          <p>Yes, you can cancel a booking before it's confirmed or started. Check our cancellation policy for refund details.</p>
        </div>

        <div className="faq-item">
          <h3>How do I contact support?</h3>
          <p>You can reach us through the Contact page or email us at support@lablinc.com</p>
        </div>
      </section>

      <section className="help-section">
        <h2>Getting Started</h2>
        <ol>
          <li>Create an account as MSME or Institute</li>
          <li>Complete your profile</li>
          <li>Browse or list equipment</li>
          <li>Make or receive bookings</li>
          <li>Complete transactions securely</li>
        </ol>
      </section>

      <section className="help-section">
        <h2>Need More Help?</h2>
        <p>Contact our support team:</p>
        <ul>
          <li>Email: support@lablinc.com</li>
          <li>Phone: +91 1234567890</li>
          <li>Hours: Mon-Fri, 9 AM - 6 PM IST</li>
        </ul>
      </section>
    </div>
  );
};

export default HelpPage;
