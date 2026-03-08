// import { useContext } from "react";
// import { Link } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import axios from "axios";
// import { DarkModeContext } from "../context/DarkModeContext";
// import { motion } from "framer-motion";

// const Profile = () => {
//   const { user, setUser } = useContext(AuthContext);
//   const { darkMode } = useContext(DarkModeContext);

//   const handleImageUpload = async (file) => {
//     if (!file) return;

//     try {
//       const formData = new FormData();
//       formData.append("avatar", file);

//       const token = localStorage.getItem("token");

//       const res = await axios.post(
//         "http://localhost:5000/api/user/upload-avatar",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setUser({ ...user, avatar: res.data.avatar });
//     } catch (err) {
//       console.error("Avatar upload failed", err);
//     }
//   };

//   if (!user) {
//     return (
//       <p className={`p-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
//         Loading profile...
//       </p>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className={`min-h-screen ${
//         darkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
//       }`}
//     >
//       <main className="max-w-6xl mx-auto px-6 py-16">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.97 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.4 }}
//           className={`rounded-3xl shadow-lg grid md:grid-cols-3 overflow-hidden ${
//             darkMode ? "bg-slate-800" : "bg-white"
//           }`}
//         >
//           {/* LEFT PANEL */}
//           <motion.div
//             initial={{ x: -40, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.4 }}
//             className="bg-gradient-to-br from-teal-400 to-cyan-500 p-10 text-white flex flex-col items-center text-center"
//           >
//             <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden mb-4">
//               <img
//                 src={
//                   user.avatar
//                     ? user.avatar
//                     : `https://ui-avatars.com/api/?name=${user.name}`
//                 }
//                 alt="profile"
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             <h2 className="text-xl font-semibold uppercase">{user.name}</h2>
//             <p className="text-sm opacity-90">{user.email}</p>

//             <div className="mt-6 flex flex-col gap-3 w-full items-center">
//               <Link
//                 to="/edit-profile"
//                 className="px-6 py-2 w-48 rounded-full border border-white hover:bg-white hover:text-teal-600 transition text-sm"
//               >
//                 Edit Profile
//               </Link>

//               <Link
//                 to="/edit-public-profile"
//                 className="px-6 py-2 w-48 rounded-full bg-white text-teal-600 hover:bg-teal-50 transition text-sm font-medium"
//               >
//                 Edit Public Profile
//               </Link>
//             </div>

//             <p className="text-sm opacity-90 mt-12">
//               Welcome to SkillSwap!
//               <br />
//               Complete your profile to start swapping skills.
//             </p>
//           </motion.div>

//           {/* RIGHT PANEL */}
//           <motion.div
//             initial={{ x: 40, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.4 }}
//             className="md:col-span-2 p-12"
//           >
//             <h1 className="text-3xl font-bold mb-2">My Profile</h1>
//             <div className="w-12 h-1 bg-teal-500 rounded-full mb-8"></div>

//             <div className="space-y-6">
//               <ProfileItem title="Dashboard" icon="📊" link="/dashboard" darkMode={darkMode} />
//               <ProfileItem title="Skills" icon="✨" link="/skills" darkMode={darkMode} />
//               <ProfileItem title="Messages" icon="💬" link="/messages" darkMode={darkMode} />
//             </div>
//           </motion.div>
//         </motion.div>
//       </main>
//     </motion.div>
//   );
// };

// const ProfileItem = ({ title, icon, link, darkMode }) => (
//   <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
//     <Link
//       to={link}
//       className={`flex items-center justify-between rounded-2xl px-6 py-5 transition hover:shadow ${
//         darkMode ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-800"
//       }`}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className={`w-10 h-10 rounded-xl flex items-center justify-center shadow ${
//             darkMode ? "bg-slate-600" : "bg-white"
//           }`}
//         >
//           {icon}
//         </div>
//         <span className="font-medium">{title}</span>
//       </div>
//       <span className="text-slate-400 text-xl">›</span>
//     </Link>
//   </motion.div>
// );

// export default Profile;



