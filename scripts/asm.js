

class Assembler {
    // addressing modes:
    //   implied - no parameter
    //   impliedA - A
    //   immediate - #<value> (8-bit signed int)
    //   absolute - <addr> (16-bit uint)
    //   zeropage - <addr8> (8-bit uint)
    //   absoluteIndexedX - <addr>,X
    //   absoluteIndexedY - <addr>,Y
    //   zeropageIndexedX - <addr8>,X
    //   zeropageIndexedY - <addr8>,Y
    //   indirect: (<addr>)
    //   indirectPreIndexed: (<addr8>,X)
    //   indirectPostIndexed: (<addr8>),Y
    //   relative - <addr> (but special case assembly to use relative signed int8 offset)

    static bytesPerAddressMode = {
        implied: 0,
        impliedA: 0,
        immediate: 1,
        absolute: 2,
        zeropage: 1,
        absoluteIndexedX: 2,
        absoluteIndexedY: 2,
        zeropageIndexedX: 1,
        zeropageIndexexY: 1,
        indirect: 2,
        indirectPreIndexed: 1,
        indirectPostIndexed: 1,
        relative: 1,
    }

    // opcode information from: https://www.masswerk.at/6502/6502_instruction_set.html
    static opcodes = {
        'ADC': {
            immediate:           0x69,
            absolute:            0x6D,
            zeropage:            0x65,
            absoluteIndexedX:    0x7D,
            absoluteIndexedY:    0x79,
            zeropageIndexedX:    0x75,
            indirectPreIndexed:  0x61,
            indirectPostIndexed: 0x71,
        },
        'AND': {
            immediate:           0x29,
            absolute:            0x2D,
            zeropage:            0x25,
            absoluteIndexedX:    0x3D,
            absoluteIndexedY:    0x39,
            zeropageIndexed:     0x35,
            indirectPreIndexed:  0x21,
            indirectPostIndexed: 0x31
        },
        'ASL': {
            impliedA:            0x0A,
            absolute:            0x06,
            zeropage:            0x16,
            absoluteIndexedX:    0x0E,
            zeropageIndexedX:    0x1E,
        },
        'BCC': {
            relative:            0x90,
        },
        'BCS': {
            relative:            0xB0,
        },
        'BEQ': {
            relative:            0xF0,
        },
        'BIT': {
            absolute:            0x24,
            zeropage:            0x2C,
        },
        'BMI': {
            relative:            0x30,
        },
        'BNE': {
            relative:            0xD0,
        },
        'BPL': {
            relative:            0x10,
        },
        'BRK': {
            implied:             0x00,
        },
        'BVC': {
            relative:            0x50,
        },
        'BVS': {
            relative:            0x70,
        },
        'CLC': {
            implied:             0x18,
        },
        'CLD': {
            implied:             0xD8,
        },
        'CLI': {
            implied:             0x58,
        },
        'CLV': {
            implied:             0xB8,
        },
        'CMP': {
            immediate:           0xC9,
            absolute:            0xCD,
            zeropage:            0xC5,
            absoluteIndexedX:    0xDD,
            absoluteIndexedY:    0xD9,
            zeropageIndexedX:    0xD5,
            indirectPreIndexed:  0xC1,
            indirectPostIndexed: 0xD1,
        },
        'CPX': {
            immediate:           0xE0,
            absolute:            0xEC,
            zeropage:            0xE4,
        },
        'CPY': {
            immediate:           0xC0,
            absolute:            0xCC,
            zeropage:            0xC4,
        },
        'DEC': {
            absolute:            0xCE,
            zeropage:            0xC6,
            absoluteIndexedX:    0xDE,
            zeropageIndexedX:    0xD6,
        },
        'DEX': {
            implied:             0xCA,
        },
        'DEY': {
            implied:             0x88,
        },
        'EOR': {
            immediate:           0x49,
            absolute:            0x4D,
            zeropage:            0x45,
            absoluteIndexedX:    0x5D,
            absoluteIndexedY:    0x59,
            zeropageIndexedX:    0x55,
            indirectPreIndexed:  0x41,
            indirectPostIndexed: 0x51,
        },
        'INC': {
            absolute:            0xEE,
            zeropage:            0xE6,
            absoluteIndexedX:    0xFE,
            zeropageIndexedX:    0xF6,
        },
        'INX': {
            implied:             0xE8,
        },
        'INY': {
            implied:             0xC8,
        },
        'JMP': {
            absolute:            0x4C,
            indirect:            0x6C,
        },
        'JSR': {
            absolute:            0x20,
        },
        'LDA': {
            immediate:           0xA9,
            absolute:            0xAD,
            zeropage:            0xA5,
            absoluteIndexedX:    0xBD,
            absoluteIndexedY:    0xB9,
            zeropageIndexedX:    0xB5,
            indirectPreIndexed:  0xA1,
            indirectPostIndexed: 0xB1,
        },
        'LDX': {
            immediate:           0xA2,
            absolute:            0xAE,
            zeropage:            0xA6,
            absoluteIndexedY:    0xBE,
            zeropageIndexedY:    0xB6,
        },
        'LDY': {
            immediate:           0xA0,
            absolute:            0xAC,
            zeropage:            0xA4,
            absoluteIndexedX:    0xBC,
            zeropageIndexedX:    0xB4,
        },
        'LSR': {
            impliedA:            0x4A,
            absolute:            0x4E,
            zeropage:            0x46,
            absoluteIndexedX:    0x5E,
            zeropageIndexedX:    0x56,
        },
        'NOP': {
            implied:             0xEA,
        },
        'ORA': {
            immediate:           0x09,
            absolute:            0x0D,
            zeropage:            0x05,
            absoluteIndexedX:    0x1D,
            absoluteIndexedY:    0x19,
            zeropageIndexedX:    0x15,
            indirectPreIndexed:  0x01,
            indirectPostIndexed: 0x11,
        },
        'PHA': {
            implied:             0x48,
        },
        'PHP': {
            implied:             0x08,
        },
        'PLA': {
            implied:             0x68,
        },
        'PLP': {
            implied:             0x28,
        },
        'ROL': {
            impliedA:            0x2A,
            absolute:            0x2E,
            zeropage:            0x26,
            absoluteIndexedX:    0x3E,
            zeropageIndexedX:    0x36,
        },
        'ROR': {
            impliedA:            0x6A,
            absolute:            0x6E,
            zeropage:            0x66,
            absoluteIndexedX:    0x7E,
            zeropageIndexedX:    0x76,
        },
        'RTI': {
            implied:             0x40,
        },
        'RTS': {
            implied:             0x60,
        },
        'SBC': {
            immediate:           0xE9,
            absolute:            0xED,
            zeropage:            0xE5,
            absoluteIndexedX:    0xFD,
            absoluteIndexedY:    0xF9,
            zeropageIndexedX:    0xF5,
            indirectPreIndexed:  0xE1,
            indirectPostIndexed: 0xF1,
        },
        'SEC': {
            implied:             0x38,
        },
        'SED': {
            implied:             0xF8,
        },
        'SEI': {
            implied:             0x78,
        },
        'STA': {
            absolute:            0x8D,
            zeropage:            0x85,
            absoluteIndexedX:    0x9D,
            absoluteIndexedY:    0x99,
            zeropageIndexedX:    0x95,
            indirectPreIndexed:  0x81,
            indirectPostIndexed: 0x91,
        },
        'STX': {
            absolute:            0x8E,
            zeropage:            0x86,
            absoluteIndexedY:    0x96,
        },
        'STY': {
            absolute:            0x8C,
            zeropage:            0x84,
            zeropageIndexedX:    0x94,
        },
        'TAX': {
            implied:             0xAA,
        },
        'TAY': {
            implied:             0xA8,
        },
        'TSX': {
            implied:             0xBA,
        },
        'TXA': {
            implied:             0x8A,
        },
        'TXS': {
            implied:             0x9A,
        },
        'TYA': {
            implied:             0x98,
        },
    }

