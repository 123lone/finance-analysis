import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountCard from '../components/AccountCard';
import SavingsCard from '../components/SavingsCard';
import TransactionTable from '../components/TransactionTable';
import axiosInstance, { endpoints } from '../api/axios';

function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', currentAmount: '' });
  const [dashboardStats, setDashboardStats] = useState({
    totalAccounts: 0,
    totalBalance: 0,
    totalTransactions: 0,
    savingsRate: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all dashboard data in parallel
      const [accountsRes, transactionsRes, goalsRes] = await Promise.all([
        axiosInstance.get(endpoints.accounts.list),
        axiosInstance.get(endpoints.transactions.list),
        axiosInstance.get(endpoints.goals.list).catch(() => ({ data: [] })),
      ]);

      // Process accounts data
      let rawAccounts = accountsRes.data.data || accountsRes.data || [];
      rawAccounts = Array.isArray(rawAccounts) ? rawAccounts : [];
      const accountsData = rawAccounts.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        type: acc.accountType ? acc.accountType.replace('_', ' ') : 'Unknown',
        balance: acc.currentBalance || 0,
        lastUpdated: acc.createdAt ? new Date(acc.createdAt).toISOString().split('T')[0] : null,
      }));
      setAccounts(accountsData);

      // Process transactions data
      let rawTransactions = transactionsRes.data.data || transactionsRes.data || [];
      rawTransactions = Array.isArray(rawTransactions) ? rawTransactions : [];
      const transactionsData = rawTransactions.map(t => ({
        id: t.id,
        date: t.transactionDate ? new Date(t.transactionDate).toISOString().split('T')[0] : '',
        description: t.merchant || t.description,
        category: t.category,
        amount: parseFloat(t.amount) || 0,
        type: t.type ? String(t.type).toLowerCase() : 'expense',
        status: 'completed',
      }));
      setTransactions(transactionsData);

      // Process goals data
      const goalsData = goalsRes.data || [];
      setGoals(Array.isArray(goalsData) ? goalsData : []);

      // Process analytics/dashboard stats locally
      const stats = {};
      
      // Calculate stats if not provided by API
      const totalBalance = accountsData.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);
      const monthlyIncome = transactionsData
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
      const monthlyExpenses = Math.abs(
        transactionsData
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
      );
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

      setDashboardStats({
        totalAccounts: accountsData.length,
        totalBalance: stats.totalBalance || totalBalance,
        totalTransactions: transactionsData.length,
        savingsRate: stats.savingsRate || savingsRate,
        monthlyIncome: stats.monthlyIncome || monthlyIncome,
        monthlyExpenses: stats.monthlyExpenses || monthlyExpenses,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }

      // Set default/empty data
      setDashboardStats({
        totalAccounts: 0,
        totalBalance: 0,
        totalTransactions: 0,
        savingsRate: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: goalForm.title,
        targetAmount: parseFloat(goalForm.targetAmount),
        currentAmount: goalForm.currentAmount ? parseFloat(goalForm.currentAmount) : 0
      };

      if (editingGoalId) {
        await axiosInstance.put(endpoints.goals.update(editingGoalId), payload);
      } else {
        await axiosInstance.post(endpoints.goals.create, payload);
      }
      
      setShowGoalModal(false);
      setEditingGoalId(null);
      setGoalForm({ title: '', targetAmount: '', currentAmount: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to save goal', err);
    }
  };

  const openEditGoalModal = (goal) => {
    setEditingGoalId(goal.id);
    setGoalForm({
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount
    });
    setShowGoalModal(true);
  };

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  );

  // Error banner
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-4">
            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your financial overview</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Balance</p>
                <h2 className="text-3xl font-bold">${dashboardStats.totalBalance.toFixed(2)}</h2>
              </div>
              <div className="bg-blue-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.16 2.75a1 1 0 00-.32 1.67l.5.33v3.5a1 1 0 001.8.6l.5-.33v3.5a1 1 0 001.8.6l.5-.33V4.75a1 1 0 00-1.8-.6l-.5.33v-1a1 1 0 00-1.48-.9l-.5.33V2.75z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-200 text-sm">Across all accounts</p>
          </div>

          {/* Total Accounts */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-emerald-100 text-sm mb-1">Total Accounts</p>
                <h2 className="text-3xl font-bold">{dashboardStats.totalAccounts}</h2>
              </div>
              <div className="bg-emerald-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            </div>
            <p className="text-emerald-200 text-sm">Active accounts</p>
          </div>

          {/* Monthly Income */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm mb-1">Monthly Income</p>
                <h2 className="text-3xl font-bold">${dashboardStats.monthlyIncome.toFixed(2)}</h2>
              </div>
              <div className="bg-green-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V9.914l-5.293 5.293a1 1 0 01-1.414-1.414L13.914 8.5H12z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-green-200 text-sm">This month</p>
          </div>

          {/* Savings Rate */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm mb-1">Savings Rate</p>
                <h2 className="text-3xl font-bold">{dashboardStats.savingsRate.toFixed(1)}%</h2>
              </div>
              <div className="bg-purple-500 bg-opacity-30 rounded-full p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 2.586L15.414 5A2 2 0 0116 6.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
            </div>
            <p className="text-purple-200 text-sm">Of monthly income</p>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalTransactions}</p>
                )}
              </div>
              <div className="text-4xl text-blue-500 opacity-20">
                <svg fill="currentColor" viewBox="0 0 20 20" className="w-12 h-12">
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1 4.5 4.5 0 11-4.384 5.98z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">All-time</p>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Monthly Expenses</p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-600">${dashboardStats.monthlyExpenses.toFixed(2)}</p>
                )}
              </div>
              <div className="text-4xl text-red-500 opacity-20">
                <svg fill="currentColor" viewBox="0 0 20 20" className="w-12 h-12">
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V15a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          {/* Net Savings */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">Net Savings</p>
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-green-600">
                    ${(dashboardStats.monthlyIncome - dashboardStats.monthlyExpenses).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="text-4xl text-green-500 opacity-20">
                <svg fill="currentColor" viewBox="0 0 20 20" className="w-12 h-12">
                  <path d="M2 10a8 8 0 108 8 8 8 0 00-8-8zm7 11V9H7V7h2V5h2v2h2v2h-2v10h-2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Accounts</h2>
            <button
              onClick={() => navigate('/accounts')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {accounts.slice(0, 3).map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h-6m0 0h-6m0-6V6m0 0V0m0 6v6m0 0v6" />
              </svg>
              <p className="text-gray-600">No accounts yet. Create one to get started.</p>
              <button
                onClick={() => navigate('/accounts')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Account
              </button>
            </div>
          )}
        </div>

        {/* Savings Goals */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
            <button
              onClick={() => {
                setEditingGoalId(null);
                setGoalForm({ title: '', targetAmount: '', currentAmount: '' });
                setShowGoalModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 text-sm"
            >
              + Add Goal
            </button>
          </div>
          
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map(goal => (
                <div key={goal.id} onClick={() => openEditGoalModal(goal)} className="cursor-pointer transform hover:scale-105 transition-transform">
                  <SavingsCard title={goal.title} current={goal.currentAmount} target={goal.targetAmount} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No savings goals set yet.</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center space-x-1"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <SkeletonCard />
          ) : transactions.length > 0 ? (
            <TransactionTable transactions={transactions.slice(0, 5)} />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">No transactions yet.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/accounts')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center border-2 border-transparent hover:border-blue-500"
          >
            <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Accounts</h3>
            <p className="text-sm text-gray-600">Manage your accounts</p>
          </button>

          <button
            onClick={() => navigate('/transactions')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center border-2 border-transparent hover:border-green-500"
          >
            <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1 4.5 4.5 0 11-4.384 5.98z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-600">View all transactions</p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center border-2 border-transparent hover:border-purple-500"
          >
            <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Analytics</h3>
            <p className="text-sm text-gray-600">View insights</p>
          </button>

          <button
            onClick={fetchDashboardData}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center border-2 border-transparent hover:border-orange-500"
          >
            <svg className="w-8 h-8 text-orange-600 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 1111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 105.199 7.09V4a1 1 0 01-1-1H4zm7 4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
            <h3 className="font-semibold text-gray-900">Refresh</h3>
            <p className="text-sm text-gray-600">Update data</p>
          </button>
        </div>

        {/* Add Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingGoalId ? 'Edit Savings Goal' : 'Add Savings Goal'}</h2>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
                  <input
                    type="text"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    required
                    placeholder="e.g., Vacation Fund"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.targetAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, targetAmount: e.target.value })}
                    required
                    placeholder="5000.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={goalForm.currentAmount}
                    onChange={(e) => setGoalForm({ ...goalForm, currentAmount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoalModal(false);
                      setEditingGoalId(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingGoalId ? 'Update Goal' : 'Add Goal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
