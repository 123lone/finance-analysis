import React, { useState, useEffect } from 'react';
import axiosInstance, { endpoints } from '../api/axios';

function Accounts() {
  const [accounts, setAccounts] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Checking',
    bank: '',
    balance: '',
  });

  const fetchAccounts = async () => {
    try {
      const response = await axiosInstance.get(endpoints.accounts.list);
      const mapped = response.data.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        type: acc.accountType.replace('_', ' '),
        bank: 'N/A', // Backend does not support bank name
        balance: acc.currentBalance,
        lastUpdated: new Date(acc.createdAt).toISOString().split('T')[0],
        status: 'Active'
      }));
      setAccounts(mapped);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      let accType = formData.type.toUpperCase().replace(' ', '_');
      if (accType === 'INVESTMENT') accType = 'INVESTMENT'; // Ensure match with Enum AccountType
      
      const payload = {
        accountName: formData.name,
        accountType: accType,
        currentBalance: parseFloat(formData.balance)
      };
      
      await axiosInstance.post(endpoints.accounts.create, payload);
      
      setFormData({ name: '', type: 'Checking', bank: '', balance: '' });
      setShowAddModal(false);
      fetchAccounts();
    } catch (err) {
      console.error('Failed to create account:', err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Checking':
        return '💳';
      case 'Savings':
        return '🏦';
      case 'Credit Card':
        return '💰';
      default:
        return '📊';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Checking':
        return 'bg-blue-100 text-blue-800';
      case 'Savings':
        return 'bg-green-100 text-green-800';
      case 'Credit Card':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts</h1>
            <p className="text-gray-600 mt-2">Manage all your financial accounts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            + Add Account
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Accounts</p>
            <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Assets</p>
            <p className="text-3xl font-bold text-green-600">
              ${accounts.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 text-sm mb-2">Total Liabilities</p>
            <p className="text-3xl font-bold text-red-600">
              ${Math.abs(accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + a.balance, 0)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Account Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bank</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Balance</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Updated</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getTypeIcon(account.type)}</span>
                        <span className="text-sm font-medium text-gray-900">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.bank}</td>
                    <td className={`px-6 py-4 text-sm font-semibold text-right ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${account.balance.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.lastUpdated}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {account.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Account</h2>

              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., My Checking Account"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>Checking</option>
                    <option>Savings</option>
                    <option>Credit Card</option>
                    <option>Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    placeholder="e.g., Bank of America"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input
                    type="number"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Add Account
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

export default Accounts;