    static pseudoCodes = {
        'BYTE' : {
            list: true,
            valueType: 'number',
            bits: 8,
            absolute: true
        },
        'WORD': {
            list: true,
            valueType: 'number',
            bits: 16,
            absolute: true
        },
        'INT8': {
            list: true,
            valueType: 'number',
            bits: 8,
        },
        'IN16': {
            list: true,
            valueType: 'number',
            bits: 16,
        },
        'RSTR': {
            valueType: 'string',
        },
        'ZSTR': {
            valueType: 'string'
        },
        'BLOK': {
            valueType: 'blok-params'
        },
        'EQUL': {
            valueType: 'macro'
        }
    }
    static pseudoCodeAliases = {
        'CHAR' : 'BYTE',
        'INT16': 'IN16',
        'BLOCK': 'BLOK',
        'EQU': 'EQUL',
        'EQUAL' : 'EQUL'
    }

    static MAX_LABEL_LENGTH = 16

    static {
        this.splitTokens = new RegExp(`([ \,\;\`\"])`)

        this.codeTokens = [
            ...Object.keys(this.opcodes),
            ...Object.keys(this.pseudoCodes),
            ...Object.keys(this.pseudoCodeAliases)
        ]

        this.MAX_PARAMS_LENGTH = this.MAX_LABEL_LENGTH * 2 + 5
    }

