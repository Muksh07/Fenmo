import { useState, useEffect } from 'react';
import { Filter, TrendingDown, Calendar, Tag, FileText, Loader2, RefreshCw } from 'lucide-react';
import { listExpenses, ListExpensesParams } from '../lib/api';
import { Expense } from '../lib/supabase';
import { formatCurrency, formatDate, CATEGORIES } from '../lib/utils';

interface ExpenseListProps {
  refreshTrigger: number;
}

export function ExpenseList({ refreshTrigger }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState('0.00');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc'>('date_desc');

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: ListExpensesParams = {
        sort: sortOrder,
      };

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      const result = await listExpenses(params);
      setExpenses(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger, selectedCategory, sortOrder]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Food: 'bg-orange-100 text-orange-700 border-orange-200',
      Travel: 'bg-blue-100 text-blue-700 border-blue-200',
      Shopping: 'bg-pink-100 text-pink-700 border-pink-200',
      Bills: 'bg-red-100 text-red-700 border-red-200',
      Rent: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      Entertainment: 'bg-purple-100 text-purple-700 border-purple-200',
      Health: 'bg-green-100 text-green-700 border-green-200',
      Others: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return colors[category] || colors.Others;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            Expenses
          </h2>
          <button
            onClick={fetchExpenses}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="category-filter" className="block text-xs font-medium text-gray-600 mb-1">
              <Filter className="w-3 h-3 inline mr-1" />
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm bg-white"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="sort-order" className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Sort by Date
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'date_desc' | 'date_asc')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-sm bg-white"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-3xl font-bold text-gray-800">{formatCurrency(total)}</div>
          {selectedCategory && (
            <div className="text-xs text-gray-500 mt-1">
              Filtered by {selectedCategory}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No expenses found</p>
            <p className="text-gray-400 text-sm mt-2">
              {selectedCategory ? 'Try selecting a different category' : 'Start by adding your first expense'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-gray-300 bg-gradient-to-r from-white to-gray-50"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(expense.category)}`}>
                        <Tag className="w-3 h-3 inline mr-1" />
                        {expense.category}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(expense.date)}
                      </span>
                    </div>
                    {expense.description && (
                      <p className="text-sm text-gray-700 flex items-start gap-1">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{expense.description}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold text-gray-800">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
