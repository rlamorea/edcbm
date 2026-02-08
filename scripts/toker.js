
// BASIC Tokens https://www.c64-wiki.com/wiki/BASIC_token
    
class Tokenizer {
    static maximumLineNumber = 63999
    static maxLineLength = {
        'v2': 80,
        'v4': 80,
        'v4+': 160,
        'v3.5': 160,
        'v7': 160,
    }

    static reserved = {
        'v2': [ 'ST', 'TI', 'TI$' ],
        'v3.5': [ 'DS', 'DS$', 'EL', 'ER' ],
        'v4': [ 'DS', 'DS$' ],
        'v4+': [ 'EL' ],
    }
    static noKeywords = [ '+', '-', '*', '/', '^', 'AND', 'OR', '>', '=', '<' ]

    static tokensMap = {
        'v2' : {
            0x80: 'END',
            0x81: 'FOR',
            0x82: 'NEXT',
            0x83: 'DATA',
            0x84: 'INPUT#',
            0x85: 'INPUT',
            0x86: 'DIM',
            0x87: 'READ',
            0x88: 'LET',
            0x89: 'GOTO',
            0x8A: 'RUN',
            0x8B: 'IF',
            0x8C: 'RESTORE',
            0x8D: 'GOSUB',
            0x8E: 'RETURN',
            0x8F: 'REM',
            0x90: 'STOP',
            0x91: 'ON',
            0x92: 'WAIT',
            0x93: 'LOAD',
            0x94: 'SAVE',
            0x95: 'VERIFY',
            0x96: 'DEF',
            0x97: 'POKE',
            0x98: 'PRINT#',
            0x99: 'PRINT',
            0x9A: 'CONT',
            0x9B: 'LIST',
            0x9C: 'CLR',
            0x9D: 'CMD',
            0x9E: 'SYS',
            0x9F: 'OPEN',
            0xA0: 'CLOSE',
            0xA1: 'GET',
            0xA2: 'NEW',
            0xA3: 'TAB(',
            0xA4: 'TO',
            0xA5: 'FN',
            0xA6: 'SPC(',
            0xA7: 'THEN',
            0xA8: 'NOT',
            0xA9: 'STEP',
            0xAA: '+',
            0xAB: '-',
            0xAC: '*',
            0xAD: '/',
            0xAE: '^', // up arrow
            0xAF: 'AND',
            0xB0: 'OR',
            0xB1: '>',
            0xB2: '=',
            0xB3: '<',
            0xB4: 'SGN',
            0xB5: 'INT',
            0xB6: 'ABS',
            0xB7: 'USR',
            0xB8: 'FRE',
            0xB9: 'POS',
            0xBA: 'SQR',
            0xBB: 'RND',
            0xBC: 'LOG',
            0xBD: 'EXP',
            0xBE: 'COS',
            0xBF: 'SIN',
            0xC0: 'TAN',
            0xC1: 'ATN',
            0xC2: 'PEEK',
            0xC3: 'LEN',
            0xC4: 'STR$',
            0xC5: 'VAL',
            0xC6: 'ASC',
            0xC7: 'CHR$',
            0xC8: 'LEFT$',
            0xC9: 'RIGHT$',
            0xCA: 'MID$',
            0xCB: 'GO'
        },
        'v4': {
            0xCC: 'CONCAT',
            0xCD: 'DOPEN',
            0xCE: 'DCLOSE',
            0xCF: 'RECORD',
            0xD0: 'HEADER',
            0xD1: 'COLLECT',
            0xD2: 'BACKUP',
            0xD3: 'COPY',
            0xD4: 'APPEND',
            0xD5: 'DSAVE',
            0xD6: 'DLOAD',
            0xD7: 'CATALOG',
            0xD8: 'RENAME',
            0xD9: 'SCRATCH',
            0xDA: 'DIRECTORY',
        },
        'v4+': {
            0xDB: 'DCLEAR',
            0xDC: 'BANK',
            0xDD: 'BLOAD',
            0xDE: 'BSAVE',
            0xDF: 'KEY',
            0xE0: 'DELETE',
            0xE1: 'ELSE',
            0xE2: 'TRAP',
            0xE3: 'RESUME',
            0xE4: 'DISPOSE',
            0xE5: 'PUDEF',
            0xE6: 'USING',
            0xE7: 'ERR$',
            0xE8: 'INSTR',
        },
        'v3.5': {
            0xCC: 'RGR',
            0xCD: 'RCLR',
            0xCE: 'RLUM',
            0xCF: 'JOY',
            0xD0: 'RDOT',
            0xD1: 'DEC',
            0xD2: 'HEX$',
            0xD3: 'ERR$',
            0xD4: 'INSTR',
            0xD5: 'ELSE',
            0xD6: 'RESUME',
            0xD7: 'TRAP',
            0xD8: 'TRON',
            0xD9: 'TROFF',
            0xDA: 'SOUND',
            0xDB: 'VOL',
            0xDC: 'AUTO',
            0xDD: 'PUDEF',
            0xDE: 'GRAPHIC',
            0xDF: 'PAINT',
            0xE0: 'CHAR',
            0xE1: 'BOX',
            0xE2: 'CIRCLE',
            0xE3: 'GSHAPE',
            0xE4: 'SSHAPE',
            0xE5: 'DRAW',
            0xE6: 'LOCATE',
            0xE7: 'COLOR',
            0xE8: 'SCNCLR',
            0xE9: 'SCALE',
            0xEA: 'HELP',
            0xEB: 'DO',
            0xEC: 'LOOP',
            0xED: 'EXIT',
            0xEE: 'DIRECTORY',
            0xEF: 'DSAVE',
            0xF0: 'DLOAD',
            0xF1: 'HEADER',
            0xF2: 'SCRATCH',
            0xF3: 'COLLECT',
            0xF4: 'COPY',
            0xF5: 'RENAME',
            0xF6: 'BACKUP',
            0xF7: 'DELETE',
            0xF8: 'RENUMBER',
            0xF9: 'KEY',
            0xFA: 'MONITOR',
            0xFB: 'USING',
            0xFC: 'UNTIL',
            0xFD: 'WHILE',
        },
        'v7': {
            0xCE: {  
                0x02: 'POT',
                0x03: 'BUMP',
                0x04: 'PEN',
                0x05: 'RSPPOS',
                0x06: 'RSPRITE',
                0x07: 'RSPCOLOR',
                0x08: 'XOR',
                0x09: 'RWINDOW',
                0x0A: 'POINTER'
            },
            0xFE: {  
                0x02: 'BANK',
                0x03: 'FILTER',
                0x04: 'PLAY',
                0x05: 'TEMPO',
                0x06: 'MOVSPR',
                0x07: 'SPRITE',
                0x08: 'SPRCOLOR',
                0x09: 'RREG',
                0x0A: 'ENVELOPE',
                0x0B: 'SLEEP',
                0x0C: 'CATALOG',
                0x0D: 'DOPEN',
                0x0E: 'APPEND',
                0x0F: 'DCLOSE',
                0x10: 'BSAVE',
                0x11: 'BLOAD',
                0x12: 'RECORD',
                0x13: 'CONCAT',
                0x14: 'DVERIFY',
                0x15: 'DCLEAR',
                0x16: 'SPRSAV',
                0x17: 'COLLISION',
                0x18: 'BEGIN',
                0x19: 'BEND',
                0x1A: 'WINDOW',
                0x1B: 'BOOT',
                0x1C: 'WIDTH',
                0x1D: 'SPRDEF',
                0x1E: 'QUIT',
                0x1F: 'STASH',
                0x21: 'FETCH',
                0x23: 'SWAP',
                0x24: 'OFF',
                0x25: 'FAST',
                0x26: 'SLOW'
            }
        }
    }

