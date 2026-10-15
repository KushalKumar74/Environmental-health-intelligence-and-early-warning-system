const request = require('supertest');
const app = require('../app');
const UserHealthRecord = require('../models/UserHealthRecord');
const { fetchAQIByCoordinates } = require('../services/aqiService');

// Mock external services & middleware
jest.mock('../models/UserHealthRecord');
jest.mock('../services/aqiService');
jest.mock('../middlewares/auth', () => ({
    protect: (req, _res, next) => {
        req.user = { _id: 'mock_user_id', name: 'Test User' };
        next();
    },
}));

describe('API Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/records', () => {
        it('should create a new record and return 201', async () => {
            const mockRecord = {
                _id: '123',
                age: 30,
                asthma: false,
                hoursOutside: 2,
                aqi: 2,
                predictedRisk: 'Low',
                score: 18,
                reasons: []
            };

            UserHealthRecord.prototype.save = jest.fn().mockResolvedValue(mockRecord);

            const res = await request(app)
                .post('/api/records')
                .send({
                    age: 30,
                    asthma: false,
                    hoursOutside: 2,
                    aqi: 2
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data.predictedRisk).toEqual('Low');
        });
    });

    describe('GET /api/aqi/current', () => {
        it('should fetch AQI by coordinates and return 200', async () => {
            fetchAQIByCoordinates.mockResolvedValue({
                aqi: 2,
                components: { co: 200 },
                dt: 1600000000
            });

            const res = await request(app)
                .get('/api/aqi/current')
                .query({ lat: 40.7128, lon: -74.0060 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.aqi).toEqual(2);
        });

        it('should return 400 if lat/lon is missing', async () => {
            const res = await request(app).get('/api/aqi/current');
            expect(res.statusCode).toEqual(400);
        });
    });
});
