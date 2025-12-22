import NoFooterLayout from '../components/layout/NoFooterLayout';
import './AboutPage.css';

const AboutPage = () => {
  const team = [
    { name: 'Niranjan Desai', role: 'Operations' },
    { name: 'Narendra Hannurkar', role: 'Operations' },
    { name: 'Aditya Shinde', role: 'Technical' }
  ];

  return (
    <NoFooterLayout>
      <div className="container">
        <section className="hero">
          <h1 style={{ color: 'white' }}>About LabLinc</h1>
        </section>

        <section className="section">
          <h2>Who We Are</h2>
          <p>
            LabLinc is a technology platform that connects engineering colleges with startups, 
            MSMEs, and innovators. We bridge the gap between idle academic resources and 
            industry needs, making advanced equipment accessible to those who need it most.
          </p>
        </section>

        <section className="section">
          <h2>Our Mission</h2>
          <p>
            To maximize asset utilization while enabling affordable innovation across India. 
            We believe that expensive equipment sitting idle in colleges can power the next 
            generation of startups and innovations.
          </p>
        </section>

        <section className="team">
          <h2>Our Team</h2>
          <div className="teamGrid">
            {team.map((member) => (
              <div key={member.name} className="teamCard">
                <div className="avatar"></div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </NoFooterLayout>
  );
};

export default AboutPage;
