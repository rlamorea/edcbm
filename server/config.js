import dotenv from 'dotenv'
import { readdirSync } from 'fs';
dotenv.config({ path: './.edcbmenv'})

function validateNumber(v, desc, min, max) {
    let error = null
    try {
        v = parseInt(v)
        if (v < min || v > max) { error = `${desc} value: ${v} out of range (${min},${max})` }
    } catch (e) {
        error = 'invalid port: ' + v
    }
    return { value: v, error }
}

function validateVicePath(v) {
    let error = null
    try {
        const files = readdirSync(v)
        let hasViceCmd = false
        for (const f of files) {
            if (f.startsWith('x64sc')) {
                hasViceCmd = true
                break
            }
        }
        if (!hasViceCmd) {
            error = 'unable to locate VICE files at: ' + v
        }
    } catch (err) {
        error = 'bad directory: ' + v + ' - ' + err.toString()
    }

    return { value: v, error }
}

const trueValues = [ 1, true, 'true', 'yes', 't', 'y', '1' ]
const falseValues = [ 0, false, 'false', 'no', 'f', 'n', '0' ]

function validateFlag(v, name) {
    let error = null
    if (trueValues.includes(v.toLowerCase())) {
        v = true
    } else if (falseValues.includes(v.toLowerCase())) {
        v = false
    } else {
        error = `invalid ${name} flag value ${v}`
    }
    return { value: v, error }
}

const availableConfig = {
    PORT: { args: [ '-p', '--port' ], default: 3129, validator: (v) => { return validateNumber(v, 'port', 3000, 49151) } },
    VICE_PATH: { args: [ '-v', '--vice', '--vicepath' ], required: true, validator: validateVicePath },
    VICE_PORT: { args: [ '-V', '--vp', '--viceport' ], default: 6502, validator: (v) => { return validateNumber(v, 'port', 3000, 49151) } },
    VICE_RETRY_DELAY: { args: [ '-d', '--delay', '--retrydelay' ], default: 500, validator: (v) => { return validateNumber(v, 'delay', 10, 60000) } },
    VICE_RETRIES: { args: [ '-r', '--retries' ], default: 5, validator: (v) => { return validateNumber(v, 'retries', 1, 20) } },
    STARTUP_DELAY: { args: [ '-s', '--startup', '--startupdelay' ], default: 500, validator: (v) => { return validateNumber(v, 'startup delay', 10, 60000) } },
    COMMAND_DELAY: { args: [ '-c', '--command', '--commanddelay' ], default: 250, validator: (v) => { return validateNumber(v, 'command delay', 10, 60000) } },
    DEBUG_DELAY: { arcs: [ '-b', '--debugdelay' ], default: 50, validator: (v) => { return validateNumber(v, 'debug delay', 10, 60000) } },
    VICE_DEBUG: { args: [ '-D', '--debug' ], default: false, validator: (v) => { return validateFlag(v, 'debug') } }
}

const config = { }
let argIdx = 3
let configGood = true
while (process.argv.length >= argIdx) {
    const arg = process.argv[argIdx - 1]
    const equalIndex = arg.indexOf('=')
    if (equalIndex > 0) {
        const key = arg.substring(0, equalIndex).toLowerCase()
        const val = arg.substring(equalIndex + 1)
        for (const configKey in availableConfig) {
            const ac = availableConfig[configKey]
            if (ac.args.includes(key)) {
                const { value, error } = ac.validator(val)
                if (error) {
                    console.log(`bad argument: ${key}: ${error}`)
                    configGood = false
                    break
                }
                config[configKey] = value
                break
            }
        }
    } else {
        console.log('invalid argument:', arg)
        configGood = false
        break
    }
    argIdx += 1
}

for (const configKey in availableConfig) {
    if (configKey in config) { continue } // arg overrides environment
    const ac = availableConfig[configKey]
    const val = (process.env[configKey] || '').trim()
    let finalValue = val
    if (val === '') {
        if (ac.required) {
            configGood = false
            console.log(`no ${configKey} value`)
            break
        }
        finalValue = ac.default || ''
    } else {
        const { value, error } = ac.validator(val)
        if (error) {
            console.log(`bad value: ${configKey}: ${val}`)
            configGood = false
            break
        }
        finalValue = value
    }
    config[configKey] = finalValue
}

config['good'] = configGood

console.log('config loaded', config)

export default config
