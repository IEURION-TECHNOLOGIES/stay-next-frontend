import React, { useEffect, useState } from 'react';

const Earnings = () => {
  const [loading, setLoading] = useState(true);
  const [earningsData, setEarningsData] = useState([]);

  useEffect(() => {
    // Simulate API delay
    setTimeout(() => {
      setEarningsData([
        { month: 'Jan', earnings: 400 },
        { month: 'Feb', earnings: 600 },
        { month: 'Mar', earnings: 500 },
        { month: 'Apr', earnings: 700 },
        { month: 'May', earnings: 850 },
        { month: 'Jun', earnings: 620 },
        { month: 'Jul', earnings: 900 },
        { month: 'Aug', earnings: 700 },
        { month: 'Sept', earnings: 850 },
        { month: 'Oct', earnings: 620 },
        { month: 'Nov', earnings: 900 },
        { month: 'Dec', earnings: 900 },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading earnings data...
      </div>
    );
  }

  const maxEarning = Math.max(...earningsData.map((e) => e.earnings));
  const totalEarnings = earningsData.reduce((sum, entry) => sum + entry.earnings, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Earnings Breakdown
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Total Earnings
        </h2>
        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
          ₦{totalEarnings.toLocaleString()}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Monthly Overview
        </h2>

        <div className="flex items-end gap-4 h-60 overflow-x-auto scrollbar-hide">
          {earningsData.map((data, idx) => {
            const height = (data.earnings / maxEarning) * 100;

            return (
              <div key={idx} className="flex flex-col items-center w-16 h-full">
                <div className="flex items-end h-full">
                  <div
                    className="w-8 rounded-t bg-green-500 transition-all duration-700 ease-out"
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className="text-xs mt-2 text-gray-700 dark:text-gray-300">{data.month}</span>
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  ₦{data.earnings}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Earnings;
