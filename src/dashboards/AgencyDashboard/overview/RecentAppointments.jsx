import React from 'react';

const appointments = [
  {
    id: 1,
    client: 'John Doe',
    date: 'August 5, 2025',
    time: '2:00 PM',
    status: 'Confirmed',
    location: 'Lekki Phase 1',
  },
  {
    id: 2,
    client: 'Sarah Johnson',
    date: 'August 7, 2025',
    time: '11:00 AM',
    status: 'Pending',
    location: 'Ikeja GRA',
  },
  {
    id: 3,
    client: 'Michael Smith',
    date: 'August 9, 2025',
    time: '4:30 PM',
    status: 'Cancelled',
    location: 'Ajah',
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Confirmed':
      return 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900';
    case 'Pending':
      return 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
    case 'Cancelled':
      return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900';
    default:
      return 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-800';
  }
};

const RecentAppointments = () => {
  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Appointments</h2>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Client</th>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Time</th>
              <th className="px-6 py-3 text-left font-semibold">Location</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {appointments.map((appt) => (
              <tr key={appt.id} className="text-gray-800 dark:text-gray-100">
                <td className="px-6 py-4">{appt.client}</td>
                <td className="px-6 py-4">{appt.date}</td>
                <td className="px-6 py-4">{appt.time}</td>
                <td className="px-6 py-4">{appt.location}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      appt.status
                    )}`}
                  >
                    {appt.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button className="text-blue-600 dark:text-blue-400 hover:underline">Reschedule</button>
                  <button className="text-red-600 dark:text-red-400 hover:underline">Cancel</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAppointments;
