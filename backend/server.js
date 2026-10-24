
const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend files from the public folder
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        message: "TechSpire API is running"
    });
});

// Allowed registration values
const departments = [
    "Computer Science",
    "Information Technology",
    "Commerce",
    "Mathematics",
    "Other"
];

const years = ["1st Year", "2nd Year", "3rd Year"];

const events = [
    "Web Development",
    "Coding Competition",
    "Paper Presentation",
    "Quiz"
];

// Register participant
app.post("/api/register", (req, res) => {
    const {
        name,
        email,
        phone,
        college,
        department,
        year,
        event,
        comments = ""
    } = req.body || {};

    // Validate field types
    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof phone !== "string" ||
        typeof college !== "string" ||
        typeof department !== "string" ||
        typeof year !== "string" ||
        typeof event !== "string" ||
        typeof comments !== "string"
    ) {
        return res.status(400).json({
            message: "Please provide valid registration details."
        });
    }

    const participant = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        college: college.trim(),
        department,
        year,
        event,
        comments: comments.trim()
    };

    // Check required fields
    if (
        !participant.name ||
        participant.name.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email) ||
        participant.email.length > 254 ||
        !/^[0-9]{10}$/.test(participant.phone) ||
        !participant.college ||
        participant.college.length > 150 ||
        !departments.includes(participant.department) ||
        !years.includes(participant.year) ||
        !events.includes(participant.event) ||
        participant.comments.length > 1000
    ) {
        return res.status(400).json({
            message: "Please check your form details and try again."
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO registrations
            (name, email, phone, college, department, year, event, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            participant.name,
            participant.email,
            participant.phone,
            participant.college,
            participant.department,
            participant.year,
            participant.event,
            participant.comments
        );

        return res.status(201).json({
            message: "Registration successful!",
            registrationId: result.lastInsertRowid
        });
    } catch (error) {
        console.error("Database error:", error.message);

        return res.status(500).json({
            message: "Unable to save registration. Please try again."
        });
    }
});

// View saved registrations for local testing only.
// Add authentication before exposing this endpoint publicly.
app.get("/api/registrations", (req, res) => {
    try {
        const registrations = db.prepare(`
            SELECT id, name, email, phone, college,
                   department, year, event, comments, created_at
            FROM registrations
            ORDER BY id DESC
        `).all();

        res.json(registrations);
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            message: "Unable to retrieve registrations."
        });
    }
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`TechSpire is running at http://localhost:${PORT}`);
    console.log(`Frontend folder: ${publicPath}`);
});
