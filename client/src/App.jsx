import { useState } from 'react';
import './App.css';
import CustomerForm from './components/CustomerForm';
import AdminView from './components/AdminView';

function App() {
  const [view, setView] = useState('customer');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Rockwood Auto Insurance</h1>
        <nav>
          <button
            className={view === 'customer' ? 'active' : ''}
            onClick={() => setView('customer')}
          >
            Get a Quote
          </button>
          <button
            className={view === 'admin' ? 'active' : ''}
            onClick={() => setView('admin')}
          >
            Admin View
          </button>
        </nav>
      </header>

      <main>
        {view === 'customer' ? <CustomerForm /> : <AdminView />}
      </main>
    </div>
  );
}

export default App;