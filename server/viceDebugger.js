const STX = 0x02
const ViceAPIVersion = 0x02
export const typeBits = {
    'int8': 8,
    'int16': 16,
    'addr': 16,
    'int32': 32
}
export const boolval = { bfalse: 0, btrue: 1 }
export const memSpace = {
    mainMemory: 0,
    drive8: 1,
    drive9: 2,
    drive10: 3,
    drive11: 4,
}
export const checkpointOperations = {
    load: 0x01,
    store: 0x02,
    exec: 0x04
}
export const resetDevice = {
    softReset: 0,
    hardReset: 1,
    drive8: 8,
    drive9: 9,
    drive10: 10,
    drive11: 11
}
const validPETSCII = `ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !"#$%&'()*+,-./:;<=>?[]@` + '\n'
const PETSCIICodes = [
    65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 80, 82, 83, 84, 85, 86, 87, 88, 89, 90, // letters
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // numbers
    32, // space
    33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, // symbols ! to /
    58, 59, 60, 61, 62, 63, // symbols : to ?
    91, 93, 64, // symbols [, ], and @
    13 // return
]
export function toPetsciiCode(char) {
    if (char.length === 0) return ''
    if (char.length > 1) {
        return [...char].map(ch => toPetsciiCode(ch))
    }
    const petsciiIdx = validPETSCII.indexOf(char)
    if (petsciiIdx < 0) { return '' }
    return PETSCIICodes[petsciiIdx]
}

export class ViceCommand {
    static commands = {
        'memget': { 
            commandByte: 0x01,
            payload: [
                'sideEffects', // boolean
                { name: 'startAddress', type: 'addr', required: true },
                { name: 'endAddress', type: 'addr', required: true },
                'memSpace', // memSpace
                { name: 'bankId', type: 'int16' }
            ]
        },
        'memset': {
            commandByte: 0x02,
            payload: [
                'sideEffects', // boolean
                { name: 'startAddress', type: 'addr', required: true },
                { name: 'endAddress', type: 'addr', required: { min: 1 } },
                'memSpace', // memSpace
                { name: 'bankId', type: 'int16' },
                { name: 'dataBytes', type: 'varray', length: { name: '', start: 'startAddress', end: 'endAddress', type: 'int16' } }
            ]
        },
        'chkget': {
            commandByte: 0x11,
            payload: [
                { name: 'checkpoint', type: 'int32', required: true }
            ]
        },
        'chkset': {
            commandByte: 0x12,
            responseByte: 0x11,
            payload: [
                { name: 'startAddress', type: 'addr', required: true },
                { name: 'endAddress', type: 'addr' },
                'stopWhenHit', // boolean
                'enabled', // boolean
                { name: 'operation', required: { min: 1 } }, // checkpointOperations
                'temporary', // boolean
                'memSpace' // memSpace
            ]
        },
        'chkdel' : {
            commandByte: 0x13,
            payload: [
                { name: 'checkpoint', type: 'int32', required: true }
            ]
        },
        'chklist' : 0x14,
        'chkenable' : {
            commandByte: 0x15,
            payload: [
                { name: 'checkpoint', type: 'int32', required: true },
                { name: 'enabled', default: 1 } // boolean
            ]
        },
        'chkcondition': {
            commandByte: 0x22,
            payload: [
                { name: 'checkpoint', type: 'int32', required: true },
                //'length', // int8
                { name: 'condition', type: 'string', length: { type: 'int8' } }
            ]
        },
        'regget': {
            commandByte: 0x31,
            payload: [
                'memSpace', // memSpace
            ]
        },
        'regset': {
            commandByte: 0x32,
            responseByte: 0x31,
            payload: [
                'memSpace', // memSpace,
                // 'count', 
                { name: 'values', type: 'items', payload: {
                    size: 'size',
                    payload: [
                        'register', // reference index from return of registers from 'inforeg'
                        { name: 'value', type: 'intbits' }
                    ]
                } }
            ]
        },
        'execadv': {
            commandByte: 0x71,
            payload: [
                'skipsubs', // boolean
                { name: 'count', type: 'int16', default: 1 }
            ]
        },
        'execrts': 0x73,
        'execrun': 0xaa,
        'type': {
            commandByte: 0x72,
            payload: [
                // 'length', // int8
                { name: 'text', type: 'petscii' }
            ]
        },
        'ping': 0x81,
        'infobanks': 0x82,
        'inforeg': {
            commandByte: 0x83,
            payload: [
                'memSpace' // memSpace
            ]
        },
        'infopalette': {
            commandByte: 0x91,
            payload: [ 
                { name: 'vic2', type: 'int8', default: boolval.btrue } 
            ]
        },
        'infovice': 0x85,
        'quit': 0xbb,
        'reset': {
            commandByte: 0xcc,
            payload: [
                'reset', // resetDevice
            ]
        }
    }

