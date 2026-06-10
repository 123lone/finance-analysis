import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

function SpendingPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-panel p-6 h-80 flex flex-col items-center justify-center">
        <div className="text-gray-400 mb-2 text-4xl">📊</div>
        <p className="text-gray-500 font-medium">No data available for Spending</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Premium vibrant gradient colors
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="glass-panel p-8 hover-lift flex flex-col h-[400px]">
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-500 mb-2">Spending by Category</h3>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-between min-h-0">
        {/* Pie Chart SVG */}
        <div className="w-full md:w-1/2 h-full flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Amount']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(8px)',
                  fontWeight: '600',
                  color: '#1e293b'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text for total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
            <span className="text-lg font-extrabold text-gray-800">
              ${total >= 1000 ? (total/1000).toFixed(1) + 'k' : total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/2 space-y-3 mt-4 md:mt-0 overflow-y-auto max-h-full pr-2 custom-scrollbar">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 group">
              <div
                className="w-3 h-3 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-300"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{item.name}</p>
                <p className="text-xs font-medium text-gray-500">
                  ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-gray-400">({((item.value / total) * 100).toFixed(1)}%)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200/50">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-600">Total Spending</span>
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-600">
            ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SpendingPieChart;
