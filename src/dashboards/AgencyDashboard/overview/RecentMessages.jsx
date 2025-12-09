import React from 'react';

const messages = [
  {
    id: 1,
    from: 'Jane Smith',
    message: 'Hi, is the 3-bedroom apartment in Lekki still available?',
    date: 'July 25, 2025',
    time: '10:24 AM',
    unread: true,
  },
  {
    id: 2,
    from: 'Daniel Johnson',
    message: 'I’m interested in scheduling a viewing.',
    date: 'July 25, 2025',
    time: '2:14 PM',
    unread: false,
  },
  {
    id: 3,
    from: 'Grace Lee',
    message: 'Can I pay in installments?',
    date: 'July 26, 2025',
    time: '9:01 AM',
    unread: true,
  },
];

const ClientMessages = () => {
  return (
    <div className="p-6 md:p-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Messages</h2>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg divide-y divide-gray-100 dark:divide-gray-700">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 flex justify-between items-start transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
              msg.unread
                ? 'bg-gray-100 dark:bg-gray-700 font-medium'
                : 'bg-white dark:bg-gray-800'
            }`}
          >
            <div>
              <p className="text-gray-800 dark:text-gray-100">
                <strong>{msg.from}</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{msg.message}</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                {msg.date} • {msg.time}
              </p>
            </div>
            <div>
              <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Open</button>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="p-6 text-gray-500 dark:text-gray-400 text-center">No messages found.</div>
        )}
      </div>
    </div>
  );
};

export default ClientMessages;
