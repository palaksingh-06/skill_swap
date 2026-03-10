const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  googleId: String,

  skillsTeach: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  skillsLearn: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],

  otp: String,
  otpExpiry: Date,

  // 🔹 PUBLIC PROFILE FIELDS (ADD THESE)
  tagline: {
    type: String,
    maxLength: 100,
    default: "",
  },
  username: {
  type: String,
  unique: true,
},

skillLevel: {
  type: String,
  enum: ["Beginner", "Intermediate", "Advanced"],
},

yearsOfExperience: {
  type: Number,
},

linkedin: String,
portfolio: String,
education: String,

skillsOffered: [String],
skillTags: [String],

tagline: String,
bio: String,
demoVideo: String,

  // Settings
  gender:    { type: String, default: "" },
  location:  { type: String, default: "" },
  birthday:  { type: String, default: "" },
  work:      { type: String, default: "" },
  education: { type: String, default: "" },
  username:  { type: String, default: "" },
  language:  { type: String, default: "English" },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);