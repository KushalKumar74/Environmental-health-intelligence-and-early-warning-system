const dotenv = require('dotenv');
dotenv.config(); // MUST be first — loads env vars before any other module reads them

if (!process.env.OPENWEATHER_API_KEY) {
    console.error('FATAL ERROR: OPENWEATHER_API_KEY environment variable is missing.');
    process.exit(1);
}

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aqi_platform';

// Connect to Database
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        const server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });

        // Handle unhandled promise rejections gracefully without crashing
        process.on('unhandledRejection', (err) => {
            console.error(`[Unhandled Rejection]: ${err?.message || err}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
