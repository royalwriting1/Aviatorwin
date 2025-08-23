const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.set("strictQuery", true);

mongoose.connect(
  "mongodb+srv://Watchads_user:%40%23Royal5678@cluster0.vjuovwe.mongodb.net/watchads?retryWrites=true&w=majority&appName=Cluster0",
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.error("❌ MongoDB Connection Failed: ", err));

// Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  points: { type: Number, default: 0 }
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.send("🚀 Watch & Earn App Backend Running...");
});

// Add User
app.post("/add-user", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

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

// DB Test Route
app.get("/checkdb", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ status: "DB Connected ✅", collections });
  } catch (err) {
    res.status(500).json({ status: "DB Error ❌", error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
