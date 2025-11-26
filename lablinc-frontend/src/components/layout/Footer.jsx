import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo-container">
            <img src="/logo.png" alt="LabLinc Logo" className="footer-logo" />
            <h3>LabLinc</h3>
          </div>
          <p>Bridging Academia & Industry</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/equipment">Equipment</Link>
          <Link to="/about">About</Link>
          <Link to="/partner">Partner</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>lablinc.global@gmail.com</p>
          <p><a href="tel:+917353957307">+91 73539 57307</a></p>
          <p><a href="tel:+918217076246">+91 82170 76246</a></p>
          <p>VTU, Belagavi - 590018</p>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <a href="https://www.instagram.com/lablinc" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.linkedin.com/company/lablinc" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2024 LabLinc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
