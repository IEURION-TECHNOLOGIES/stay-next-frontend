import React, { useEffect, useState } from "react";
import AGENTAPI from "../../utils/agentaxios";

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  const stored = JSON.parse(localStorage.getItem("user"));
  console.log("Stored user:", stored);
  const userId = stored?._id;
  console.log("User ID:", userId);

  useEffect(() => {
  const fetchOverview = async () => {
    try {
      const res = await AGENTAPI.get("/agents/profile/overview", {
       headers: { "x-user-id": userId },
      });

      console.log(res.data);
      setOverview(res.data);
    } catch (err) {
      setError("Failed to load dashboard overview");
    } finally {
      setLoading(false);
    }
  };

  fetchOverview();
}, []);

  if (loading)
    return (
      <div className="w-full py-10 text-center text-gray-500 dark:text-gray-100">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="w-full py-10 text-center text-red-500">{error}</div>
    );

  const { agent, stats } = overview;

  return (
    <div className="p-5 md:p-10 space-y-8">
      {/* ========== STATS GRID ========== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        <div className="bg-white p-5 rounded-xl shadow flex flex-col items-center dark:bg-gray-800">
          <i className="fa fa-home text-2xl text-green-600 dark:text-green-100"></i>
          <h3 className="text-xl font-bold">{stats.totalProperties}</h3>
          <p className="text-gray-500 text-sm dark:text-gray-100">Total Properties</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow flex flex-col items-center">
          <i className="fa fa-check-circle text-2xl text-blue-600 dark:text-blue-100"></i>
          <h3 className="text-xl font-bold">{stats.soldProperties}</h3>
          <p className="text-gray-500 text-sm dark:text-gray-100">Sold</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow flex flex-col items-center">
          <i className="fa fa-door-closed text-2xl text-yellow-600 dark:text-yellow-100"></i>
          <h3 className="text-xl font-bold">{stats.rentedProperties}</h3>
          <p className="text-gray-500 text-sm dark:text-gray-100">Rented</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow flex flex-col items-center">
          <i className="fa fa-bell text-2xl text-red-600 dark:text-red-100"></i>
          <h3 className="text-xl font-bold">
            {agent?.profile?.notifications?.unreadCount || 0}
          </h3>
          <p className="text-gray-500 text-sm dark:text-gray-100">Notifications</p>
        </div>

      </div>

      {/* ========== RECENT ACTIVITIES ========== */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Recent Sales */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">Recent Sales</h3>

          {stats.recentSales.length === 0 ? (
            <p className="text-gray-400 text-sm dark:text-gray-100">No recent sales...</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentSales.map((sale, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-100">
                  Property ID: {sale.propertyId}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Rentals */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Recent Rentals</h3>

          {stats.recentRented.length === 0 ? (
            <p className="text-gray-400 text-sm dark:text-gray-100">No recent rentals...</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentRented.map((rent, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-100">
                  Property ID: {rent.propertyId}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>

          {stats.recentBooked.length === 0 ? (
            <p className="text-gray-400 text-sm dark:text-gray-100">No recent bookings...</p>
          ) : (
            <ul className="space-y-3">
              {stats.recentBooked.map((book, i) => (
                <li key={i} className="text-sm text-gray-700 dark:text-gray-100">
                  <p>Property ID: {book.propertyId}</p>
                  <p>Client: {book.clientId}</p>
                  <p className="text-gray-500 text-xs dark:text-gray-100">
                    {new Date(book.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
};

export default Overview;
