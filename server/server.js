const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "alumni_network";
const collectionName = "student";

let collection;

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db(dbName);
    collection = db.collection(collectionName);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
connectDB();

// ---------------- ROUTES ---------------- //

// Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await collection.find({}).toArray();
    res.json(students);
  } catch (err) {
    res.status(500).send("Error fetching students: " + err.message);
  }
});

// Add a student
app.post("/student", async (req, res) => {
  try {
    const result = await collection.insertOne(req.body);
    res.json({ message: "Inserted successfully", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a student by ID
app.delete("/student/:id", async (req, res) => {
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- SERVER ---------------- //
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