    constructor(assembly, options = {}) {
        this.originLabel = options.originLabel || 'START'
        // this.originAddress = options.originAddress // Deal with origin address later
        this.basicStartInsertLine = options.basicStartInsertLine || 0
        this.basicEndInsertLine = options.basicEndInsertLine || 9
        this.basicLineLength = options.basicLineLength || 80
        this.basicSys = options.basicSYS
        this.basicSysLine = options.basicSYSLine || 10

        this.hasErrors = false
        this.updateAssembly(assembly || '')
    }

    updateAssembly(assembly) {
        this.hasErrors = false
        this.lines = []
        this.labels = {}
        this.variables = {}
        this.basic = ''

        const lines = assembly.split('\n')
        this.lines = []
        this.labels = []
        for (let lineNo = 0; lineNo < lines.length; lineNo++) {
            const line = (lines[lineNo-1] || '').trim()
            if (line === '') { continue }
            const lineResults = this.parseLine(line)
            this.lines.push(lineResults)
            if (lineResults.errors.length > 0) {
                this.hasErrors = true
            }
        }

        if (!this.hasErrors) {
            this.assembleToRelocatable()
        }
    }

    parseLabel(parsedLine, errors) {
        if (!parsedLine.label) return
        if (parsedLine.label.startsWith('VAR:')) {
            if (parsedLine.parsedParam?.value) {
                errors.push('Variable labels cannot be used with EQUL')
                return
            }
            parsedLine.variable = parsedLine.label.substring(4)
            if (parsedLine.variable === '') {
                errors.push(`Invalid variable label: ${parsedLine.label}`)
                return
            }
            if (parsedLine.variable.length > 2) {
                parsedLine.variable = parsedLine.variable.substring(0, 2)
            }
            if (parsedLine.variable in this.variables) {
                errors.push(`Duplicate variable label: ${parsedLine.label}`)
                return
            }
            this.labels[ parsedLine.label ] = { label: parsedLine.label }
            this.variables[parsedLine.variable] = { variable: parsedLine.variable }
        } else {
            if (!/^[A-Z][A-Z0-9\_]*$/.test(parsedLine.label)) {
                errors.push(`Invalid label: ${parsedLine.label}`)
                return
            }
            if (parsedLine.label.length > Assembler.MAX_LABEL_LENGTH) {
                parsedLine.label = parsedLine.label.substring(0, Assembler.MAX_LABEL_LENGTH)
            }
            if (parsedLine.label in this.labels) {
                errors.push(`Duplicate label: ${parsedLine.label}`)
                return
            }
            this.labels[parsedLine.label] = { label: parsedLine.label }
        }
    }

