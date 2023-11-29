const db = require('../database/queries')

const validateTrackRequest = async (request) => {
    let errors = []

    const result = await db.getUsersOrgs(request.email)
    const hasExistingOrgRecord = result.some((record) => record.org_id == request.orgId)

    if (!hasExistingOrgRecord) {
        errors.push('This user is not matched with this org')
    }

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

const validateManageRequest = async (request) => {
    let errors = []

    const result = await db.getUsersOrgs(request.email)
    const hasExistingOrgRecord = result.some((record) => record.org_id == request.orgId)

    if (!hasExistingOrgRecord) {
        errors.push('This user is not matched with this org')
    }

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

module.exports = {
    validateTrackRequest,
    validateManageRequest
}