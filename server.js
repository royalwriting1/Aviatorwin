const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (JSON parse)
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb+srv://Watchads_user:%40%23Royal5678@cluster0.vjuovwe.mongodb.net/watchads?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed: ", err);
  });

// Schema (Demo)
const userSchema = new mongoose.Schema({
  name: String,
  points: { type: Number, default: 0 }
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Watch & Earn App Backend Running...");
});

// Add User (demo)
app.post("/add-user", async (req, res) => {
  try {
    const { name } = req.body;
    const newUser = new User({ name });
    await newUser.save();
    res.json({ message: "User added successfully!", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