    parseValue(value, obj, errors, options = {}) {
        options = { allowLabels: true, bits: 'assign', absolute: 'assign', ...options }
        if (value.startsWith('$')) {
            const hexValue = value.substring(1)
            if (!/^[0-9A-F]+$/.test(hexValue)) {
                errors.push(`Invalid hex value: ${value}`)
                return
            }
            obj.value = parseInt(hexValue, 16)
        } else if (/^[\-\+0-9]/.test(value)) {
            if (!/^[\-\+]?[0-9]+$/.test(value)) {
                errors.push(`Invalid decimal value: ${value}`)
                return
            }
            obj.value = parseInt(value)
        } else if (value.startsWith("'")) {
            if (!value.endsWith("'") || value.length !== 3) {
                errors.push(`Invalid char value: ${value}`)
                return
            }
            if (!(value[1] in Petscii.lookup)) {
                errors.push(`Invalid PETSCII char: ${value}`)
                return
            }
            obj.value = Petscii.lookup(value[1])
            obj.charValue = value[1]
        } else if (/^[A-Z]/.test(value)) {
            if (!options.allowLabels || !/^(VAR:)?[A-Z][A-Z0-9\_]+$/.test(value)) {
                errors.push(`Illegal value: ${value}`)
            }
            obj.label = value
            return
        }
        let min = -32768
        let max = 65535
        if (options.bits === 8) {
            min = -128
            max = 255
        }
        let halfMax = -min - 1
        if (options.absolute === true) {
            min = 0
        } else if (options.absolute === false) {
            max = halfMax
        }
        if (obj.value < min || obj.value > max) {
            errors.push(`Value out of range: ${value} [${min}, ${max}]`)
        }
        if (options.bits === 'assign') {
            if (obj.value < 0 && obj.value >= -128) {
                obj.bits = 8
            } else if (obj.value >= 0 && obj.value <= (obj.absolute === true ? 127 : 255)) {
                obj.bits = 8
            } else {
                obj.bits = 16
            }
        }
        if (options.absolute === 'assign') {
            if (obj.value < 0) {
                obj.absolute = false
            } else if (obj.value > halfMax) {
                obj.absolute = true
            }
        }
        return
    }

    parsePseudoCodeParam(paramLine, pseudoCode, errors) {
        const opcodeInfo = Assembler.pseudoCodes[pseudoCode]
        let value = paramLine.parameters
        let param = {}
        if (opcodeInfo.valueType === 'string') {
            if (value.startsWith('"')) {
                value = value.substring(1)
                if (value.endsWith('"')) {
                    value = value.substring(0, value.length - 1)
                }
                param.valueString = value
                param.valueType = 'number'
                param.list = true
                param.bits = 8
                param.absolute = true
                param.values = []
                for (let i = 0; i < value.length; i++) {
                    const char = value[i]
                    if (char in Petscii.lookup) {
                        param.values.push(Petscii.lookup[char])
                    } else {
                        errors.push(`Invalid character in string: ${char}`)
                        return
                    }
                }
                if (pseudoCode === 'ZSTR') {
                    param.values.push(0)
                }
            } else {
                errors.push(`Invalid string: ${value}`)
                return
            }
        } else if (opcodeInfo.valueType === 'blok-params') {
            // one value optional comma second value
            const split = value.split(',')
            if (split.length === 0) {
                errors.push('No parameters for BLOK')
                return
            }
            let blockParams = {}
            this.parseValue(split[0], blockParams, errors, { bits: 16, absolute: true, allowLabels: false })
            if (errors.length > 0) { return }
            param.list = true
            param.blockRepeat = blockParams.value
            param.blockValue = 0
            param.bits = 8
            param.absolute = true
            delete blockParams.value
            if (split.length > 1) {
                this.parseValue(split[1], blockParams, errors, { allowLabels: false, bits: 8 })
                if (errors.length > 0) { return }
                param.blockValue = blockParams.value
                paramLine.bits = blockParams.bits
                paramLine.absolute = blockParams.absolute
            }
            if (split.length > 2) {
                errors.push(`Too many parameters for BLOK: ${split.slice(2).join(',')}`)
                return
            }
            param.valueType = 'number'
            param.list = true
            param.values = Array.fill(param.blockRepeat, param.blockValue)
        } else if (opcodeInfo.valueType === 'macro') {
            if (!paramLine.label) {
                errors.push('Macro EQUL requires a label')
                return
            }
            this.parseValue(value, param, errors, { allowLabels: false, bits: 'assign', absolute: 'assign' })
            if (errors.length > 0) { return }
            this.labels[paramLine.label] = { label: paramLine.label, value: param.value, bits: param.bits, absolute: param.absolute }
        } else if (opcodeInfo.list) {
            const items = value.split(',')
            param.valueType = 'number'
            param.bits = opcodeInfo.bits
            param.absolute = opcodeInfo.absolute
            param.values = []
            param.list = true
            let absolute = opcodeInfo.absolute
            for (const item of items) {
                const listItem = {}
                this.parseValue(item, listItem, errors, { allowLabels: false, bits: opcodeInfo.bits, absolute: absolute })
                absolute = listItem.absolute
                if (errors.length > 0) { return }
                param.values.push(listItem.value)
            }
        }
        paramLine.parsedParam = param
    }

