const db = require('../database/queries')

const validateAuthenticateRequest = async (request) => {
  const result = await db.getUsersOrgs(request.email)
  const hasExistingOrgRecord = result.some(
    (record) => record.org_id === request.orgId
  )
  const errors = []
  if (!hasExistingOrgRecord) {
    errors.push({
      field: 'orgId',
      message: 'Invalid orgId for this user'
    })
  }
  return errors
}

const validateTrackRequest = async (request) => {
  const errors = []

  const result = await db.getUsersOrgs(request.email)
  const hasExistingOrgRecord = result.some(
    (record) => record.org_id === request.orgId
  )
  if (!hasExistingOrgRecord) {
    errors.push({
      field: 'orgId',
      message: 'Invalid orgId for this user'
    })
  }
  if (request.scope) {
    if (request.scope < 1 || request.scope > 30) {
      errors.push({
        field: 'scope',
        message: 'Must be a numerical value between 1 and 30 inclusive'
      })
    }
  }
  if (request.groupBy) {
    if (!['eventType', 'event', 'color'].includes(request.groupBy)) {
      errors.push({
        field: 'groupBy',
        message: 'Must be either eventType, event, or color'
      })
    }
  }

  return errors
}

const validateManageRequest = async (request) => {
  const errors = []

  const result = await db.getUsersOrgs(request.email)
  const hasExistingOrgRecord = result.some(
    (record) => record.org_id === request.orgId
  )
  if (!hasExistingOrgRecord) {
    errors.push({
      field: 'orgId',
      message: 'Invalid orgId for this user'
    })
  }

  if (!['insert', 'delete', 'update'].includes(request.type)) {
    errors.push({
      field: 'type',
      message: 'Must be either insert, delete, or update'
    })
  }
  if (request.type === 'insert') {
    if (
      request.startTime == null ||
            request.endTime == null ||
            request.timezone == null
    ) {
      errors.push({
        field: ['startTime', 'endTime', 'timeZone'],
        message: 'Must be provied for insert type'
      })
    }
  }
  if (request.type === 'delete') {
    if (request.eventId == null) {
      errors.push({
        field: ['eventId'],
        message: 'Must be provied for delete type'
      })
    }
  }
  if (request.type === 'update') {
    if (request.eventId == null) {
      errors.push({
        field: ['eventId'],
        message: 'Must be provied for update type'
      })
    }
    if (
      request.startTime != null ||
            request.endTime != null ||
            request.timezone != null
    ) {
      if (
        request.startTime == null ||
                request.endTime == null ||
                request.timezone == null
      ) {
        errors.push({
          field: ['startTime', 'endTime', 'timeZone'],
          message: 'Must be provied for update type'
        })
      }
    }
  }

  return errors
}

const validateOrgId = async (orgId) => {
  const result = await db.getOrg(orgId)
  if (result.length === 0) {
    throw new Error('Invalid orgId')
  }
}

const validateUser = async (email) => {
  const result = await db.getUser(email)
  if (result.length === 0) {
    throw new Error('Invalid user email')
  }
}

module.exports = {
  validateTrackRequest,
  validateManageRequest,
  validateAuthenticateRequest,
  validateOrgId,
  validateUser
}
