import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleExpenseCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
              <Wallet className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Expense Tracker
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track your spending, manage your budget</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ExpenseForm onExpenseCreated={handleExpenseCreated} />
          </div>

          <div className="lg:col-span-2">
            <ExpenseList refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Built with React, TypeScript, Tailwind CSS & Supabase</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
