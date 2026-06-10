import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { endpoints } from '../api/axios';

function Settings() {
  const { user, updateUser, logout } = useAuth();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    newPassword: '',
  });
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);
  const [profileError, setProfileError] = useState(null);
  
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const res = await axiosInstance.put(endpoints.users.update, profileForm);
      updateUser({ name: res.data.name }); // Only update name locally
      setProfileMessage('Profile updated successfully!');
      setProfileForm({ ...profileForm, newPassword: '' }); // Clear password field
    } catch (err) {
      console.error(err);
      setProfileError('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(endpoints.users.delete);
      logout(); // Instantly log them out if successful
    } catch (err) {
      console.error(err);
      setProfileError('Failed to delete account. Please try again.');
      setDeleteLoading(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500">Settings</h1>
            <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
          </div>
        </div>

        {/* Profile Update Section */}
        <div className="glass-panel p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Profile Information</h2>
          
          {profileMessage && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <p className="text-sm text-green-700">{profileMessage}</p>
            </div>
          )}
          {profileError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{profileError}</p>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Optional)</label>
              <input
                type="password"
                name="newPassword"
                value={profileForm.newPassword}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Leave blank to keep current password"
                minLength="6"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={profileLoading}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50 flex items-center"
              >
                {profileLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white border border-red-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="bg-red-50 border-b border-red-100 px-6 py-4">
            <h2 className="text-lg font-bold text-red-800">Danger Zone</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. All of your accounts, transactions, and savings goals will be permanently deleted. Please be certain.
            </p>
            
            {!showConfirmDelete ? (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Delete Account
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 animate-fade-in">
                <p className="text-red-800 font-medium mb-3">Are you absolutely sure you want to delete your account?</p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 disabled:opacity-50"
                  >
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    disabled={deleteLoading}
                    className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Settings;