    parseCalculation(calculation, bits, absolute, param, errors) {
        const split = calculation.split(/([\+\-\&\%\!])/)
        let calc = []
        let state = 'operand'
        let negate = false
        let carryOver = ''
        for (let calcIndex = 0; calcIndex < split.length; calcIndex++) {
            let comp = split[calcIndex]
            if (comp === '-' && state === 'operand') {
                carryOver = comp
                carryOver = ''
                continue
            }
            comp = carryOver + comp
            if (comp === '!' && state === 'operand') {
                negate = true
                continue
            }
            if (comp === '!') {
                errors.push(`Unexpected not: ${calculation}`)
                return
            }
            if (state === 'operand') {
                let operand = { type: 'operand', negate }
                this.parseValue(comp, operand, errors, { bits, absolute })
                if (errors.length > 0) { return }
                calc.push(operand)
                state = 'operator'
                negate = false
                continue
            }
            if (comp === '+' || comp === '-' || comp === '&' || comp === '%') {
                if (state !== 'operator') {
                    errors.push(`Unexpected operator: ${comp}`)
                    return
                }
                calc.push({ type: 'operator', operator: comp })
                state = 'operand'
            }
        }
        if (calc.length === 0 || state === 'operand') {
            errors.push(`Invalid calculation: ${calculation}`)
        }
        param.calculation = calc
    }

    parseOpcodeParam(paramLine, opcode, errors) {
        const paramCode = paramLine.parameters || ''
        let param = {
            type: 'absolute',
            rawValue: paramCode,
            bits: 16,
            absolute: true
        }
        if (paramCode === '') {
            param.type = 'implied'
            param.bits = 0
        } else if (paramCode === 'A') {
            param.type = 'impliedA'
            param.bits = 0
        } else {
            let value = paramCode
            if (paramCode.startsWith('#')) {
                param.type = 'immediate'
                value = paramCode.substring(1)
                param.bits = 8
                param.absolute = false
            }
            if (paramCode.startsWith('(')) {
                param.type = 'indirect'
                const closeIndex = paramCode.indexOf(')')
                if (closeIndex < 0) {
                    errors.push(`Unclosed indirect parameter: ${paramCode}`)
                    return
                }
                value = paramCode.substring(1, closeIndex)
                if (param.value.endsWith(',X')) {
                    param.type = 'indirectPreIndexed'
                    value = value.substring(0, value.length - 2)
                    param.bits = 8
                } else if (paramCode.endsWith(',Y')) {
                    param.type = 'indirectPostIndexed'
                    param.bits = 8
                }
            } else if (paramCode.endsWith(',X') || paramCode.endsWith(',Y')) {
                param.type = 'absoluteIndexed' + paramCode.slice(-1)
                value = paramCode.substring(0, paramCode.length - 2)
            }
            if (param.type === 'absolute' && Assembler.opcodes[opcode]?.relative) {
                param.type = 'relative'
                param.absolute = false
                param.bits = 8
            }
            if (value.startsWith('@')) {
                if (param.type.indexOf('absolute') >= 0) {
                    param.type = param.type.replace('absolute', 'zeropage')
                    value = value.substring(1)
                    param.bit8 = true
                } else {
                    errors.push(`Invalid zeropage specifier: ${value}`)
                    return
                }
            } else if (value.startsWith('<') || value.startsWith('>')) {
                value = value.substring(1)
                param.takeByte = value[0] === '<' ? 'lo' : 'hi'
                param.bits = 8
            }
            if (value.startsWith('[')) {
                if (value.endsWith(']')) {
                    const calculation = value.substring(1, value.length - 1)
                    this.parseCalculation(calculation, param.bits, param.absolute, param, errors)
                } else {
                    errors.push(`Unclosed calculation: ${value}`)
                    return
                }
            } else {
                this.parseValue(value, param, errors, { bits: param.bits, absolute: param.absolute })
            }
        }
        const opcodeInfo = Assembler.opcodes[opcode]
        if (!(param.type in opcodeInfo)) {
            errors.push(`Invalid addressing mode for ${opcode}: ${param.type}`)
            return
        }
        paramLine.parsedParam = param
    }