    static lineNumberTokens = {
        'v2': [ 'GOTO', 'GO TO', 'GOSUB', 'THEN' ],
        'v4+': [ 'RESTORE', 'RESUME' ],
    }
    static keywordPetscii = {
        ...Petscii.coreTable_Sym,
        ...Petscii.coreTable_UC
    }
    static {
        this.reserved['v3.5'] = [ ...this.reserved['v2'], ...this.reserved['v3.5'] ]
        this.reserved['v4'] = [ ...this.reserved['v2'], ...this.reserved['v4'] ]
        this.reserved['v4+'] = [ ...this.reserved['v4'], ...this.reserved['v4+'] ]
        this.reserved['v7'] = [ ...this.reserved['v3.5'] ]

        this.tokensMap['v4'] = { ...this.tokensMap['v2'], ...this.tokensMap['v4'] }
        this.tokensMap['v4+'] = { ...this.tokensMap['v4'], ...this.tokensMap['v4+'] }
        this.tokensMap['v3.5'] = { ...this.tokensMap['v2'], ...this.tokensMap['v3.5'] }
        this.tokensMap['v7'] = { ...this.tokensMap['v3.5'], ...this.tokensMap['v7'] }
        this.tokenLookup = {}
        this.tokenRegex = {}
        this.keywordRegex = {}

        this.keywords = {}
        for (const version in this.tokensMap) {
            let lookup = {}
            for (const code in this.tokensMap[version]) {
                const token = this.tokensMap[version][code]
                if (token instanceof Object) {
                    for (const subcode in token) {
                        const realToken = token[subcode]
                        lookup[realToken] = [ parseInt(code), parseInt(subcode) ]
                    }
                } else {
                    lookup[token] = parseInt(code)
                }
            }
            this.tokenLookup[version] = lookup
            let keywords = Object.keys(lookup).filter( (k) => {
                return (!this.noKeywords.includes(k) && !this.reserved[version].includes(k))
            })
            keywords = keywords.map( (k) => {
                k = k.replace(/\(/, '')
                k = k.replace(/\$/, '\\$')
                return k
            })
            this.keywords[version] = [ ...keywords ]

            this.keywordRegex[version] = `(${this.keywords[version].join('|')})`

            this.tokenLookup[version] = lookup
            const tokenList = Object.keys(lookup).map((t) => t.replace(/([\(\$\+\-\*\^\/\=\<\>])/, '\\$1'))
            this.tokenRegex[version] = `(${tokenList.join('|')})`
        }

        this.lineNumberTokens['v4+'] = [ ...this.lineNumberTokens['v2'], ...this.lineNumberTokens['v4+'] ]
        this.lineNumberTokens['v3.5'] = [ ...this.lineNumberTokens['v4+'] ]
        this.lineNumberTokens['v7'] = [ ...this.lineNumberTokens['v3.5'] ]

        this.keywordPetscii[0x5E] = '^' // replace special char with standard one
        this.keywordPetsciiLookup = Object.fromEntries( Object.entries(this.keywordPetscii).map(([k,v]) => [v,parseInt(k)]) )
    }

    constructor() {
    }

    setMachine(machine) {
        this.machine = machine
        this.setVersion(machine.language)
    }

    setVersion(newVersion) {
        if (newVersion === this.version) { return }
        this.version = newVersion
        this.tokensMap = Tokenizer.tokensMap[this.version]
        this.tokenLookup = Tokenizer.tokenLookup[this.version]
        this.tokenRegex = new RegExp(Tokenizer.tokenRegex[this.version], 'g')
        this.maxLineLength = Tokenizer.maxLineLength[this.version]
        this.lineNumberTokens = Tokenizer.lineNumberTokens[this.version]
        this.keywords = Tokenizer.keywords[this.version]
    }

    detokenize(byte, nextByte) {
        let mapped = this.tokensMap[byte] || window.petscii.table[byte] || `{${byte}}`
        let count = 1
        if (mapped instanceof Object && nextByte) {
            mapped = mapped[nextByte] || `{${byte}+${nextByte}}`
            count = 2
        }
        return { mapped, count }
    }

    detokenizeLine(bytes) {
        let line = ''
        let inQuotes = false
        for (let byteIndex = 0; byteIndex < bytes.length; byteIndex++) {
            const byte = bytes[byteIndex]
            const nextByte = byteIndex < bytes.length ? bytes[byteIndex+1] : null
            if (byte === 34) { inQuotes = !inQuotes }
            if (inQuotes) {
                line += this.shiftFont(Petscii.table[byte]) || `{${byte}}`
            } else {
                const { mapped, count } = this.detokenize(byte, nextByte)
                byteIndex += count-1
            }
        }
        return line
    }

    trimLine(line, lineIdx = 0) {
        let idx = 0
        while(line[idx] === ' ') {
            line = line.substring(1)
            idx += 1
        }
        lineIdx += idx
        return { line, lineIdx }
    }

    addVariable(variables, varName, varStart) {
        if (varName) {
            variables[varName] = variables[varName] || []
            variables[varName].push(varStart)
        }
        varName = null
        varStart = 0
        return { varName, varStart }
    }

    tokenizeLine(origLine) {
        let inQuote = false
        let inData = false
        let variables = {}
        let { line, lineIdx } = this.trimLine(origLine)
        const specialCommentIndex = line.indexOf('`')
        let specialComment = null
        if (specialCommentIndex >= 0) {
            specialComment = line.substring(specialCommentIndex + 1)
            line = line.substring(0, specialCommentIndex).trim()
        }
        if (line.length === 0) {
            return { byteArray: [], variables, specialComment }
        }

        let lineNumber = line.match(/^(\d+)/)
        if (lineNumber && lineNumber.length === 2) {
            lineNumber = lineNumber[1]
            line = line.substring(lineNumber.length)
            lineIdx += lineNumber.length
            ;({ line, lineIdx } = this.trimLine(line, lineIdx))
            lineNumber = parseInt(lineNumber)
        } else {
            return { byteArray: [], variables, specialComment }
        }
        if (lineNumber > Tokenizer.maximumLineNumber) { 
            return { byteArray: [], variables, specialComment }
        }

        const hiByte = Math.floor(lineNumber / 256)
        const loByte = lineNumber - hiByte * 256
        let tokenBytes = [ loByte, hiByte ]

        // convert the string to PETSCII codes, convert any "common Petscii" to letters/symbols for further parsing
        let petsciiLine = ''
        for (const char of line) {
            let petscii = window.petscii.lookup[char]
            if (petscii == null) {
                console.log('tokenizing', char, '(\\u', char.codePointAt(0).toString(16), ' not found')
                continue
            } else if (petscii >= 0x20 && petscii <= 0x5f) {
                petsciiLine += Tokenizer.keywordPetscii[petscii]
            } else {
                petsciiLine += String.fromCodePoint(petscii)
            }
        }

        // parse the line by key separators
        let varName = null
        let varStart = 0
        for (let linesplit of petsciiLine.split(/("|:|DATA)/)) {
            if (linesplit === '"') {
``               ;({ varName, varStart} = this.addVariable(variables, varName, varStart))
                inQuote = !inQuote
                tokenBytes.push(0x22) // '"'
                lineIdx += 1
                continue
            } else if (linesplit === ':') {
                inData = false
                ;({ varName, varStart } = this.addVariable(variables, varName, varStart))
                tokenBytes.push(0x3A) // ':'
                lineIdx += 1
                continue
            } else if (linesplit === 'DATA') {
                inData = true
                ;({ varName, varStart } = this.addVariable(variables, varName, varStart))
                tokenBytes.push(0x83) // DATA
                lineIdx += 4
                continue
            }
            let lineTokens = (inQuote || inData) ? [] : linesplit.match(this.tokenRegex)
            let nextToken = (lineTokens && lineTokens.length > 0) ? lineTokens.shift() : null
            while (linesplit.length > 0) {
                if (nextToken && linesplit.startsWith(nextToken)) {
                    ;({ varName, varStart } = this.addVariable(variables, varName, varStart))
                    const tok = this.tokenLookup[nextToken]
                    if (tok instanceof Array) {
                        tokenBytes.push(...tok)
                    } else {
                        tokenBytes.push(tok)
                    }
                    linesplit = linesplit.substring(nextToken.length)
                    lineIdx += nextToken.length
                    if (this.lineNumberTokens.includes(nextToken)) {
                        let lineNo = linesplit.match(/^ *(\d+)/)
                        if (lineNo && lineNo.length === 2) {
                            const lno = parseInt(lineNo[1])
                            const idx = lineIdx + (lineNo[0].length - lineNo[1].length)
                            this.addVariable(variables, lno, idx)
                        }
                    }
                    nextToken = (lineTokens.length > 0) ? lineTokens.shift() : null
                } else {
                    let char = linesplit[0]
                    if (!inQuote && !varName && /[A-Z]/.test(char)) {
                        varName = char
                        varStart = lineIdx
                    } else if (varName && /[A-Z0-9]/.test(char)) {
                        varName += char
                    } else if (varName && (char === '$' || char === '%')) {
                        varName += char
                        if (linesplit.length <= 1 || linesplit[1] !== '(') {
                            ;({ varName, varStart } = this.addVariable(variables, varName, varStart))
                        }
                    } else if (varName && char === '(') {
                        varName += char
                        ;({ varName, varStart } = this.addVariable(variables, varName, varStart))
                    } else if (varName) {
                        ;({ varName, varStart } = this.addVariable(variables, varName, varStart))
                    }
                    linesplit = linesplit.substring(1)
                    const petsciiChar = window.petscii.lookup[char] ?? char.codePointAt(0)
                    tokenBytes.push(petsciiChar)
                    lineIdx += 1
                }
            }
        }
        if (varName) { this.addVariable(variables, varName, varStart) }

        const byteArray = new Uint8Array(tokenBytes.length)
        for (let i = 0; i < tokenBytes.length; i++) {
            byteArray[i] = parseInt(tokenBytes[i])
        }

        return { byteArray, lineNumber, variables, specialComment }
    }
}

window.addEventListener('load', () => {
    window.tokenizer = new Tokenizer()
})