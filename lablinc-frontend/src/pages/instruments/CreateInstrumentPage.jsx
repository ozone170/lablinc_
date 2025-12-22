import { useNavigate } from 'react-router-dom';
import NoFooterLayout from '../../components/layout/NoFooterLayout';
import { InstrumentForm } from '../../components/instruments';

const CreateInstrumentPage = () => {
  const navigate = useNavigate();

  return (
    <NoFooterLayout>
      <div className="container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Add New Instrument</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Fill in the details below to list your instrument on LabLinc
        </p>
        
        <InstrumentForm
          onSuccess={() => {
            alert('Instrument created successfully!');
            navigate('/dashboard');
          }}
          onCancel={() => navigate('/dashboard')}
        />
      </div>
    </NoFooterLayout>
  );
};

export default CreateInstrumentPage;
