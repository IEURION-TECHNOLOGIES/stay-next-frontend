import React, { useEffect, useState } from 'react';

const RecentProperties = () => {
  const [loading, setLoading] = useState(true);
  const [recentProperties, setRecentProperties] = useState([]);

  useEffect(() => {
    // Simulated API call
    setTimeout(() => {
      setRecentProperties([
        {
          id: 1,
          title: '3 Bedroom Duplex in Lekki',
          status: 'Active',
          image: 'https://via.placeholder.com/80',
        },
        {
          id: 2,
          title: 'Luxury Apartment at Ikoyi',
          status: 'Pending',
          image: 'https://via.placeholder.com/80',
        },
        {
          id: 3,
          title: 'Mini Flat in Ikeja',
          status: 'Rented',
          image: 'https://via.placeholder.com/80',
        },
        {
          id: 4,
          title: '2 Bedroom in Yaba',
          status: 'Active',
          image: 'https://via.placeholder.com/80',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
          Loading recent properties...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Recent Properties
      </h1>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
        {recentProperties.map((prop) => (
          <div
            key={prop.id}
            className="flex items-center space-x-4 border border-gray-200 dark:border-gray-700 p-3 rounded bg-white dark:bg-gray-600 shadow-sm hover:shadow-md transition"
          >
            <img
              src={prop.image}
              alt={prop.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                {prop.title}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  prop.status === 'Active'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                    : prop.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {prop.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentProperties;
