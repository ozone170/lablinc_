import { useParams, useNavigate } from 'react-router-dom';
import NoFooterLayout from '../../components/layout/NoFooterLayout';
import { InstrumentForm } from '../../components/instruments';

const EditInstrumentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <NoFooterLayout>
      <div className="container" style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        <h1>Edit Instrument</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Update your instrument details
        </p>
        
        <InstrumentForm
          instrumentId={id}
          onSuccess={() => {
            alert('Instrument updated successfully!');
            navigate(`/instrument/${id}`);
          }}
          onCancel={() => navigate(`/instrument/${id}`)}
        />
      </div>
    </NoFooterLayout>
  );
};

export default EditInstrumentPage;
