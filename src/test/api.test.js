const request = require('supertest')
const baseURL = 'http://localhost:3000'
const controllers = require('../controllers/itemControllers')
const db = require('../database/queries')

const setupTestUser = (done) => {
  db.postUser(
    'test@gmail.com',
    'client-id',
    'access-token',
    'refresh-token',
    'open-ai-key'
  ).then(() => {
    db.postUsersOrgs(
      'test@gmail.com',
      '1'
    )
  }).catch(err => err)
  done()
}

const setup = async () => {
  return await setupTestUser()
}

beforeEach((done) => {
  setup()
    .then(res => res)
    .catch(err => err)
  done()
})

afterEach(async (done) => {
  jest.restoreAllMocks();
  db.deleteUser({
    email: 'test@gmail.com'
  })
    .then(res => res)
    .catch(err => err)
});

describe('GET /track', () => {
  jest.mock('../controllers/itemControllers')
  controllers.track.mockResolvedValue({
    allEvents: [],
    groupedByType: {},
    analysisByType: {}
  })
  const trackRequest = {
    orgId: '1',
    email: 'test@gmail.com',
    scope: 7,
    groupBy: 'event',
    analysis: true
  }
  it('should return 200', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(200);
    expect(response.body.error).toBe(null);
  });
});

describe('GET /track', () => {
  jest.mock('../controllers/itemControllers')
  controllers.track.mockResolvedValue({
    allEvents: [],
    groupedByType: {},
    analysisByType: {}
  })
  const trackRequest = {
    orgId: '100',
    email: 'test@gmail.com',
    scope: 7,
    groupBy: 'event',
    analysis: true
  }
  it('should return 400', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /track', () => {
  jest.mock('../controllers/itemControllers')
  controllers.track.mockResolvedValue({
    allEvents: [],
    groupedByType: {},
    analysisByType: {}
  })
  const trackRequest = {
    orgId: '1',
    email: 'wrongtest@gmail.com',
    scope: 7,
    groupBy: 'event',
    analysis: true
  }
  it('should return 400', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /track', () => {
  jest.mock('../controllers/itemControllers')
  controllers.track.mockResolvedValue({
    allEvents: [],
    groupedByType: {},
    analysisByType: {}
  })
  const trackRequest = {
    orgId: '1',
    email: 'test@gmail.com',
    scope: -100,
    groupBy: 'event',
    analysis: true
  }
  it('should return 400', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /manage', () => {
  jest.mock('../controllers/itemControllers')
  controllers.manage.mockResolvedValue({
    type: 'insert',
    eventDetails: {}
  })
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "insert",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 200', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /manage', () => {
  jest.mock('../controllers/itemControllers')
  controllers.manage.mockResolvedValue({
    type: 'update',
    eventDetails: {}
  })
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "update",
    "eventId": "event-id",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 200', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /manage', () => {
  jest.mock('../controllers/itemControllers')
  controllers.manage.mockResolvedValue({
    type: 'delete',
    eventDetails: {}
  })
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "delete",
    "eventId": "event-id"
  }
  it('should return 200', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});