    constructor(command, args = {}, requestId) {
        this.command = command
        this.args = args
        this.request = requestId || Math.floor(Math.random() * (2**32 - 1))

        this.commandStruct = ViceCommand.commands[command]
        if (!this.commandStruct) {
            throw new Error(`Unknown command: ${command}`)
        }
        if (!(this.commandStruct instanceof Object)) {
            this.commandStruct = { commandByte: this.commandStruct, payload: [] }
        }
        this.response = this.commandStruct.responseByte || this.commandStruct.commandByte
        const pbytes = this.getPayloadBytes({ name: command, payload: this.commandStruct }, this.args)
        this.payloadBytes =  [
            STX,
            ViceAPIVersion,
            ...this.getIntBytes(32, pbytes.length, { name: 'total payload', type: 'int32' }),
            ...this.getIntBytes(32, this.request, { name: 'requestId', type: 'int32' }),
            this.commandStruct.commandByte,
            ...pbytes
        ]
    }

    payloadName(payload) {
        let idx = ''
        if ('index' in payload) { idx = `[${payload.index}]`}
        return `${payload.name}${idx}`
    }

    isString(val) {
        return (typeof val === 'string' || val instanceof String)
    }

    getIntBytes(bits, value, payload) {
        const max = 2**bits-1
        if (value < 0 || value > max) {
            throw new Error(`Invalid ${payload.type} value ${value} for ${this.payloadName(payload)}`)
        }
        let vbytes = []
        const bytes = bits / 8
        for (let byte = bytes - 1; byte >= 0; byte--) {
            const divisor = 2**(byte*8)
            const byteval = Math.floor(value / divisor)
            vbytes.unshift(byteval)
            value -= byteval * divisor
        }
        return vbytes
    }

    getCharCode(char, strType) {
        return strType === 'petscii' ? toPetsciiCode(char) : char.charCodeAt(0)
    }

    getArrayBytes(payload, value) {
        const length = value.length
        let lengthKey = payload.length || 'length'
        let type = 'int8'
        if (lengthKey instanceof Object) {
            lengthKey = ('name' in lengthKey) ? lengthKey.name : 'length'
            if (payload.length.start && payload.length.end) {
                // check length
                const checkLength = this.args[payload.length.end] - this.args[payload.length.start] + 1
                if (length !== checkLength) {
                    throw new Error(`Expected ${this.payloadName(payload)} to be ${checkLength} bytes (from ${this.args[payload.length.start]} to ${this.args[payload.length.end]}), was ${length}`)
                }
            }
            type = payload.length.type || 'int8'
        }
        let abytes = []
        const lbytes = this.getIntBytes((type === 'int16' ? 16 : 8), length, { name: payload.name, type: 'length' })
        if (lengthKey && lengthKey !== '') {
            abytes.push(...lbytes)
        }
        abytes.push(...value)
        return abytes
    }

    getItemListBytes(payload, value) {
        if (!(value instanceof Array)) {
            throw new Error(`Expected array value for ${this.payloadName(payload)}`)
        }
        const count = value.length
        let countKey = payload.count || 'count'
        let type = 'int16'
        if (countKey instanceof Object) {
            countKey = ('name' in countKey) ? countKey.name : 'count'
            type = payload.count.type || 'int16'
        }
        let ibytes = []
        const cbytes = this.getIntBytes((type === 'int8' ? 8 : 16), count, { name: payload.name, type: 'count'})
        if (countKey && countKey !== '') {
            ibytes.push(...cbytes)
        }
        let index = 0
        for (const itemValue of value) {
            const ipayload = {
                name: payload.name, index,
                payload: payload.payload 
            }
            const pbytes = this.getPayloadBytes(ipayload, itemValue)
            ibytes.push(...pbytes)
            index += 1
        }
        return ibytes
    }

    getPayloadBytes(payload, value) {
        value = value || {}
        if (!value instanceof Object) {
            throw new Error(`Expected object value for ${this.payloadName(payload)}`)
        }
        let sizeKey = ''
        if (payload.payload instanceof Object) {
            sizeKey = payload.payload.size || ''
            payload.payload = payload.payload.payload // wow!
        }
        let pbytes = []
        for (let element of payload.payload) {
            if (!(element instanceof Object)) { element = { name: element, type: 'int8' } }
            const evalue = value[element.name]
            const bytes = this.getBytes(element, evalue)
            pbytes.push(...bytes)
        }
        if (sizeKey !== '') {
            let sizeType = 'int8'
            if (sizeKey instanceof Object) {
                sizeType = sizeKey.type || 'int8'
                sizeKey = sizeKey.size || 'size'
            }
            const sbytes = this.getIntBytes((sizeType === 'int16' ? 16 : 8), pbytes.length, { name: payload.name, type: 'size' })
            pbytes.unshift(...sbytes)
        }
        return pbytes
    }

