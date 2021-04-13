const parser = require('../lib/parser')

describe('test prepareExpectRule()', () => {
    test('expect Error if command or pattern not set', () => {
        expect(() => {
            parser.prepareExpectRule({})
        }).toThrowError(/field must be set/)
    })

    test('expect Error if command not set and pattern has not a command instead', () => {
        expect(() => {
            parser.prepareExpectRule({
                pattern: '(.*)'
            })
        }).toThrowError(/was not recognized/)
    })

    test('expect command if has simple pattern', () => {
        expect(parser.prepareExpectRule({
            pattern: '/test'
        })).toStrictEqual({
            command: 'test',
            pattern: /\/test/
        })
    })

    test('expect command if has regex pattern without args', () => {
        expect(parser.prepareExpectRule({
            pattern: '^/test (?<value>.*)$'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test (?<value>.*)$/
        })
    })

    test('expect pattern if has command', () => {
        expect(parser.prepareExpectRule({
            command: 'test'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test\b(\s+(?<value>.*))?$/
        })
    })
})
