import React, { useEffect, useState } from 'react';

const RecentApplications = () => {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setApplications([
        { id: 1, applicant: 'John Doe', property: '3 Bedroom Duplex', date: 'Jul 20', status: 'Pending' },
        { id: 2, applicant: 'Jane Smith', property: 'Luxury Apartment', date: 'Jul 18', status: 'Approved' },
        { id: 3, applicant: 'Uche Nwosu', property: 'Mini Flat in Ikeja', date: 'Jul 16', status: 'Rejected' },
        { id: 4, applicant: 'Amina Bello', property: 'Studio Apartment', date: 'Jul 15', status: 'Pending' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center text-lg">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 ">
        All Rental Applications
      </h1>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="py-3 px-4">Applicant</th>
              <th className="py-3 px-4">Property</th>
              <th className="py-3 px-4">Date Applied</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                <td className="py-3 px-4">{app.applicant}</td>
                <td className="py-3 px-4">{app.property}</td>
                <td className="py-3 px-4">{app.date}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      app.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
                        : app.status === "Approved"
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentApplications;
