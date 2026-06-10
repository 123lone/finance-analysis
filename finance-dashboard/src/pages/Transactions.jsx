import React, { useState, useEffect } from 'react';
import TransactionTable from '../components/TransactionTable';
import axiosInstance, { endpoints } from '../api/axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all',
  });

  const [form, setForm] = useState({
    accountId: '',
    amount: '',
    merchant: '',
    description: '',
    type: 'EXPENSE',
    category: 'OTHER',
    transactionDate: new Date().toISOString().slice(0, 16)
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
    transactionDate: new Date().toISOString().slice(0, 16)
  });

  const categories = ['All', 'FOOD', 'RENT', 'SALARY', 'SHOPPING', 'TRAVEL', 'HEALTH', 'ENTERTAINMENT', 'UTILITIES', 'OTHER'];
  const formCategories = categories.filter(c => c !== 'All');

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axiosInstance.get(endpoints.transactions.list);
      let rawTransactions = res.data.data || res.data || [];
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
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await axiosInstance.get(endpoints.transactions.export, {
        responseType: 'blob', // Important for downloading files
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export transactions', err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get(endpoints.accounts.list);
      const rawAccounts = res.data.data || res.data || [];
      setAccounts(Array.isArray(rawAccounts) ? rawAccounts : []);
      if (rawAccounts.length > 0) {
        setForm(prev => ({ ...prev, accountId: rawAccounts[0].id }));
        if (rawAccounts.length > 1) {
          setTransferForm(prev => ({ 
            ...prev, 
            fromAccountId: rawAccounts[0].id,
            toAccountId: rawAccounts[1].id
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch accounts', err);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        accountId: parseInt(form.accountId),
      };
      await axiosInstance.post(endpoints.transactions.create, payload);
      setShowModal(false);
      setForm({
        accountId: accounts.length > 0 ? accounts[0].id : '',
        amount: '',
        merchant: '',
        description: '',
        type: 'EXPENSE',
        category: 'OTHER',
        transactionDate: new Date().toISOString().slice(0, 16)
      });
      fetchTransactions();
    } catch (err) {
      console.error('Failed to create transaction', err);
    }
  };

  const handleTransferFunds = async (e) => {
    e.preventDefault();
    if (transferForm.fromAccountId === transferForm.toAccountId) {
      alert("Source and destination accounts must be different.");
      return;
    }
    try {
      const payload = {
        ...transferForm,
        amount: parseFloat(transferForm.amount),
        fromAccountId: parseInt(transferForm.fromAccountId),
        toAccountId: parseInt(transferForm.toAccountId),
      };
      await axiosInstance.post(endpoints.transactions.transfer, payload);
      setShowTransferModal(false);
      setTransferForm({
        fromAccountId: accounts.length > 0 ? accounts[0].id : '',
        toAccountId: accounts.length > 1 ? accounts[1].id : '',
        amount: '',
        description: '',
        transactionDate: new Date().toISOString().slice(0, 16)
      });
      fetchTransactions();
    } catch (err) {
      console.error('Failed to transfer funds', err);
      alert(err.response?.data?.message || 'Failed to transfer funds');
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      await axiosInstance.delete(endpoints.transactions.delete(id));
      fetchTransactions();
    } catch (err) {
      console.error('Failed to delete transaction', err);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.status !== 'all' && t.status !== filters.status) return false;
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalExpenses = Math.abs(
    filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">View and manage your financial transactions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportCsv}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Transfer
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{filteredTransactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Income</p>
            <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? 'all' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setFilters({ type: 'all', category: 'all', status: 'all' })}
            className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        </div>

        {/* Transactions Table */}
        <TransactionTable transactions={filteredTransactions} onDelete={handleDeleteTransaction} />

        {/* Add Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Transaction</h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="" disabled>Select Account</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.accountName} (${a.currentBalance})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      {formCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                    <input
                      type="text"
                      value={form.merchant}
                      onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="datetime-local"
                      value={form.transactionDate}
                      onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Transfer Funds</h2>
              <form onSubmit={handleTransferFunds} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                    <select
                      value={transferForm.fromAccountId}
                      onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="" disabled>Select Source Account</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.accountName} (${a.currentBalance})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                    <select
                      value={transferForm.toAccountId}
                      onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    >
                      <option value="" disabled>Select Destination Account</option>
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>{a.accountName} (${a.currentBalance})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="datetime-local"
                      value={transferForm.transactionDate}
                      onChange={(e) => setTransferForm({ ...transferForm, transactionDate: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                    placeholder="e.g. Monthly Savings Transfer"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Confirm Transfer
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

export default Transactions;
