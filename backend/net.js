const express = require('express');
const { exec } = require('child_process'); // To run system commands
const cors = require('cors'); // To handle CORS
const app = express();
const port = 3001;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

app.post('/check-access', (req, res) => {
    const { ipAddress, username, password } = req.body;
    console.log("Received request:", req.body); // Log the received body

    // Check if the IP is reachable
    exec(`ping -c 1 ${ipAddress}`, (error) => {
        if (error) {
            console.log('IP address not reachable.');
            return res.status(404).json({ message: 'IP address not reachable.' });
        }

        // Placeholder for authentication logic
        if (username && password) {
            console.log(`Checking credentials for ${username}`);
            // Implement actual authentication logic here
        }

        // Sample accessible directories
        const accessibleDirs = [
            `\\\\${ipAddress}\\SharedFolder1`,
            `\\\\${ipAddress}\\SharedFolder2`,
        ];

        const responseMessage = { message: 'Access granted.', directories: accessibleDirs };
        console.log("Sending response:", responseMessage);
        return res.json(responseMessage);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