    parseLine(code) {
        const split = code.split(Assembler.splitTokens)

        let parsedLine = {}
        let errors = []
        let halt = false
        let inString = false
        let state = 'opcode-or-label'
        for (let rawToken of split) {
            if (halt) { break }
            let token = rawToken.trim().toUpperCase()
            if (token === '' && !inString) continue
            if (token === '"') {
                if (state !== 'parameters') {
                    errors.push('Unexpected start of string')
                    halt = true
                    continue
                }
                inString = !inString
                token = rawToken
            }
            if (inString) { token = rawToken }
            let isOpcode = false
            isOpcode = (Assembler.codeTokens.indexOf(token) >= 0)
            if (token === ';' || token === '`') {
                state = 'comment'
                parsedLine.comment = ''
                continue        
            }
            switch (state) {
                case 'opcode-or-label' :
                    if (isOpcode) {
                        parsedLine.opcode = token
                        state = 'parameters'
                    } else {
                        parsedLine.label = token
                        state = 'opcode'
                    }
                    continue
                    break
                case 'opcode' : 
                    if (isOpcode) {
                        parsedLine.opcode = token
                        state = 'parameters'
                    } else {
                        errors.push('No opcode or pseudo-opcode given')
                        halt = true
                    }
                    continue
                    break
                case 'parameters' :
                    if (isOpcode) {
                        errors.push('Multiple opcodes')
                        halt = true
                    } else {
                        parsedLine.parameters = (parsedLine.parameters || '') + token
                    }
                    continue
                    break
                case 'comment' :
                    parsedLine.comment += rawToken + ' '
                    break
            }
        }
        this.parseLabel(parsedLine, errors)
        // clean up alternate pseudo opcodes
        if (parsedLine.opcode in Assembler.pseudoCodeAliases) {
            parsedLine.opcode = Assembler.pseudoCodeAliases[parsedLine.opcode]
        }
        if (parsedLine.opcode in Assembler.opcodes) {
            this.parseOpcodeParam(parsedLine, parsedLine.opcode, errors)
        } else if (parsedLine.opcode in Assembler.pseudoCodes) {
            if (parsedLine.opcode === 'EQUL') {
                if (!parsedLine.label) {
                    errors.push('EQUL must have a label')
                } else if (parsedLine.variable) {
                    errors.push('EQUL label cannot be a variable')
                }
            }
            this.parsePseudoCodeParam(parsedLine, parsedLine.opcode, errors)
        }
        console.log(parsedLine)
        if (errors.length > 0) {
            console.log(errors)
        }

        let cleanCodeLine = code
        if (errors.length === 0) {
            cleanCodeLine =  (parsedLine.label || '').padEnd(Assembler.MAX_LABEL_LENGTH + 2)
            cleanCodeLine += (parsedLine.opcode || '').padEnd(5)
            cleanCodeLine += (parsedLine.parameters || '').padEnd(Assembler.MAX_PARAMS_LENGTH)
            if ((parsedLine.parameters || '').length > Assembler.MAX_PARAMS_LENGTH) {
                cleanCodeLine += ' '
            }
            if (cleanCodeLine.trim() === '') { cleanCodeLine = '' }
            cleanCodeLine += (parsedLine.comment) ? '` '+parsedLine.comment : ''
        }

        return { parsedLine, errors, cleanCodeLine }
    }

    assembleValue(address, value, bits, errors) {
        if (value < 0) {
            value = (1 << (bits)) + value
        }
        if (bits === 8) {
            if (address < this.address) {
                this.assembledBytes[address] = value & 0xFF
            } else {
                this.assembledBytes.push(value & 0xFF)
            }
            address++
        } else if (bits === 16) {
            if (address < this.address) {
                this.assembledBytes[address] = value & 0xFF
                this.assembledBytes[address + 1] = (value >> 8) & 0xFF
            } else {
                this.assembledBytes.push(value & 0xFF)
                this.assembledBytes.push((value >> 8) & 0xFF)
            }
            address += 2
        }
        return address
    }

