const core = require('@actions/core')
const { context } = require('@actions/github')
const { run } = require('./lib/droid')

try {
    run(core, context.eventName, context.payload)
} catch (error) {
    core.setFailed(error.message)
}
