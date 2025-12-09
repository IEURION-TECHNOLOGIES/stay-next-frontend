import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OverviewHome = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    earningsData: [],
    recentProperties: [],
    messages: [],
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        earningsData: [
          { month: 'Jan', earnings: 400 },
          { month: 'Feb', earnings: 600 },
          { month: 'Mar', earnings: 500 },
          { month: 'Apr', earnings: 700 },
        ],
        recentProperties: [
          { id: 1, title: '3 Bedroom Duplex in Lekki', status: 'Active', image: 'https://via.placeholder.com/80' },
          { id: 2, title: 'Luxury Apartment at Ikoyi', status: 'Pending', image: 'https://via.placeholder.com/80' },
          { id: 3, title: 'Mini Flat in Ikeja', status: 'Rented', image: 'https://via.placeholder.com/80' },
        ],
        clientMessages: [
          { id: 1, sender: 'Chidera', subject: 'Inquiry on Apartment', preview: 'Hi, I’m interested...', unread: true },
          { id: 2, sender: 'Tolu', subject: 'Viewing Request', preview: 'Can we book...', unread: false },
        ],
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500 text-center text-lg">Loading dashboard...</p>
      </div>
    );
  }

  const {
    earningsData,
    recentProperties,
    clientMessages,
  } = dashboardData;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold -mt-6 mb-4 text-gray-800 dark:text-gray-100">
        Dashboard Overview
      </h1>
      {/* Earnings Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Monthly Earnings (₦303,644)</h2>
          <button
            onClick={() => navigate("/agent-dashboard/overview/earnings")}
            className="text-sm text-green-600 dark:text-green-300 hover:underline"
          >
            View All
          </button>
        </div>
        <div className="flex items-end gap-4 h-40">
          {earningsData.map((data, idx) => (
            <div key={idx} className="flex flex-col items-center w-16">
              <div
                className="w-6 rounded bg-green-500"
                style={{ height: `${data.earnings / 10}px` }}
              ></div>
              <span className="text-sm mt-1">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Properties */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Properties</h2>
          <button
            onClick={() => navigate("/agent-dashboard/overview/properties")}
            className="text-sm text-green-600 dark:text-green-300 hover:underline"
          >
            View All
          </button>
        </div>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          {recentProperties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center space-x-4 border dark:border-gray-500 p-2 rounded bg-white dark:bg-gray-600"
            >
              <img
                src={prop.image}
                alt={prop.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-sm">{prop.title}</h3>
                <span className="text-xs text-gray-600 dark:text-gray-200">
                  {prop.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <button
            onClick={() => navigate("/agent-dashboard/overview/applications")}
            className="text-sm text-green-600 dark:text-green-300 hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4">Applicant</th>
                <th className="py-2 px-4">Property</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => (
                <tr key={app.id} className="border-b">
                  <td className="py-2 px-4">{app.applicant}</td>
                  <td className="py-2 px-4">{app.property}</td>
                  <td className="py-2 px-4">{app.date}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
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
      </div> */}

      {/* Appointments
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
          <button
            onClick={() => navigate("/agent-dashboard/overview/appointments")}
            className="text-sm text-green-600 dark:text-green-300 hover:underline"
          >
            View All
          </button>
        </div>
        <ul className="space-y-3">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="flex justify-between items-center bg-gray-100 dark:bg-gray-600 rounded p-3"
            >
              <div>
                <p className="font-semibold">{appt.client}</p>
                <p className="text-sm text-gray-600 dark:text-gray-200">
                  {appt.property} — {appt.time}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-300">
                  {appt.location}
                </p>
              </div>
              <i className="fas fa-calendar-alt text-green-500 text-xl"></i>
            </li>
          ))}
        </ul>
      </div> */}

      {/* Messages */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Latest Messages</h2>
          <button
            onClick={() => navigate("/agent-dashboard/overview/messages")}
            className="text-sm text-green-500 dark:text-green-300 hover:underline"
          >
            View All
          </button>
        </div>
        <ul className="space-y-3">
          {clientMessages.map((msg) => (
            <li
              key={msg.id}
              className={`flex justify-between items-start p-3 rounded border transition ${
                msg.unread ? "bg-blue-100 dark:bg-blue-200 border-blue-400 dark:border-green-700" : "bg-gray-100 dark:bg-gray-500"
              }`}
            >
              <div>
                <p className="font-semibold dark:text-gray-900">{msg.sender}</p>
                <p className="text-sm text-gray-700 dark:text-gray-800">{msg.subject}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{msg.preview}</p>
              </div>
              <i
                className={`fas ${
                  msg.unread ? "fa-envelope" : "fa-envelope-open"
                } text-lg text-gray-600 `}
              ></i>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OverviewHome;