    getBytes(payload, value, index) {
        if (value === null || value === undefined) {
            if (payload.default) {
                value = payload.default
            } else if (payload.required) {
                throw new Error(`Required value for ${this.payloadName(payload)}`)
            }
        }
        if (payload.required?.min && value < payload.required.min) {
            throw new Error(`Invalid value ${value} for ${this.payloadName(payload)}`)
        }
        value = (value === null || value === undefined) ? 0 : value
        let vbytes = []
        let type = payload.type || 'int8'
        switch (type) {
            case 'intbits':
                let bits = 0
                if (value instanceof Object) {
                    bits = value.bits || 8
                    value = value.value
                }
                if (bits === 0) {
                    bits = (value >= 256) ? 16 : 8
                }
                type = `int${bits}`
            case 'int8' :
            case 'addr' :
            case 'int16' :
            case 'int32' :
                vbytes = this.getIntBytes(typeBits[type], value, payload)
                break
            case 'string' :
            case 'petscii' : // NOTE: doing PETSCII later
                if (!this.isString(value)) {
                    throw new Error(`Expected ${this.payloadName(payload)} to be a string`)
                }
                const self = this
                value = [...value].map(char => self.getCharCode(char, type))
            case 'varray' :
                if (!(value instanceof Array)) {
                    throw new Error(`Expected ${this.payloadName(payload)} to be a value array`)
                }
                vbytes = this.getArrayBytes(payload, value)
                break
            case 'items' :
                vbytes = this.getItemListBytes(payload, value)
                break
            case 'payload' :
                vbytes = this.getPayloadBytes(payload, value)
                break
            default:
                throw new Error(`Unknown payload type ${type} for ${this.payloadName(payload)}`)
                break
        }
        return vbytes
    }

    requestId() {
        return this.request
    }

    commandByte() {
        return this.commandStruct.commandByte
    }

    responseByte() {
        return this.response
    }

    bytes() {
        return new Uint8Array(this.payloadBytes)
    }
}

export class ViceResponse {
    static responseCodes = {
        0x00: 'OK',
        0x01: 'Not Found',
        0x02: 'Invalid memSpace',
        0x80: 'Incorrect length',
        0x81: 'Invalid parameter',
        0x82: 'Invalid API version',
        0x83: 'Invalid command',
        0x84: 'General failure'
    }
    static responses = {
        'memget': {
            responseByte: 0x01,
            payload: [
                { name: 'length', type: 'int16' },
                { name: 'memory', type: 'varray' }
            ]
        },
        'memset': 0x02,
        'checkpoint': {
            responseByte: 0x11,
            payload: [
                { name: 'checkpoint', type: 'int32' },
                'currentlyHit', // boolean
                { name: 'startAddress', type: 'addr' },
                { name: 'endAddress', type: 'addr' },
                'stopWhenHit', // boolean
                'enabled', // boolean
                'operation', // checkpointOperations
                'temporary', // boolean
                { name: 'hitCount', type: 'int32' },
                { name: 'ignoreCount', type: 'int32' },
                'hasCondition', // boolean
                'memSpace', // memSpace
            ]
        },
        'chkdel': 0x13,
        'chklist': {
            responseByte: 0x14,
            payload: [
                { name: 'count', type: 'int32' }
            ]
        },
        'chkenable': 0x15,
        'chkcondition': 0x22,
        'registers': {
            responseByte: 0x31,
            payload: [
                { name: 'count', type: 'int16' },
                { name: 'values', type: 'items', payload: [
                    'size', // unit8
                    'register', // reference index from return of registers by 'inforeg'
                    { name: 'value', type: 'intbits', bits: { ref: 'size', minus: 1, multiply: 8 } } // either int8 or int16 depending on size - 1
                ] }
            ]
        },
        'execadv': 0x71,
        'execrts': 0x73,
        'execrun': 0xaa,
        'type': 0x72,
        'ping': 0x81,
        'infobanks': {
            responseByte: 0x82,
            payload: [
                { name: 'count', type: 'int16' },
                { name: 'banks', type: 'items', payload: [
                    'size', // int8
                    { name: 'bankId', type: 'int16' },
                    'length', // int8
                    { name: 'name', type: 'string' },
                ]}
            ]
        },
        'inforeg': {
            responseByte: 0x83,
            payload: [
                { name: 'count', type: 'int16' },
                { name: 'registers', type: 'items', payload: [
                    'size', // int8
                    'id', // int8
                    'bits', // int8 (size in bits)
                    'length', // int8
                    { name: 'name', type: 'string' }
                ] }
            ]
        },
        'infopalette': {
            responseByte: 0x91,
            payload: [
                { name: 'count', type: 'int16' },
                { name: 'colors', type: 'items', payload: [
                    'size', // int8 (always 3?)
                    'red', // int8
                    'green', // int8
                    'blue' // int8
                ]}
            ]
        },
        'infovice': {
            responseByte: 0x85,
            payload: [
                'vlength', // int8
                { name: 'version', type: 'varray', length: 'vlength' },
                'slength', // int8
                { name: 'svnrev', type: 'varray', length: 'slength' },
            ]
        },
        'quit': 0xbb,
        'reset': 0xcc,
        'invalid': 0x00,
        'jam': {
            responseByte: 0x61,
            payload: [ { name: 'pc', type: 'addr' } ]
        },
        'stopped': {
            responseByte: 0x62,
            payload: [ { name: 'pc', type: 'addr' } ]
        },
        'resumed': {
            responseByte: 0x63,
            payload: [ { name: 'pc', type: 'addr' } ]
        }
    }
    static {
        this.lookup = {}
        for (const k in this.responses) {
            let byte = this.responses[k]
            if (byte instanceof Object) { byte = byte.responseByte }
            this.lookup[byte] = k
        }
    }

