const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// CONNECT MONGODB
mongoose.connect("mongodb://127.0.0.1:27017/blooddonor")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// USER SCHEMA
const User = mongoose.model("User", {
    username: String,
    password: String
});

// DONOR SCHEMA
const Donor = mongoose.model("Donor", {
    name: String,
    phone: String,
    city: String,
    blood: String,
    gender: String
});

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.send("User already exists!");
        }

        // Save new user
        const newUser = new User({ username, password });
        await newUser.save();

        res.send("User Registered Successfully!");
    } catch (err) {
        res.send("Error registering user");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username, password });

        if (user) {
            res.send("Success");
        } else {
            res.send("Invalid Credentials");
        }
    } catch (err) {
        res.send("Error logging in");
    }
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});

app.post("/addDonor", async (req, res) => {
    try {
        const donor = new Donor(req.body);
        await donor.save();
        res.send("Donor Saved Successfully!");
    } catch (err) {
        res.send("Error saving donor");
    }
});

app.post("/getDonors", async (req, res) => {
    try {
        const { blood, city } = req.body;

        const donors = await Donor.find({
            blood: blood,
            city: { $regex: city, $options: "i" }
        });

        res.json(donors);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server error" });
    }
});

app.delete("/deleteDonor/:id", async (req, res) => {
    try {
        await Donor.findByIdAndDelete(req.params.id);
        res.send("Donor Deleted Successfully!");
    } catch (err) {
        res.send("Error deleting donor");
    }
});

app.patch("/updateDonor/:id", async (req, res) => {
    try {
        const updatedDonor = await Donor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },   // only update changed fields
            { new: true }         // return updated data
        );

        res.json(updatedDonor);
    } catch (err) {
        res.status(500).send("Error updating donor");
    }
});

