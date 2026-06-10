import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import SpendingPieChart from '../components/SpendingPieChart';
import TrendChart from '../components/TrendChart';
import SavingsCard from '../components/SavingsCard';
import AnomalyTable from '../components/AnomalyTable';

function Analytics() {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [spendingData, setSpendingData] = useState([]);
  const [spendingTrendData, setSpendingTrendData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const currentYear = new Date().getFullYear();
        
        const [spendingRes, trendsRes] = await Promise.all([
          axiosInstance.get('/analytics/spending-by-category', { params: { range: timeRange } }).catch(() => ({ data: [] })),
          axiosInstance.get('/analytics/monthly-trend', { params: { year: currentYear } }).catch(() => ({ data: [] }))
        ]);

        // Attempt to fetch anomalies, fallback to empty if it fails
        let anomaliesData = [];
        try {
          const anomaliesRes = await axiosInstance.get('/analytics/anomalies');
          anomaliesData = anomaliesRes.data || [];
        } catch (err) {
          anomaliesData = [];
        }

        // Removed dashboard fallback mock

        // Map CategorySpendingResponse to Pie Chart format { name, value }
        const mappedSpending = (spendingRes.data || []).map(item => ({
          name: item.category ? item.category.replace('_', ' ') : 'Unknown',
          value: item.totalAmount || 0
        }));

        // Map MonthlyTrendResponse to Line Chart format { label, value }
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mappedTrends = (trendsRes.data || []).map(item => ({
          label: item.month ? monthNames[item.month - 1] : 'Unknown',
          value: item.totalExpense || 0
        }));

        setSpendingData(mappedSpending);
        setSpendingTrendData(mappedTrends);
        setAnomalies(anomaliesData);
      } catch (err) {
        console.error('Error fetching analytics data', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading Analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-panel p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500">Analytics</h1>
            <p className="text-gray-500 mt-1 font-medium">Detailed insights into your financial data</p>
          </div>
          <div className="flex space-x-2 bg-white/50 backdrop-blur-md rounded-xl p-1 shadow-inner border border-white/60">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-brand-500 to-blue-500 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-transparent text-gray-600 hover:bg-white/60'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Pie Chart */}
          <SpendingPieChart data={spendingData} />

          {/* Monthly Spending Trend */}
          <TrendChart data={spendingTrendData} title="Spending Trend" />
        </div>

        {/* Anomaly Detection Table */}
        <div className="mb-8">
          <AnomalyTable anomalies={anomalies} />
        </div>

      </div>
    </div>
  );
}

// Fallback Mock Data in case backend endpoints are not fully implemented yet

function getMockDashboardData() {
  return {
    monthlyIncome: 0,
    monthlySavings: 0,
    savingsTarget: 0,
    netWorth: 0
  };
}

function getMockSpendingData() {
  return [];
}

function getMockTrendData() {
  return [];
}

function getMockAnomalies() {
  return [];
}

export default Analytics;
