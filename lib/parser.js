const yaml = require('js-yaml')

const DEFAULT_VALUE = 'true'

function expectRule(item) {
    const expect = {}

    if (!Object.prototype.hasOwnProperty.call(item, 'command') && !Object.prototype.hasOwnProperty.call(item, 'pattern')) {
        throw new Error('The "command" or the "pattern" field must be set')
    }

    if (Object.prototype.hasOwnProperty.call(item, 'command')) {
        expect.command = item.command
    }

    if (!Object.prototype.hasOwnProperty.call(expect, 'command')) {
        const found = item.pattern.match(/\/([a-zA-Z][\w-]+\b)/u)
        if (!found && !Object.prototype.hasOwnProperty.call(item, 'output')) {
            throw new Error('The "command" was not recognized in the "pattern" field')
        }
        if (found !== null) {
            expect.command = found[1]
        }
    }

    if (Object.prototype.hasOwnProperty.call(item, 'pattern')) {
        expect.pattern = new RegExp(item.pattern, 'u')
    }

    if (!Object.prototype.hasOwnProperty.call(expect, 'pattern')) {
        expect.pattern = new RegExp(`^\\/${expect.command}\\b(\\s+(?<value>.*))?$`, 'u')
    }

    if (Object.prototype.hasOwnProperty.call(item, 'output')) {
        expect.defaultOutput = item.output
    }

    if (Object.prototype.hasOwnProperty.call(item, 'value')) {
        expect.defaultValue = item.value
    }

    return expect
}

function deserializeInput(inputYaml, cb) {
    if (!inputYaml) {
        return []
    }

    return yaml.load(inputYaml).map(cb)
}

function parseRow(result, expect, str) {
    if (!Array.isArray(result['commands'])) {
        result['commands'] = []
    }

    if (str.trim() === '') {
        return
    }

    for (const rule of expect) {
        let pass = false

        const r = rule.pattern.exec(str)
        if (r === null) {
            continue
        }

        const command = Object.prototype.hasOwnProperty.call(rule, 'command') ? rule.command : null
        const commandKey = command !== null ? `is-${command}` : null
        if (command !== null && !Object.prototype.hasOwnProperty.call(result, commandKey)) {
            result[commandKey] = str
        }
        // Don't check other rules if the command is already defined as the result
        if (Object.prototype.hasOwnProperty.call(result, commandKey)) {
            pass = true
        }

        let output = Object.prototype.hasOwnProperty.call(rule, 'defaultOutput') ? rule.defaultOutput : null
        if (output === null && Object.prototype.hasOwnProperty.call(r.groups || {}, 'output')) {
            output = typeof r.groups.output !== 'undefined' ? r.groups.output : null
        }
        // The output key cannot be empty
        if (output === '') {
            output = null
        }

        let value = Object.prototype.hasOwnProperty.call(rule, 'defaultValue') ? rule.defaultValue : null
        if (value === null && Object.prototype.hasOwnProperty.call(r.groups || {}, 'value')) {
            value = typeof r.groups.value !== 'undefined' ? r.groups.value : ''
        }

        if (output !== null) {
            const outputKey = command !== null ? `has-${command}-${output}` : `has-${output}`
            if (!Object.prototype.hasOwnProperty.call(result, outputKey)) {
                result[outputKey] = value !== null ? value.trim() : DEFAULT_VALUE
            }
            if (Object.prototype.hasOwnProperty.call(result, outputKey)) {
                pass = true
            }
        }

        if (command !== null && value !== null && output === null) {
            const outputKey = `has-${command}`
            if (!Object.prototype.hasOwnProperty.call(result, outputKey)) {
                result[outputKey] = value.trim()
            }
        }

        if (pass) {
            result['commands'].push(getEntity(command, output, value))

            break
        }
    }
}

function getEntity(command, output, value) {
    const entity = {}

    if (command !== null) {
        entity.command = command
    }
    if (output !== null) {
        entity.output = output
    }
    if (value !== null) {
        entity.value = value.trim()
    }

    return entity
}

function parser(expectYaml, body) {
    const expect = deserializeInput(expectYaml, expectRule)
    const answer = {}

    if (!Array.isArray(expect) || !expect.length) {
        return answer
    }

    for (const row of body) {
        parseRow(answer, expect, row)
    }

    return answer
}

module.exports = {
    expectRule,
    deserializeInput,
    parseRow,
    parser
}
