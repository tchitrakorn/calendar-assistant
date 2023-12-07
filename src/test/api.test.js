const request = require('supertest')
const baseURL = 'http://localhost:3000'
const controllers = require('../controllers/itemControllers')
const db = require('../database/queries')
const server = require('../server/server')

// Setup mock
jest.mock('../controllers/itemControllers')

const mockTrackData = jest.spyOn(controllers, 'track').mockReturnValue({
  allEvents: [],
  groupedByType: {},
  analysisByType: {}
});

const mockManageData = jest.spyOn(controllers, 'manage').mockReturnValue({
  type: '',
  eventDetails: {}
});

//const mockAnalyticsData = jest.spyOn(controllers, 'getAnalytics').mockReturnValue({});

// Setup database because each test
beforeEach((done) => {
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
})

// Cleanup the database after each test
afterEach((done) => {
  jest.restoreAllMocks();
  db.deleteUser({
    email: 'test@gmail.com'
  })
    .then(res => res)
    .catch(err => err)
  done()
});


// Test track endpoint
describe('GET /track', () => {
  const trackRequest = {
    orgId: '1',
    email: 'test@gmail.com',
    scope: 7,
    groupBy: 'event',
    analysis: true
  }
  it('should return 200 for a valid request', async () => {
    //const spy = jest.spyOn(controllers, 'track');
    const response = await request(baseURL).get('/track').send(trackRequest);
    //expect(spy).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
    expect(response.body.error).toBe(undefined);
  });
});

describe('GET /track', () => {
  const trackRequest = {
    orgId: '100',
    email: 'test@gmail.com',
    scope: 7,
    groupBy: 'event',
    analysis: true
  }
  it('should return 400 for an invalid orgId', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /track', () => {
  const trackRequest = {
    orgId: '1',
    email: 'wrongtest@gmail.com',
    scope: 7,
    groupBy: 'event',
    analysis: true
  }
  it('should return 400 for an invalid email', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('GET /track', () => {
  const trackRequest = {
    orgId: '1',
    email: 'test@gmail.com',
    scope: -100,
    groupBy: 'event',
    analysis: true
  }
  it('should return 400 for an invalid scope value', async () => {
    const response = await request(baseURL).get('/track').send(trackRequest);
    expect(response.statusCode).toBe(400);
  });
});


// Test manage endpoint
describe('POST /manage (insert)', () => {
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
  it('should return 200 for a valid request (insert)', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /manage (insert)', () => {
  const manageRequest = {
    "orgId": "100",
    "email": "test@gmail.com",
    "type": "insert",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for an invalid orgId', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});


describe('POST /manage (insert)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "wrongtest@gmail.com",
    "type": "insert",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for an invalid email', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});


describe('POST /manage (insert)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "wrongtest@gmail.com",
    "type": "insert",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for a missing start time', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});


describe('POST /manage (insert)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "insert",
    "startTime": "2023-11-30T16:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for a missing end time', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});


describe('POST /manage (insert)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "insert",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for a missing timezone', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});


describe('POST /manage (update)', () => {
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
  it('should return 200 for an valid request (update)', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /manage (update)', () => {
  const manageRequest = {
    "orgId": "100",
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
  it('should return 400 for an invalid orgId', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /manage (update)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "wrongtest@gmail.com",
    "type": "update",
    "eventId": "event-id",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for an invalid email', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /manage (update)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "update",
    "startTime": "2023-11-30T16:00:00-05:00",
    "endTime": "2023-11-30T18:00:00-05:00",
    "timezone": "America/New_York",
    "summary": "Test summary",
    "description": "Test description",
    "location": "Test location"
  }
  it('should return 400 for a missing eventId', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /manage (delete)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "delete",
    "eventId": "event-id"
  }
  it('should return 200 for a valid request (delete)', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /manage (delete)', () => {
  const manageRequest = {
    "orgId": "100",
    "email": "test@gmail.com",
    "type": "delete",
    "eventId": "event-id"
  }
  it('should return 400 for an invalid orgId', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});

describe('POST /manage (delete)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "wrongtest@gmail.com",
    "type": "delete",
    "eventId": "event-id"
  }
  it('should return 400 for an invalid email', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});


describe('POST /manage (delete)', () => {
  const manageRequest = {
    "orgId": "1",
    "email": "test@gmail.com",
    "type": "delete"
  }
  it('should return 400 for a missing eventId', async () => {
    const response = await request(baseURL).post('/manage').send(manageRequest);
    expect(response.statusCode).toBe(400);
  });
});

/*
// Test analytics endpoint
describe('GET /analytics', () => {
  const manageRequest = {
    "orgId": "1"
  }
  it('should return 200 for a valid request', async () => {
    const response = await request(baseURL).get('/analytics').send(manageRequest);
    expect(response.statusCode).toBe(200);
  });
});
*/






