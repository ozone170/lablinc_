import Header from './Header';
import './NoFooterLayout.css';

const NoFooterLayout = ({ children }) => {
  return (
    <div className="no-footer-layout">
      <Header />
      <main className="no-footer-main-content">
        {children}
      </main>
    </div>
  );
};

export default NoFooterLayout;