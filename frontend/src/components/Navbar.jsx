import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { DarkModeContext } from "../context/DarkModeContext";
import MoonIcon from "../assets/imageofmoon.png";
import SunIcon from "../assets/imageofsun.png";
import AIChat from "../pages/AIChat";
import socket from "../socket";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const token = localStorage.getItem("token");

  /* ------------------------------
     LOAD NOTIFICATIONS + SOCKET
  ------------------------------ */
  useEffect(() => {

    if (!user) return;

    socket.emit("join", user._id);

    const fetchNotifications = async () => {
      try {

        const res = await fetch("/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }

      } catch (err) {
        console.error("Failed to load notifications");
      }
    };

    fetchNotifications();

    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.off("notification");

  }, [user]);

  /* -------- MARK AS READ -------- */
  const markAsRead = async (id) => {

    try {

      await fetch(`/api/notifications/${id}/read`, {
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
  const deleteNotification = async (id, e) => {

    e.stopPropagation();

    try {

      await fetch(`/api/notifications/${id}`, {
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <nav
        className={`w-full px-10 py-4 flex items-center justify-between shadow-md transition-colors ${
          darkMode ? "bg-slate-900 text-white" : "bg-white text-gray-800"
        }`}
      >

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-teal-500">S</span>
          <span className="text-2xl font-extrabold tracking-wide">SkillSwap</span>
        </Link>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 text-sm font-semibold relative">

          {/* DARK MODE */}
          <button onClick={toggleDarkMode} className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src={darkMode ? SunIcon : MoonIcon}
              alt="Toggle Dark Mode"
              className="w-full h-full object-contain"
            />
          </button>

          <Link to={user ? "/search" : "/login"} className="hover:text-teal-600">
            Browse Skills
          </Link>

          {user && (
            <Link to="/matches" className="hover:text-teal-600">
              Skill Matches
            </Link>
          )}

          {user ? (
            <>

              <Link to="/profile" className="hover:text-teal-600">
                Profile
              </Link>

              <Link to="/settings" className="hover:text-teal-600">
                Settings
              </Link>

              {/* 🔔 BELL */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-lg"
              >
                🔔

                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* DROPDOWN */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-72 bg-white shadow-xl rounded-xl border p-3 z-50 text-gray-800">

                  <p className="font-semibold mb-2">Notifications</p>

                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications</p>
                  ) : (

                    notifications.slice(0,5).map((n) => (

                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className="p-3 border-b hover:bg-gray-100 cursor-pointer rounded flex justify-between items-center"
                      >

                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{n.message}</p>

                          {!n.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>

                        <button
                          onClick={(e) => deleteNotification(n._id, e)}
                          className="text-red-500 text-xs hover:text-red-700"
                        >
                          ✕
                        </button>

                      </div>

                    ))

                  )}

                  <Link
                    to="/notifications"
                    className="block text-center text-teal-600 text-sm mt-2"
                  >
                    View All
                  </Link>

                </div>
              )}

              {/* AI BUTTON */}
              <button
                onClick={() => setShowChat(!showChat)}
                className="bg-teal-500 text-white px-3 py-2 rounded-full hover:bg-teal-600"
              >
                Skill Buddy
              </button>

              {/* LOGOUT */}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className={`px-5 py-2 rounded-xl border font-bold ${
                  darkMode
                    ? "border-orange-400 text-orange-300 hover:bg-orange-500/20"
                    : "border-orange-400 text-orange-500 hover:bg-orange-50"
                }`}
              >
                Logout
              </button>

            </>
          ) : (
            <Link to="/login" className="px-4 py-2 border rounded-lg">
              Login
            </Link>
          )}

        </div>
      </nav>

      {/* AI CHAT */}
      {showChat && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] rounded-2xl shadow-2xl overflow-hidden">
          <AIChat />
        </div>
      )}
    </>
  );
};

export default Navbar;

