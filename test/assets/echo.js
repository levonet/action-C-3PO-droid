const core = require('@actions/core')

const args = [process.env.INPUTS_ARG1, process.env.INPUTS_ARG2, process.env.INPUTS_ARG3]

core.info(args.join(' '))
