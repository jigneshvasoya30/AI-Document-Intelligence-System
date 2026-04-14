import { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/DocumentList';
import DocumentUpload from './pages/DocumentUpload';
import DocumentDetails from './pages/DocumentDetails';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`);
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 10000); // Polling for updates
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    if (selectedDocId) {
      return (
        <DocumentDetails 
          docId={selectedDocId} 
          onBack={() => setSelectedDocId(null)} 
          onRefresh={fetchInvoices}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard invoices={invoices} onSelectDoc={setSelectedDocId} />;
      case 'documents':
        return <DocumentList invoices={invoices} onSelectDoc={setSelectedDocId} onRefresh={fetchInvoices} />;
      case 'upload':
        return <DocumentUpload onUploadComplete={() => { setActiveTab('documents'); fetchInvoices(); }} />;
      default:
        return <Dashboard invoices={invoices} onSelectDoc={setSelectedDocId} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSelectedDocId(null); }} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10">
          <h1 className="text-xl font-semibold capitalize">
            {selectedDocId ? 'Document Analysis' : activeTab}
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20">
              System Active
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