    constructor(byteArray) {
        this.byteArray = new Uint8Array(byteArray)
        this.byteIndex = 0
        const stx = this.byteArray.at(this.byteIndex++)
        if (stx !== STX) { throw new Error(`Unrecognized stx: ${stx}`) }
        const ver = this.byteArray.at(this.byteIndex++)
        if (ver !== ViceAPIVersion) { throw new Error(`Unsupported API version: ${ver}`)}

        this.parsed = {}
        this.dataLength = this.parseInt(32)

        this.respByte = this.byteArray[this.byteIndex++]

        this.responseCode = ViceResponse.responseCodes[this.byteArray[this.byteIndex++].toString()]
        this.request = this.parseInt(32)

        this.responseName = ViceResponse.lookup[this.respByte]
        if (!this.responseName) { throw new Error(`Unknown response byte: ${this.respByte}`) }
        this.responseStructure = ViceResponse.responses[this.responseName]

        this.parseResponse(this.responseStructure.payload || [])
    }

    parseInt(bits) {
        const bytes = Math.floor(bits / 8) - 1
        let val = 0
        for (let byte = 0; byte <= bytes; byte++) {
            val = val + this.byteArray[this.byteIndex++] * 2**(byte*8)
        }
        return val
    }

    parseResponse(payload, parsed) {
        parsed = parsed || this.parsed
        for (let element of payload) {
            if (!(element instanceof Object)) { element = { name: element, type: 'int8'} }
            this.parseResponseElement(element, parsed)
        }
    }

    parseItemList(element, parsed) {
        const countKey = element.count || 'count'
        const count = parsed[countKey] || 0
        const subPayload = element.payload
        let itemsParsed = []
        for (let index = 0; index < count; index++) {
            let item = {}
            this.parseResponse(subPayload, item)
            itemsParsed.push(item)
        }
        parsed[element.name] = itemsParsed
    }

    parseResponseElement(element, parsed) {
        let type = element.type || 'int8'
        switch (type) {
            case 'intbits':
                let bits = element.bits || 8
                if (bits instanceof Object) {
                    bits = parsed[bits.ref]
                    bits -= element.bits.minus || 0
                    bits *= element.bits.multiply || 1
                }
                type = `int${bits}`
            case 'int8':
            case 'addr':
            case 'int16':
            case 'int32':
                parsed[element.name] = this.parseInt(typeBits[type])
                break
            case 'string':
            case 'varray':
                const lengthKey = element.length || 'length'
                const length = parsed[lengthKey] || 0
                let value = [ ...this.byteArray.subarray(this.byteIndex, this.byteIndex + length) ]
                this.byteIndex += length
                if (type === 'string') {
                    value = String.fromCharCode(...value)
                }
                parsed[element.name] = value
                break
            case 'items':
                this.parseItemList(element, parsed)
                break
            default:
                throw new Error(`Unknown type ${type} for ${element.name}`)
        }
    }

    requestId() {
        return this.request
    }

    length() {
        return this.dataLength
    }

    responseByte() {
        return this.respByte
    }

    type() {
        return this.responseName
    }

    status() {
        return this.responseCode
    }

    response() {
        return this.parsed
    }
}