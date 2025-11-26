import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { instrumentsAPI } from '../api/instruments.api';
import './HomePage.css';

const HomePage = () => {
  const [featuredInstruments, setFeaturedInstruments] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    'CNC Machines',
    '3D Printers',
    'Electronics',
    'Mechanical',
    'Material Testing',
    'GPU Workstations',
    'AI Servers',
    'Civil',
    'Environmental',
    'Prototyping'
  ];

  useEffect(() => {
    const fetchFeaturedInstruments = async () => {
      try {
        const response = await instrumentsAPI.getInstruments({ limit: 6 });
        if (response.success) {
          setFeaturedInstruments(response.data.instruments);
        }
      } catch (error) {
        console.error('Error fetching featured instruments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedInstruments();
  }, []);

  const instituteOfferings = [
    {
      title: 'CNC Lathe Machine Training',
      description: 'Hands-on training for precision machining and manufacturing'
    },
    {
      title: 'Additive Manufacturing',
      description: '3D printing technology and rapid prototyping courses'
    },
    {
      title: 'AI Computing Lab Setup',
      description: 'A100 & RTX 4090 workstations for AI/ML research'
    },
    {
      title: 'Surveying & Geomatics',
      description: 'Total Station training for civil engineering students'
    },
    {
      title: 'Sustainability Labs',
      description: 'Rainwater harvesting and environmental engineering'
    },
    {
      title: 'Industry 4.0 Training',
      description: 'Smart manufacturing and automation programs'
    }
  ];

  const companyOfferings = [
    {
      title: 'Custom Manufacturing & Prototyping',
      description: 'Rapid prototyping and small-batch production services'
    },
    {
      title: 'Production Process Automation',
      description: 'CNC machining and automated manufacturing solutions'
    },
    {
      title: 'AI/ML Compute Support',
      description: 'GPU cloud/node support for machine learning workloads'
    },
    {
      title: 'CAD/CAM Design Assistance',
      description: 'Professional design and engineering support'
    },
    {
      title: 'Product Development R&D',
      description: 'Research and development facilities access'
    },
    {
      title: 'On-site CNC Machining Support',
      description: 'Expert technicians and equipment for your projects'
    }
  ];

  return (
    <MainLayout>
      <section className="hero">
        <div className="heroContent">
          <h1 style={{ textAlign: 'center' }}>Bridging Academia & Industry Through Smart Equipment Sharing</h1>
          <p style={{ textAlign: 'center' }}>Make idle college equipment accessible to startups, MSMEs, and innovators — with real-time booking, expert support, and secure payments.</p>
          <div className="heroButtons">
            <Link to="/equipment" className="btnPrimary">Explore Equipment</Link>
            <Link to="/partner" className="btnSecondary">Partner With Us</Link>
          </div>
        </div>
      </section>

      <section className="categories">
        <h2>Equipment Categories</h2>
        <div className="categoryGrid">
          {categories.map((category) => (
            <Link to={`/equipment?category=${encodeURIComponent(category)}`} key={category} className="categoryCard">
              <h3>{category}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured">
        <h2>Featured Equipment</h2>
        {loading ? (
          <div className="featuredGrid">
            <div className="featuredCard">
              <div className="featuredImage"></div>
              <h3>Loading...</h3>
            </div>
          </div>
        ) : (
          <div className="featuredGrid">
            {featuredInstruments.map((instrument) => (
              <Link to={`/equipment/${instrument._id}`} key={instrument._id} className="featuredCard">
                <div className="featuredImage">
                  {instrument.photos && instrument.photos.length > 0 ? (
                    <img src={instrument.photos[0]} alt={instrument.name} loading="lazy" />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '3rem'
                    }}>
                      🔬
                    </div>
                  )}
                </div>
                <h3>{instrument.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="offerings">
        <div className="offeringsContainer">
          <div className="offeringSection">
            <h2>For Institutes</h2>
            <div className="offeringGrid">
              {instituteOfferings.map((offering, index) => (
                <div key={index} className="offeringCard">
                  <div className="offeringIcon">🎓</div>
                  <h3>{offering.title}</h3>
                  <p>{offering.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="offeringSection">
            <h2>For Companies / MSMEs / Startups</h2>
            <div className="offeringGrid">
              {companyOfferings.map((offering, index) => (
                <div key={index} className="offeringCard">
                  <div className="offeringIcon">🏢</div>
                  <h3>{offering.title}</h3>
                  <p>{offering.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="howItWorks">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="stepNumber">1</div>
            <h3>Browse</h3>
            <p>Explore our equipment catalog</p>
          </div>
          <div className="step">
            <div className="stepNumber">2</div>
            <h3>Check Availability</h3>
            <p>View real-time availability</p>
          </div>
          <div className="step">
            <div className="stepNumber">3</div>
            <h3>Visit Institute</h3>
            <p>Coordinate with the institution</p>
          </div>
          <div className="step">
            <div className="stepNumber">4</div>
            <h3>Use Equipment</h3>
            <p>Access the equipment you need</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <Link to="/contact" className="btnPrimary">Contact Us</Link>
      </section>
    </MainLayout>
  );
};

export default HomePage;