import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { DarkModeContext } from "../context/DarkModeContext";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be smaller than 5MB.");
      return;
    }

    setUploadError(null);
    setUploading(true);

    // Show instant local preview
    const previewUrl = URL.createObjectURL(file);
    setUser((prev) => ({ ...prev, avatar: previewUrl }));

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/user/upload-avatar",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Replace preview with real Cloudinary URL
      setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
    } catch (err) {
      console.error("Avatar upload failed", err);
      setUploadError("Upload failed. Please try again.");
      // Revert preview on failure
      setUser((prev) => ({ ...prev, avatar: user?.avatar || null }));
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <p className={`p-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
        Loading profile...
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${
        darkMode ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <main className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={`rounded-3xl shadow-lg grid md:grid-cols-3 overflow-hidden ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          {/* LEFT PANEL */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-teal-400 to-cyan-500 p-10 text-white flex flex-col items-center text-center"
          >

            {/* ── Avatar with upload overlay ── */}
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-lg">
                <img
                  src={
                    user.avatar
                      ? user.avatar
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0d9488&color=fff&size=128`
                  }
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hover overlay */}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 rounded-full bg-black/50 flex flex-col
                  items-center justify-center opacity-0 group-hover:opacity-100
                  transition-opacity cursor-pointer"
              >
                {uploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />
                ) : (
                  <>
                    {/* Camera icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white mb-1"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0
                        0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07
                        7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white text-xs font-medium">Change</span>
                  </>
                )}
              </label>

              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>

            {/* Upload button below avatar */}
            <label
              htmlFor="avatar-upload"
              className={`flex items-center gap-1.5 text-xs font-medium cursor-pointer
                px-4 py-1.5 rounded-full border border-white/70 hover:bg-white/20
                transition mb-4 ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0
                  0L8 8m4-4v12" />
              </svg>
              {uploading ? "Uploading..." : "Upload Photo"}
            </label>

            {/* Error message */}
            {uploadError && (
              <p className="text-xs text-red-200 bg-red-500/30 px-3 py-1
                rounded-full mb-3">
                {uploadError}
              </p>
            )}

            {/* Uploading indicator */}
            {uploading && (
              <p className="text-xs text-white/80 mb-3 animate-pulse">
                Saving to cloud...
              </p>
            )}

            <h2 className="text-xl font-semibold uppercase">{user.name}</h2>
            <p className="text-sm opacity-90">{user.email}</p>

            <div className="mt-6 flex flex-col gap-3 w-full items-center">
              <Link
                to="/edit-profile"
                className="px-6 py-2 w-48 rounded-full border border-white
                  hover:bg-white hover:text-teal-600 transition text-sm"
              >
                Edit Profile
              </Link>

              <Link
                to="/edit-public-profile"
                className="px-6 py-2 w-48 rounded-full bg-white text-teal-600
                  hover:bg-teal-50 transition text-sm font-medium"
              >
                Edit Public Profile
              </Link>
            </div>

            <p className="text-sm opacity-90 mt-12">
              Welcome to SkillSwap!
              <br />
              Complete your profile to start swapping skills.
            </p>
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="md:col-span-2 p-12"
          >
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <div className="w-12 h-1 bg-teal-500 rounded-full mb-8"></div>

            <div className="space-y-6">
              <ProfileItem title="Dashboard" icon="📊" link="/dashboard" darkMode={darkMode} />
              <ProfileItem title="Skills"    icon="✨" link="/skills"    darkMode={darkMode} />
              <ProfileItem title="Messages"  icon="💬" link="/messages"  darkMode={darkMode} />
            </div>
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
};

const ProfileItem = ({ title, icon, link, darkMode }) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
    <Link
      to={link}
      className={`flex items-center justify-between rounded-2xl px-6 py-5
        transition hover:shadow ${
          darkMode ? "bg-slate-700 text-white" : "bg-slate-50 text-slate-800"
        }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow ${
          darkMode ? "bg-slate-600" : "bg-white"
        }`}>
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-slate-400 text-xl">›</span>
    </Link>
  </motion.div>
);

export default Profile;