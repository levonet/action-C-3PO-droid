const { parser } = require('./parser')

function splitBody(text) {
    if (!text) {
        return []
    }

    const str = text.replace(/<!--(.|\r|\n)*?-->/gum, '')
    return str.split(/\r?\n/)
}

function getBody(eventName, payload, issueType, inDescription) {
    if (eventName === 'pull_request'
        && payload.action === 'opened'
        && ['any', 'pull_request'].includes(issueType)
        && inDescription) {
        return splitBody(payload.pull_request.body)
    }

    if (eventName === 'issues'
        && payload.action === 'opened'
        && ['any', 'issue'].includes(issueType)
        && inDescription) {
        return splitBody(payload.issue.body)
    }

    if (['issues', 'pull_request'].includes(eventName)) {
        return []
    }

    if ((issueType === 'pull_request' && !payload.issue.pull_request)
        || (issueType === 'issue' && payload.issue.pull_request)) {
        return []
    }

    if (eventName === 'issue_comment'
        && payload.action === 'created') {
        return splitBody(payload.comment.body)
    }

    return []
}

function run(core, eventName, payload) {
    const expect = core.getInput('expect', {required: true})
    const issueType = core.getInput('in', {required: true})
    const inDescription = core.getInput('description', {required: true}) === 'true'

    if (!(['any', 'issue', 'pull_request'].includes(issueType))) {
        core.error('Wrong value of "in". Sould be one of "any", "issue" or "pull_request"')
        return
    }

    const body = getBody(eventName, payload, issueType, inDescription)
    if (!body.length) {
        core.info('There is no comment action.')
        return
    }

    for (const [key, value] of Object.entries(parser(expect, body))) {
        const outputId = key.replace(/[^\w_-]+/gu, '_')
        if (outputId.match(/^[a-zA-Z_]/u) === null) {
            core.warning(`Can't set output parameter "${outputId}". Name of output parameter must start with a letter or _.`)
            continue
        }
        core.info(`Set parameter "${outputId}" to "${value}"`)
        core.setOutput(outputId, value)
    }
}

module.exports = {
    splitBody,
    getBody,
    run
}
