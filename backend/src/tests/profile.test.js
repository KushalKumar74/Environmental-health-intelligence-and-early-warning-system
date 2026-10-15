const request = require('supertest');
const app = require('../app');
const Profile = require('../models/Profile');

jest.mock('../models/Profile');
jest.mock('../middlewares/auth', () => ({
  protect: (req, _res, next) => {
    req.user = { _id: 'mock_user_id', name: 'Test User' };
    next();
  },
}));

describe('Profile API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/profiles', () => {
    it('should return all profiles for authenticated user', async () => {
      const mockProfiles = [
        { _id: 'p1', name: 'Sara', age: 30, asthma: true },
        { _id: 'p2', name: 'Dad', age: 60, heartDisease: true },
      ];
      Profile.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockProfiles),
      });

      const res = await request(app).get('/api/profiles');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('POST /api/profiles', () => {
    it('should create a new profile', async () => {
      const mockSaved = {
        _id: 'p1',
        name: 'Sara',
        age: 30,
        asthma: true,
        allergies: false,
        diabetes: false,
        heartDisease: false,
      };

      Profile.prototype.save = jest.fn().mockResolvedValue(mockSaved);

      const res = await request(app)
        .post('/api/profiles')
        .send({ name: 'Sara', age: 30, asthma: true });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Sara');
    });

    it('should fail validation if name is missing', async () => {
      const res = await request(app)
        .post('/api/profiles')
        .send({ age: 30 });

      expect(res.statusCode).toBe(400);
    });
  });
});
