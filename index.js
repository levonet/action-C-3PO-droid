const core = require('@actions/core')
const { context } = require('@actions/github')

async function run() {
    try {
        core.info(`eventName: ${context.eventName}`)
        core.info(JSON.stringify(context.payload))
        if (context.eventName !== 'issue_comment'
            || (context.eventName === 'issue_comment' && !context.payload.issue.pull_request)) {
            core.info('There is no comment action.')
            return
        }

        const expect = core.getInput('expect', {required: true})
        const body = context.eventName === 'issue_comment'
            ? context.payload.comment.body
            : context.payload.pull_request.body

        core.info(`expect: ${expect}`)

        core.setOutput('body', body)
        core.info(`body: ${body}`)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
