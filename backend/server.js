const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./v1.routes/index');
const connectDB = require('./v1.utils/db');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const logger = require('./v1.utils/log');
const cronJobs = require('./v1.services/cronJobs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api/v1', routes);

app.get('/', (req, res) => {
    res.json({message: "Hi"});
})

app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on http://0.0.0.0:${PORT}`);

    // Start cron jobs for automated weather data collection
    cronJobs.startAll();
    logger.info('Automated weather data collection enabled');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing server');
    cronJobs.stopAll();
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing server');
    cronJobs.stopAll();
    process.exit(0);
});
