const validateTrackRequest = (request) => {
    console.log(request)
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
module.exports = {
    validateTrackRequest
}