    assembleRelative(fromAddress, toAddress, label, errors) {
        const offset = (toAddress - (fromAddress + 1))
        if (offset < -128 || offset > 127) {
            this.errors.push(`Line ${lineNo+1}: relative address ${label} offset ${offset} outside range [-128, 127]`)
        } else {
            fromAddress = this.assembleValue(fromAddress, offset, 8, errors)
        }
        return fromAddress
    }

    getLabelValue(label, address, advanceBytes, addressMode) {
        let value = null
        if (this.labels[label].value !== undefined) {
            value = this.labels[label].value
        } else if (this.labels[label].address !== undefined) {
            value = this.labels[label].address
            if (addressMode !== 'relative') {
                this.labels[label].references.push({ address, bits: (advanceBytes === 1 ? 8 : 16), absolute: true })
            }
        } else {
            this.backfill[label] = this.backfill[label] || []
            this.backfill[label].push({
                label,
                insertAddress: address,
                bits: (advanceBytes === 1 ? 8 : 16),
                relative: (addressMode === 'relative')
            })
        }
        return value
    }

    getCalculationValue(calculation, address, advanceBytes) {
        let value = null
        // TODO

        return value
    }

    assembleToRelocatable() {
        if (this.hasErrors) { return }
        this.assembledBytes = []
        this.address = 0
        this.backfill = {}
        this.errors = []

        for (let lineNo = 0; lineNo < this.lines.length; lineNo++) {
            const line = this.lines[lineNo]
            const parsedLine = line.parsedLine
            const param = parsedLine.parsedParam

            if (parsedLine.label && !this.labels[parsedLine.label].value) {
                // NOTE: if label has a value, it is a "macro" assigned by EQUL
                this.labels[parsedLine.label] = { label: parsedLine.label, address: this.address, bits: 16, absolute: true, references: [] }
                if (parsedLine.variable) {
                    this.variables[parsedLine.variable] = { variable: parsedLine.variable, address: this.address }
                }
                if (this.backfill[parsedLine.label]) {
                    for (let backfillIdx = 0; backfillIdx < this.backfill[parsedLine.label].length; backfillIdx++) {
                        const backfillEntry = this.backfill[parsedLine.label][backfillIdx]
                        if (backfillEntry.relative) {
                            this.assembleRelative(backfillEntry.insertAddress, this.address, parsedLine.label, this.errors)
                            this.backfill[parsedLine.label].splice(backfillIdx, 1)
                        } else {
                            this.labels[parsedLine.label].references.push({ address: backfillEntry.insertAddress, bits: backfillEntry.bits, absolute: true })
                            this.assembleValue(backfillEntry.insertAddress, this.address, backfillEntry.bits, this.errors)
                        }
                    }
                }
            }

            if (parsedLine.opcode in Assembler.pseudoCodes) {
                if (param.list) {
                    for (const value of param.values) {
                       this.address = this.assembleValue(this.address, value, param.bits, this.errors)
                    }
                }
            } else if (parsedLine.opcode in Assembler.opcodes) {
                const opcodeInfo = Assembler.opcodes[parsedLine.opcode]
                this.assembledBytes.push(opcodeInfo[param.type])
                this.address++

                const advanceBytes = Assembler.bytesPerAddressMode[param.type]
                if (advanceBytes === 0) { continue }

                let value = null
                if (param.label) {
                    value = this.getLabelValue(param.label, this.address, advanceBytes, param.type)
                } else if (param.calculation) {
                    value = this.getCalculationValue(param.calculation, this.address, advanceBytes)
                } else {
                    value = param.value
                }
                // if no assigned value
                if (value === undefined || value === null) {
                    for (let b = 0; b < advanceBytes; b++) {
                        this.assembledBytes.push(256)
                    }
                    this.address += advanceBytes
                    continue 
                }
                switch (param.type) {
                    case 'zeropage' :
                    case 'zeropageIndexedX' :
                    case 'zeropageIndexedY' :
                    case 'indirectPreIndexed' :
                    case 'indirectPostIndexed' :
                    case 'immediate' :
                        this.address = this.assembleValue(this.address, value, 8, this.errors)
                        break
                    case 'absolute' :
                    case 'absoluteIndexedX' :
                    case 'absoluteIndexedY' :
                    case 'indirect' :
                        this.address = this.assembleValue(this.address, value, 16, this.errors)
                        break
                    case 'relative' :
                        this.address = this.assembleRelative(this.address, value, 8, this.errors)
                        break
                    default :
                        // TODO
                        break
                }
            }
        }
        if (this.errors.length === 0) {
            this.generateBasic()
        } else {
            this.hasErrors = true
        }
    }

