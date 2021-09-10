const parser = require('../lib/parser')

describe('test expectRule()', () => {
    test('expect Error if command or pattern not set', () => {
        expect(() => {
            parser.expectRule({})
        }).toThrowError(/field must be set/)
    })

    test('expect command if has simple pattern', () => {
        expect(parser.expectRule({
            pattern: '/test'
        })).toStrictEqual({
            command: 'test',
            pattern: /\/test/u
        })
    })

    test('expect command if has regex pattern with args', () => {
        expect(parser.expectRule({
            pattern: '^/test (?<value>.*)$'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test (?<value>.*)$/u
        })
    })

    test('expect command if has regex pattern with KV', () => {
        expect(parser.expectRule({
            pattern: '^/test (?<output>.*)=(?<value>.*)$'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test (?<output>.*)=(?<value>.*)$/u
        })
    })

    test('expect command if has regex pattern with equation', () => {
        expect(parser.expectRule({
            pattern: '^/test=(?<value>.*)$'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test=(?<value>.*)$/u
        })
    })

    test('expect command and defaultOutput if has simple pattern with output', () => {
        expect(parser.expectRule({
            pattern: '/test',
            output: 'testKey'
        })).toStrictEqual({
            command: 'test',
            pattern: /\/test/u,
            defaultOutput: 'testKey'
        })
    })

    test('expect command and defaultValue if has simple pattern with value', () => {
        expect(parser.expectRule({
            pattern: '/test',
            value: '123'
        })).toStrictEqual({
            command: 'test',
            pattern: /\/test/u,
            defaultValue: '123'
        })
    })

    test('expect command, defaultOutput and defaultValue if has simple pattern with output and value', () => {
        expect(parser.expectRule({
            pattern: '/test',
            output: 'testKey',
            value: '123'
        })).toStrictEqual({
            command: 'test',
            pattern: /\/test/u,
            defaultOutput: 'testKey',
            defaultValue: '123'
        })
    })

    test('expect pattern if has command', () => {
        expect(parser.expectRule({
            command: 'test'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test\b(\s+(?<value>.*))?$/u
        })
    })

    test('expect pattern and defaultOutput if has command with output', () => {
        expect(parser.expectRule({
            command: 'test',
            output: 'testKey'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test\b(\s+(?<value>.*))?$/u,
            defaultOutput: 'testKey'
        })
    })

    test('expect pattern and defaultValue if has command with value', () => {
        expect(parser.expectRule({
            command: 'test',
            value: '123'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test\b(\s+(?<value>.*))?$/u,
            defaultValue: '123'
        })
    })

    test('expect pattern, defaultOutput and defaultValue if has command with pattern, output and value', () => {
        expect(parser.expectRule({
            command: 'test',
            output: 'testKey',
            value: '123'
        })).toStrictEqual({
            command: 'test',
            pattern: /^\/test\b(\s+(?<value>.*))?$/u,
            defaultOutput: 'testKey',
            defaultValue: '123'
        })
    })

    test('expect Error if command not set and pattern has not a command instead', () => {
        expect(() => {
            parser.expectRule({
                pattern: '(.*)'
            })
        }).toThrowError(/was not recognized/)
    })

    test('expect success if has overall pattern and command', () => {
        expect(parser.expectRule({
            command: 'test',
            pattern: '(.*)'
        })).toStrictEqual({
            command: 'test',
            pattern: /(.*)/u
        })
    })

    test('expect success if has overall pattern and output', () => {
        expect(parser.expectRule({
            pattern: '(.*)',
            output: 'testKey'
        })).toStrictEqual({
            pattern: /(.*)/u,
            defaultOutput: 'testKey'
        })
    })
})

describe('test parseRow()', () => {
    const expectRules = [
        {
            command: 'test1',
            pattern: /\/test1/u
        },
        {
            command: 'test_1a',
            pattern: /\/test_1b/u
        },
        {
            command: 'test2',
            pattern: /^\/test2 (?<value>.*)$/u
        },
        {
            // duplicate command and pattern
            command: 'test2',
            pattern: /^\/test2 (?<value>.*)$/u,
            defaultOutput: 't2-1'
        },
        {
            command: 'test3',
            pattern: /^\/test3 (?<output>.*)=(?<value>.*)$/u
        },
        {
            command: 'test4',
            pattern: /\/test4/u,
            defaultOutput: 't4'
        },
        {
            command: 'test5',
            pattern: /^\/test5\b(\s+(?<value>.*))?$/u,
            defaultOutput: 't5'
        },
        {
            command: 'test6',
            pattern: /\/test6/u,
            defaultValue: '468'
        },
        {
            command: 'test7',
            pattern: /^\/test7\b(\s+(?<value>.*))?$/u,
            defaultValue: '468'
        },
        {
            command: 'test8',
            pattern: /\/test8/u,
            defaultOutput: 't8',
            defaultValue: '468'
        },
        {
            command: 'test9',
            pattern: /^\/test9 (?<output>.*)=(?<value>.*)$/u,
            defaultOutput: 't9',
            defaultValue: '468'
        },
        {
            command: 'test-10',
            pattern: /^\/test-10\b(\s+(?<value>.*))?$/u
        },
        {
            command: 'test-11',
            pattern: /.*321.*/u
        },
        {
            pattern: /.*654.*/u,
            defaultOutput: 'test-12'
        },
        {
            pattern: /.*987.*/u,
            defaultOutput: 'test-13',
            defaultValue: '468'
        },
        {
            command: 'test-14',
            pattern: /^\/test-14\b(\s+(?<output>.+))?$/u,
            defaultValue: '468'
        }
    ]

    beforeEach(() => {
        this.result = {old: '1'}
    })

    test('expect no changes if row is empty', () => {
        const rules = [
            ...expectRules,
            {
                command: 'test-99',
                pattern: /.*/u
            }
        ]
        parser.parseRow(this.result, rules, ' ')
        expect(this.result).toStrictEqual({commands: [], old: '1'})
    })

    test('expect no changes if has no rules', () => {
        parser.parseRow(this.result, [], 'test')
        expect(this.result).toStrictEqual({commands: [], old: '1'})
    })

    test('expect no changes if ', () => {
        parser.parseRow(this.result, expectRules, '!@#$%^&')
        expect(this.result).toStrictEqual({commands: [], old: '1'})
    })

    test('expect command in output if have simple coincidence', () => {
        parser.parseRow(this.result, expectRules, '/test1 123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test1'}],
            old: '1',
            'is-test1': '/test1 123'
        })
    })

    test('expects a match on the pattern, but returns the output parameter relative to the command', () => {
        parser.parseRow(this.result, expectRules, '/test_1b 123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test_1a'}],
            old: '1',
            'is-test_1a': '/test_1b 123'
        })
    })

    test('expect no changes if have same command in result', () => {
        this.result['is-test1'] = '/test1 000'
        parser.parseRow(this.result, expectRules, '/test1 123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test1'}],
            old: '1',
            'is-test1': '/test1 000'
        })
    })

    test('expect output key `has-<command>` if have coincidence by pattern with value', () => {
        parser.parseRow(this.result, expectRules, '/test2 123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test2', value: '123'}],
            old: '1',
            'is-test2': '/test2 123',
            'has-test2': '123'
        })
    })

    test('expect output key `has-<command>-<output>` if have coincidence by kv pattern', () => {
        parser.parseRow(this.result, expectRules, '/test3 t-1=123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test3', output: 't-1', value: '123'}],
            old: '1',
            'is-test3': '/test3 t-1=123',
            'has-test3-t-1': '123'
        })
    })

    test('expect output key `has-<command>` with value if do not pass output key', () => {
        parser.parseRow(this.result, expectRules, '/test3 =123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test3', value: '123'}],
            old: '1',
            'is-test3': '/test3 =123',
            'has-test3': '123'
        })
    })

    test('expect output key `has-<command>-<output>` with default value if have coincidence by simple pattern and preset output', () => {
        parser.parseRow(this.result, expectRules, '/test4 123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test4', output: 't4'}],
            old: '1',
            'is-test4': '/test4 123',
            'has-test4-t4': 'true'
        })
    })

    test('expect output key `has-<command>-<output>` with value if have coincidence by command and preset output', () => {
        parser.parseRow(this.result, expectRules, '/test5  123 ')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test5', output: 't5', value: '123'}],
            old: '1',
            'is-test5': '/test5  123 ',
            'has-test5-t5': '123'
        })
    })

    test('expect output key `has-<command>-<output>` with value if have coincidence by command without value', () => {
        parser.parseRow(this.result, expectRules, '/test5')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test5', output: 't5', value: ''}],
            old: '1',
            'is-test5': '/test5',
            'has-test5-t5': ''
        })
    })

    test('expect output key `has-<command>` with preset value if have coincidence by simple pattern and preset value', () => {
        parser.parseRow(this.result, expectRules, '/test6  123 ')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test6', value: '468'}],
            old: '1',
            'is-test6': '/test6  123 ',
            'has-test6': '468'
        })
    })

    test('expect output key `has-<command>` with preset value if have coincidence by pattern with value and preset value', () => {
        parser.parseRow(this.result, expectRules, '/test7  123 ')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test7', value: '468'}],
            old: '1',
            'is-test7': '/test7  123 ',
            'has-test7': '468'
        })
    })

    test('expect output key `has-<command>-<output>` with preset value if have coincidence by simple pattern and preset output and value', () => {
        parser.parseRow(this.result, expectRules, '/test8 key=123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test8', output: 't8', value: '468'}],
            old: '1',
            'is-test8': '/test8 key=123',
            'has-test8-t8': '468'
        })
    })

    test('expect output key `has-<command>-<output>` with preset value if have coincidence by kv pattern and preset output and value', () => {
        parser.parseRow(this.result, expectRules, '/test9 key=123')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test9', output: 't9', value: '468'}],
            old: '1',
            'is-test9': '/test9 key=123',
            'has-test9-t9': '468'
        })
    })

    test('expect output key `has-<command>` with value if have coincidence by command', () => {
        parser.parseRow(this.result, expectRules, '/test-10  123 ')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test-10', value: '123'}],
            old: '1',
            'is-test-10': '/test-10  123 ',
            'has-test-10': '123'
        })
    })

    test('expect command if have coincidence by overall pattern', () => {
        parser.parseRow(this.result, expectRules, ' bla321 bla ')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test-11'}],
            old: '1',
            'is-test-11': ' bla321 bla '
        })
    })

    test('expect output key `has-<output>` if have coincidence by overall pattern and preset output', () => {
        parser.parseRow(this.result, expectRules, ' bla654 bla ')
        expect(this.result).toStrictEqual({
            commands: [{output: 'test-12'}],
            old: '1',
            'has-test-12': 'true'
        })
    })

    test('expect output key `has-<output>` if have coincidence by overall pattern and preset output and value', () => {
        parser.parseRow(this.result, expectRules, ' bla987 bla ')
        expect(this.result).toStrictEqual({
            commands: [{output: 'test-13', value: '468'}],
            old: '1',
            'has-test-13': '468'
        })
    })

    test('expect output key `has-<command>` with value if output not defined', () => {
        parser.parseRow(this.result, expectRules, '/test-14')
        expect(this.result).toStrictEqual({
            commands: [{command: 'test-14', value: '468'}],
            old: '1',
            'is-test-14': '/test-14',
            'has-test-14': '468'
        })
    })

    test('expect sequential processing', () => {
        parser.parseRow(this.result, expectRules, '/test7')
        parser.parseRow(this.result, expectRules, '/test-10 .')
        parser.parseRow(this.result, expectRules, '/test3 foo=bar')
        parser.parseRow(this.result, expectRules, '/test3 .=foo')
        expect(this.result).toStrictEqual({
            commands: [
                {command: 'test7', value: '468'},
                {command: 'test-10', value: '.'},
                {command: 'test3', output: 'foo', value: 'bar'},
                {command: 'test3', output: '.', value: 'foo'}
            ],
            old: '1',
            'is-test7': '/test7',
            'has-test7': '468',
            'is-test-10': '/test-10 .',
            'has-test-10': '.',
            'is-test3': '/test3 foo=bar',
            'has-test3-foo': 'bar',
            'has-test3-.': 'foo'
        })
    })
})
