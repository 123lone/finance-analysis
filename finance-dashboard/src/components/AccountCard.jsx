import React from 'react';

function AccountCard({ account, onClick }) {
  const { name, balance, type, lastTransaction } = account;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer border-l-4 border-blue-500"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{type}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
          {type}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-gray-600 text-sm mb-1">Balance</p>
        <p className="text-3xl font-bold text-gray-900">${balance.toFixed(2)}</p>
      </div>

      {lastTransaction && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">Last Transaction</p>
          <p className="text-sm text-gray-700">{lastTransaction}</p>
        </div>
      )}
    </div>
  );
}

export default AccountCard;