    generateBasic(addressOffset = 0) {
        this.basic = ''
        let basicLineNo = this.basicStartInsertLine
        let basicLine = ''
        for (const varName in this.variables) {
            const variable = this.variables[varName]
            if (variable.address === undefined) { continue }
            if (basicLine === '') {
                basicLine += `${basicLineNo} `
            } else if (basicLine.length > (this.basicLineLength - 10)) {
                this.basic += basicLine + '\n'
                basicLineNo += 1
                if (basicLineNo > this.basicEndInsertLine) {
                    this.errors.push('Not enough BASIC lines to insert variable definitions')
                    return
                }
                basicLine = `${basicLineNo} `
            } else {
                basicLine += ':'
            }
            basicLine += `${varName}=${(variable.address + addressOffset).toString().padStart(5, ' ')}`
        }
        if (basicLine !== '') {
            this.basic += basicLine + '\n'
        }
        if (this.basicSys) {
            if (this.basicSysLine >= this.basicStartInsertLine && this.basicSysLine <= basicLineNo) {
                this.errors.push('BASIC SYS line conflicts with variable definition lines')
                return
            }
            if (!this.originLabel in this.labels) {
                this.errors.push(`Origin label (${this.originLabel}) not found`)
                return
            }
            if (!this.labels[this.originLabel].address) {
                this.errors.push(`Origin label (${this.originLabel}) has no address`)
                return
            }
            const sysAddress = this.labels[this.originLabel].address // no address offset since the label address is already relocated
            this.basic  += `${this.basicSysLine} SYS ${sysAddress.toString().padStart(5, ' ')}\n`
        }
        if (this.errors.length > 0) {
            this.hasErrors = true
        }
    }

    relocateTo(startAddress) {
        for (const labelName in this.labels) {
            const label = this.labels[labelName]
            if (label.address === undefined) { continue }
            label.address += startAddress
            for (const ref of label.references) {
                this.assembleValue(ref.address, label.address, 16, this.errors)
            }
        }
    }

    dumpBytes(offset = 0, bytes) {
        if (bytes === undefined) {
            bytes = this.assembledBytes
        }
        for (let i = 0; i < bytes.length; i++) {
            console.log(`Byte ${(i+offset).toString(16).toUpperCase().padStart(4,'0')}: ${bytes[i].toString(16).toUpperCase().padStart(2,'0')}`)
        }
    }
}

window.addEventListener('load', () => {
    const code = `
    HELLO   ZSTR "HELLO, WORLD!"
    CHROUT  EQUL $FFD2
    PLOT    EQUL $FFF0
    START   LDX #$00
            LDY #$00
            JSR PLOT
            LDX #$00
    LOOP    LDA HELLO, X
            BEQ DONE
            JSR CHROUT
            INX
            JMP LOOP
    DONE    RTS
    `

    const assembler = new Assembler(code, { basicSYS: true })
//    waitForEditor(assembler)
})

function waitForEditor(assembler) {
    if (window.editor) {
        window.editor.setProgram(assembler.basic)
        const startAddress = FileControls.programStartAddress['c128']
        let basicBytes = window.editor.getProgramBytes(startAddress)
        basicBytes = basicBytes.slice(2)
        const offset = startAddress + basicBytes.length
        assembler.relocateTo(offset)
        assembler.generateBasic(offset)

        window.editor.setProgram(assembler.basic)
        basicBytes = window.editor.getProgramBytes(startAddress)
        basicBytes = basicBytes.slice(2)
        assembler.dumpBytes(startAddress, basicBytes)
        assembler.dumpBytes(offset)
    } else {
        setTimeout(() => waitForEditor(assembler), 100)
    }
}
