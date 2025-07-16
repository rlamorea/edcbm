class Assembler {
    static opcodes = {
        'ADC': 0x01,
        'AND': 0x02,
        'ASL': 0x03,
        'BCC': 0x04,
        'BCS': 0x05,
        'BEQ': 0x06,
        'BIT': 0x07,
        'BMI': 0x08,
        'BNE': 0x09,
        'BPL': 0x0A,
        'BRK': 0x0B,
        'BVC': 0x0C,
        'BVS': 0x0D,
        'CLC': 0x0E,    
        'CLD': 0x0F,
        'CLI': 0x10,
        'CLV': 0x11,
        'CMP': 0x12,
        'CPX': 0x13,
        'CPY': 0x14,
        'DEC': 0x15,
        'DEX': 0x16,
        'DEY': 0x17,
        'EOR': 0x18,
        'INC': 0x19,
        'INX': 0x1A,
        'INY': 0x1B,
        'JMP': 0x1C,
        'JSR': 0x1D,
        'LDA': 0x1E,
        'LDX': 0x1F,
        'LDY': 0x20,
        'LSR': 0x21,
        'NOP': 0x22,
        'ORA': 0x23,
        'PHA': 0x24,
        'PHP': 0x25,
        'PLA': 0x26,
        'PLP': 0x27,
        'ROL': 0x28,
        'ROR': 0x29,
        'RTI': 0x2A,
        'RTS': 0x2B,
        'SBC': 0x2C,
        'SEC': 0x2D,
        'SED': 0x2E,
        'SEI': 0x2F,
        'STA': 0x30,
        'STX': 0x31,
        'STY': 0x32,
        'TAX': 0x33,
        'TAY': 0x34,
        'TSX': 0x35,
        'TXA': 0x36,
        'TXS': 0x37,
        'TYA': 0x38,
    }
    static directives = {
        'BYTE': 0x00,
        'WORD': 0x01,
        'INT8': 0x02,
        'IN16': 0x03,
        'CHAR': 0x04,
        'RSTR': 0x05,
        'ZSTR': 0x06,
        'BLOK': 0x07,
        'EQUL': 0x08,
    }
    static {
        this.lineParseRegex = new RegExp('^(VAR:)?([A-Z0-9]+)? *(' + [ ...this.opcodes.keys(), ..this.directives.keys() ].join('|') + ')(.*)')
    }

    constructor(code, previousLineNumber = 0) {
        this.lineNumber = previousLineNumber + 10
        this.code = []
        this.macros = {}
        this.labels = {}

        this.errors = []

        this.parseCode(code)
    }

    parseCode(code) {
        const lines = code.split('\n')
        let cleanedCode = ''
        let lineOffset = 0
        for (let line of lines) {
            lineOffset += 1
            line = line.trim()
            if (line.length === 0) {
                cleanedCode += '`\n'
                continue
            }
            if (!line.startsWith('`')) {
                this.errors.push({ offset: lineOffset, message: 'Invalid ASM line' })
                continue
            }
            if (line.startsWith('`REM')) {
                cleanedCode += line + '\n'
                continue
            }
            line = line.substring(1).trim()
            const breakdown = line.match(Assembler.lineParseRegex)
            if (!breakdown) {
                this.errors.push({ offset: lineOffset, message: 'Invalid ASM line format' })
                continue
            }
            let label = ''
            if (breakdown[1]) {
                label += 'VAR:'
                if (!breakdown[2]) {
                    this.errors.push({ offset: lineOffset, message: 'Invalid VAR label' })
                    continue
                }
            }
            if (breakdown[2]) {
                label += breakdown[2]
            }
        }
    }
}
