const yaml = require('js-yaml')

function prepareExpectRule(item) {
    const expect = {}

    if (!Object.prototype.hasOwnProperty.call(item, 'command') && !Object.prototype.hasOwnProperty.call(item, 'pattern')) {
        throw new Error('The "command" or the "pattern" field must be set')
    }

    if (Object.prototype.hasOwnProperty.call(item, 'command')) {
        expect.command = item.command
    }

    if (!Object.prototype.hasOwnProperty.call(expect, 'command')) {
        const found = item.pattern.match(/\/([a-zA-Z][\w-]+\b)/u)
        if (!found) {
            throw new Error('The "command" was not recognized in the "pattern" field')
        }
        expect.command = found[1]
    }

    if (Object.prototype.hasOwnProperty.call(item, 'pattern')) {
        expect.pattern = new RegExp(item.pattern)
    }

    if (!Object.prototype.hasOwnProperty.call(expect, 'pattern')) {
        expect.pattern = new RegExp(`^\\/${expect.command}\\b(\\s+(?<value>.*))?$`)
    }

    if (Object.prototype.hasOwnProperty.call(expect, 'output')) {
        expect.defaultOutput = item.pattern
    }

    if (Object.prototype.hasOwnProperty.call(expect, 'value')) {
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

module.exports = {
    prepareExpectRule,
    deserializeInput
}