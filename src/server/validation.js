const validateTrackRequest = (request) => {
    let errors = []
    if (request.scope) {
        if (request.scope < 1 || request.scope > 30) {
            errors.push('scope must be a numerical value between 1 and 30 inclusive.')
        }
    }
    if (request.groupBy) {
        if (request.groupBy != 'eventType' && request.groupBy != 'event' && request.groupBy != 'color') {
            errors.push('groupBy must be either one of three specified strings: \'eventType\', \'event\', or \'color\'.')
        }
    }
    return errors
}

const validateManageRequest = (request) => {
    console.log(request)
    let errors = []
    if (!['insert', 'delete', 'update'].includes(request.type)) {
        errors.push('Incorrect manage type')
    }
    if (request.type == 'insert') {
        if (request.startTime == null || request.endTime == null || request.timezone == null) {
            errors.push('To create a new event, startTime, endTime, and timezone must be provided.')
        }
    }
    if (request.type == 'delete') {
        if (request.eventId == null) {
            errors.push('To delete an event, eventId must be provided.')
        }
    }
    if (request.type == 'update') {
        if (request.eventId == null) {
            errors.push('To update an event, eventId must be provided.')
        }
        if (request.startTime != null || request.endTime != null || request.timezone != null) {
            if (request.startTime == null || request.endTime == null || request.timezone == null) {
                errors.push('To update an event with time, startTime, endTime, and timezone must be provided.')
            }
        }
    }

    return errors
}



const validateExplorePreferences = (preferences) => {
    if (!preferences) {
      throw new Error('Preferences are required');
    }
  
    const { location, interests, timeRange, maxResults } = preferences;
  
    if (!location || typeof location !== 'string') {
      throw new Error('Invalid or missing location');
    }
  
    if (!Array.isArray(interests)) {
      throw new Error('Interests must be an array');
    }
  
    if (!timeRange || !timeRange.start || !timeRange.end) {
      throw new Error('Invalid or missing time range');
    }
  
    if (typeof maxResults !== 'number' || maxResults <= 0) {
      throw new Error('maxResults must be a positive number');
    }
  
    return true;
  };
  
  

module.exports = {
    validateTrackRequest,
    validateManageRequest,
    validateExplorePreferences
}