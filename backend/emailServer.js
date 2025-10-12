//Email service dedicated server
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const emailRoutes = require('./routes/email.routes');

const app = express();

// Middleware configuration
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});

// Register only email routes
app.use('/api', emailRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Email Service is running');
});

// Port 3001 fixed
const port = 3001;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Email server running on port ${port}`);
});
