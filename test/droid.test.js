const droid = require('../lib/droid')

describe('test getBody()', () => {
    const successResult = ['/help', 'me', 'please']
    const issueCommentPayload = {
        action: 'created',
        comment: {body: '/help\r\nme\r\nplease'},
        issue: {}
    }
    const pullRequestPayload = {
        action: 'opened',
        pull_request: {body: '/help\r\nme\r\nplease'}
    }
    const issuePayload = {
        action: 'opened',
        issue: {body: '/help\r\nme\r\nplease'}
    }

    test('expect empty if event is not expected', () => {
        const payload = {action: ''}
        expect(droid.getBody('test', payload, 'any', true))
            .toStrictEqual([])
    })

    test('expect rows if event is issue_comment', () => {
        expect(droid.getBody('issue_comment', issueCommentPayload, 'any', false))
            .toStrictEqual(successResult)
    })

    test('expect rows if event is issue_comment and issueType is issue', () => {
        expect(droid.getBody('issue_comment', issueCommentPayload, 'issue', false))
            .toStrictEqual(successResult)
    })

    test('expect empty if event is issue_comment and issueType is pull_request', () => {
        expect(droid.getBody('issue_comment', issueCommentPayload, 'pull_request', false))
            .toStrictEqual([])
    })

    test('expect rows without comment if body has html comment', () => {
        const issueHtmlCommentPayload = {
            action: 'created',
            comment: {body: '/help\r\n <!-- me\r\nplease\r\n -->\r\n!<!--\r\n-->'},
            issue: {}
        }
        expect(droid.getBody('issue_comment', issueHtmlCommentPayload, 'issue', false))
            .toStrictEqual(['/help', ' ', '!'])
    })

    test('expect rows if event is issue_comment and issueType is pull_request', () => {
        const pullRequestCommentPayload = {...issueCommentPayload}
        pullRequestCommentPayload.issue.pull_request = {}
        expect(droid.getBody('issue_comment', pullRequestCommentPayload, 'pull_request', false))
            .toStrictEqual(successResult)
    })

    test('expect rows if event is pull_request', () => {
        expect(droid.getBody('pull_request', pullRequestPayload, 'any', true))
            .toStrictEqual(successResult)
    })

    test('expect rows if event is pull_request and issueType is pull_request', () => {
        expect(droid.getBody('pull_request', pullRequestPayload, 'pull_request', true))
            .toStrictEqual(successResult)
    })

    test('expect empty if event is pull_request and issueType is issue', () => {
        expect(droid.getBody('pull_request', pullRequestPayload, 'issue', true))
            .toStrictEqual([])
    })

    test('expect empty if event is pull_request and description off', () => {
        expect(droid.getBody('pull_request', pullRequestPayload, 'any', false))
            .toStrictEqual([])
    })

    test('expect rows if event is issues', () => {
        expect(droid.getBody('issues', issuePayload, 'any', true))
            .toStrictEqual(successResult)
    })

    test('expect rows if event is issues and issueType is issue', () => {
        expect(droid.getBody('issues', issuePayload, 'issue', true))
            .toStrictEqual(successResult)
    })

    test('expect empty if event is issues and issueType is pull_request', () => {
        expect(droid.getBody('issues', issuePayload, 'pull_request', true))
            .toStrictEqual([])
    })

    test('expect empty if event is issues and description off', () => {
        expect(droid.getBody('issues', issuePayload, 'any', false))
            .toStrictEqual([])
    })
})
