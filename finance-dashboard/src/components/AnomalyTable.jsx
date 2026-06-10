import React from 'react';

function AnomalyTable({ anomalies }) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="glass-panel p-8 text-center hover-lift">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 mb-4">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">All Clear!</h3>
        <p className="text-gray-500 font-medium">No unusual spending patterns detected in this period.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden hover-lift transition-all duration-300">
      <div className="px-8 py-6 border-b border-white/40 bg-white/30 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🚨</span>
          <div>
            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Anomaly Detection</h3>
            <p className="text-sm font-medium text-gray-500 mt-1">Unusual spending patterns and potential duplicate charges</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50">
          <thead className="bg-gray-50/50 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expected</th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50 bg-white/20">
            {anomalies.map((anomaly, index) => (
              <tr key={index} className="hover:bg-white/60 transition-colors duration-200 group">
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-700 group-hover:text-brand-600 transition-colors">
                  {new Date(anomaly.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-semibold text-gray-800">
                  <span className="px-3 py-1 bg-white/60 rounded-lg shadow-sm border border-gray-100">{anomaly.category}</span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-rose-500">
                  ${parseFloat(anomaly.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-gray-500">
                  ${parseFloat(anomaly.expectedAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                  {anomaly.reason}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl shadow-sm ${
                    anomaly.severity === 'HIGH' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                    anomaly.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-sky-100 text-sky-700 border border-sky-200'
                  }`}>
                    {anomaly.severity || 'LOW'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnomalyTable;
