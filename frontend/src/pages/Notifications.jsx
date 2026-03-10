
import { useEffect, useState } from "react";

const Notifications = () => {

  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {

    const fetchNotifications = async () => {

      try {

        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const res = await fetch("http://localhost:5000/api/notifications", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        setNotifications(data);

      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }

    };

    fetchNotifications();

  }, []);

  /* -------- MARK AS READ -------- */
  const markAsRead = async (id) => {

    try {

      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );

    } catch (err) {
      console.error("Failed to mark notification as read");
    }

  };

  /* -------- DELETE -------- */
  const deleteNotification = async (id) => {

    try {

      await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNotifications(prev =>
        prev.filter(n => n._id !== id)
      );

    } catch (err) {
      console.error("Failed to delete notification");
    }

  };

  return (
    <div className="max-w-3xl mx-auto mt-10">

      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet</p>
      ) : (

        notifications.map((n) => (

          <div
            key={n._id}
            className="p-4 border mb-3 rounded-lg shadow-sm flex justify-between items-center"
          >

            {/* MESSAGE + READ */}
            <div
              onClick={() => markAsRead(n._id)}
              className="cursor-pointer flex items-center gap-2"
            >
              <p>{n.message}</p>

              {!n.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>

            {/* DELETE BUTTON */}
            <button
              onClick={() => deleteNotification(n._id)}
              className="text-red-500 hover:text-red-700 text-lg font-bold"
            >
              ✕
            </button>

          </div>

        ))

      )}

    </div>
  );
};

export default Notifications;
