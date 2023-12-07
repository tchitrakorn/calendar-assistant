const itemControllers = require('../controllers/itemControllers'); 
const calendarModel = require('../models/calendarModel');
const dataModel = require('../models/dataModel');
const db = require('../database/queries');
const dbConnect = require('../database/connect');



// Mock the modules
jest.mock('../models/calendarModel');
jest.mock('../models/dataModel');
jest.mock('../database/queries');
jest.mock('../database/connect');


describe('Item Controllers', () => {
    let mockRequest;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequest = { email: 'test@gmail.com', orgId: 123 };
    });
    
    describe('track function', () => {
        beforeEach(() => {
            db.logUserEvent.mockResolvedValue(null);
            calendarModel.readCalendar.mockResolvedValue({ some: 'response' });
        });

        it('should log user event and read calendar', async () => {
            const response = await itemControllers.track(mockRequest);
            expect(db.logUserEvent).toHaveBeenCalledWith(mockRequest.email, 'track', mockRequest.orgId);
            expect(calendarModel.readCalendar).toHaveBeenCalledWith(mockRequest);
            expect(response).toEqual({ some: 'response' });
        });
    });

    describe('manage function', () => {
        beforeEach(() => {
            db.logUserEvent.mockResolvedValue(null);
            calendarModel.writeCalendar.mockResolvedValue({ result: 'calendar updated' });
        });

        it('should log user event and write to calendar', async () => {
            const response = await itemControllers.manage(mockRequest);
            expect(db.logUserEvent).toHaveBeenCalledWith(mockRequest.email, 'manage', mockRequest.orgId);
            expect(calendarModel.writeCalendar).toHaveBeenCalledWith(mockRequest);
            expect(response).toEqual({ result: 'calendar updated' });
        });
    });

    describe('getAnalytics function', () => {
        const mockOrgId = 123;
      
        beforeEach(() => {
          jest.clearAllMocks();
          dataModel.analyzeData.mockResolvedValue({ analytics: 'data' });
        });
      
        it('should analyze data for given orgId', async () => {
          const result = await itemControllers.getAnalytics(mockOrgId);
          expect(dataModel.analyzeData).toHaveBeenCalledWith(mockOrgId);
          expect(result).toEqual({ analytics: 'data' });
        });
      });
      

    describe('getUserData function', () => {
    const mockEmail = 'test@example.com';
    
    beforeEach(() => {
        jest.clearAllMocks();
        dataModel.readData.mockResolvedValue({ userData: 'data' });
    });
    
    it('should read data for given email', async () => {
        const result = await itemControllers.getUserData(mockEmail);
        expect(dataModel.readData).toHaveBeenCalledWith(mockEmail);
        expect(result).toEqual({ userData: 'data' });
    });
    });
    

    describe('manageUserData function', () => {
    const mockEmail = 'test@example.com';
    const mockFieldsToUpdate = { field1: 'value1', field2: 'value2' };
    
    beforeEach(() => {
        jest.clearAllMocks();
        dataModel.writeData.mockResolvedValue({ updated: true });
    });
    
    it('should update user data for given email and fields', async () => {
        const result = await itemControllers.manageUserData(mockEmail, mockFieldsToUpdate);
        expect(dataModel.writeData).toHaveBeenCalledWith(mockEmail, mockFieldsToUpdate);
        expect(result).toEqual({ updated: true });
    });
    });

    describe('deleteUserData function', () => {
    const mockEmail = 'test@example.com';
    
    beforeEach(() => {
        jest.clearAllMocks();
        dataModel.deleteData.mockResolvedValue({ deleted: true });
    });
    
    it('should delete user data for given email', async () => {
        const result = await itemControllers.deleteUserData(mockEmail);
        expect(dataModel.deleteData).toHaveBeenCalledWith(mockEmail);
        expect(result).toEqual({ deleted: true });
    });
    });
    

    
});
