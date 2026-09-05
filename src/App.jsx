import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import TrackRecord from './components/TrackRecord';
import Workflow from './components/Workflow';
import Pricing from './components/Pricing';
import Registration from './components/Registration';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    const handleUrlChange = () => {
      const search = window.location.search;
      const path = window.location.pathname;
      if (search.includes('view=admin') || search.includes('admin=true') || path === '/admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    // Run on initial load
    handleUrlChange();

    // Listen for URL changes
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleBackToWeb = () => {
    window.history.pushState({}, '', '/');
    setIsAdmin(false);
  };

  if (isAdmin) {
    return <AdminDashboard onBackToWeb={handleBackToWeb} />;
  }

  return (
    <>
      <Header />
      <Hero />
      <About />
      <TrackRecord />
      <Workflow />
      <Pricing />
      <Registration 
        showSelectModal={showSelectModal}
        setShowSelectModal={setShowSelectModal}
        activeForm={activeForm}
        setActiveForm={setActiveForm}
      />
      <FAQ />
      <Footer onStartSubscription={() => setShowSelectModal(true)} />
    </>
  );
}

export default App;

