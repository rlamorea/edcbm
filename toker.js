
// BASIC Tokens https://www.c64-wiki.com/wiki/BASIC_token
    
class Tokenizer {
    static maximumLineNumber = 63999
    static maxLineLength = {
        'v2': 80,
        'v7': 160
    }

    static tokensMap = {
        'v2' : {
            128: 'END',
            129: 'FOR',
            130: 'NEXT',
            131: 'DATA',
            132: 'INPUT#',
            133: 'INPUT',
            134: 'DIM',
            135: 'READ',
            136: 'LET',
            137: 'GOTO',
            138: 'RUN',
            139: 'IF',
            140: 'RESTORE',
            141: 'GOSUB',
            142: 'RETURN',
            143: 'REM',
            144: 'STOP',
            145: 'ON',
            146: 'WAIT',
            147: 'LOAD',
            148: 'SAVE',
            149: 'VERIFY',
            150: 'DEF',
            151: 'POKE',
            152: 'PRINT#',
            153: 'PRINT',
            154: 'CONT',
            155: 'LIST',
            156: 'CLR',
            157: 'CMD',
            158: 'SYS',
            159: 'OPEN',
            160: 'CLOSE',
            161: 'GET',
            162: 'NEW',
            163: 'TAB(',
            164: 'TO',
            165: 'FN',
            166: 'SPC(',
            167: 'THEN',
            168: 'NOT',
            169: 'STEP',
            170: '+',
            171: '-',
            172: '*',
            173: '/',
            174: '\uE01E',
            175: 'AND',
            176: 'OR',
            177: '>',
            178: '=',
            179: '<',
            180: 'SGN',
            181: 'INT',
            182: 'ABS',
            183: 'USR',
            184: 'FRE',
            185: 'POS',
            186: 'SQR',
            187: 'RND',
            188: 'LOG',
            189: 'EXP',
            190: 'COS',
            191: 'SIN',
            192: 'TAN',
            193: 'ATN',
            194: 'PEEK',
            195: 'LEN',
            196: 'STR$',
            197: 'VAL',
            198: 'ASC',
            199: 'CHR$',
            200: 'LEFT$',
            201: 'RIGHT$',
            202: 'MID$',
            203: 'GO'
        },
        'v7': {
            204: 'RGR',
            205: 'RCLR',
            206: {  
                2: 'POT',
                3: 'BUMP',
                4: 'PEN',
                5: 'RSPPOS',
                6: 'RSPRITE',
                7: 'RSPCOLOR',
                8: 'XOR',
                9: 'RWINDOW',
                10: 'POINTER'
            },
            207: 'JOY',
            208: 'RDOT',
            209: 'DEC',
            210: 'HEX$',
            211: 'ERR$',
            212: 'INSTR',
            213: 'ELSE',
            214: 'RESUME',
            215: 'TRAP',
            216: 'TRON',
            217: 'TROFF',
            218: 'SOUND',
            219: 'VOL',
            220: 'AUTO',
            221: 'PUDEF',
            222: 'GRAPHIC',
            223: 'PAINT',
            224: 'CHAR',
            225: 'BOX',
            226: 'CIRCLE',
            227: 'GSHAPE',
            228: 'SSHAPE',
            229: 'DRAW',
            230: 'LOCATE',
            231: 'COLOR',
            232: 'SCNCLR',
            233: 'SCALE',
            234: 'HELP',
            235: 'DO',
            236: 'LOOP',
            237: 'EXIT',
            238: 'DIRECTORY',
            239: 'DSAVE',
            240: 'DLOAD',
            241: 'HEADER',
            242: 'SCRATCH',
            243: 'COLLECT',
            244: 'COPY',
            245: 'RENAME',
            246: 'BACKUP',
            247: 'DELETE',
            248: 'RENUMBER',
            249: 'KEY',
            250: 'MONITOR',
            251: 'USING',
            252: 'UNTIL',
            253: 'WHILE',
            254: {  
                2: 'BANK',
                3: 'FILTER',
                4: 'PLAY',
                5: 'TEMPO',
                6: 'MOVSPR',
                7: 'SPRITE',
                8: 'SPRCOLOR',
                9: 'RREG',
                10: 'ENVELOPE',
                11: 'SLEEP',
                12: 'CATALOG',
                13: 'DOPEN',
                14: 'APPEND',
                15: 'DCLOSE',
                16: 'BSAVE',
                17: 'BLOAD',
                18: 'RECORD',
                19: 'CONCAT',
                20: 'DVERIFY',
                21: 'DCLEAR',
                22: 'SPRSAV',
                23: 'COLLISION',
                24: 'BEGIN',
                25: 'BEND',
                26: 'WINDOW',
                27: 'BOOT',
                28: 'WIDTH',
                29: 'SPRDEF',
                30: 'QUIT',
                31: 'STASH',
                33: 'FETCH',
                35: 'SWAP',
                36: 'OFF',
                37: 'FAST',
                38: 'SLOW'
            }
        }
    }
    static lineNumberTokens = {
        'v2': [ 'GOTO', 'GO TO', 'GOSUB', 'THEN' ],
        'v7': [ 'RESTORE' ]
    }
    static {
        this.tokensMap['v7'] = { ...this.tokensMap['v2'], ...this.tokensMap['v7'] }
        this.tokenLookup = {}
        this.tokenRegex = {}
        for (const machine in this.tokensMap) {
            let lookup = {}
            for (const code in this.tokensMap[machine]) {
                const token = this.tokensMap[machine][code]
                if (token instanceof Object) {
                    for (const subcode in token) {
                        const realToken = token[subcode]
                        lookup[realToken] = [ code, subcode ]
                    }
                } else {
                    lookup[token] = code
                }
            }
            this.tokenLookup[machine] = lookup
            const tokenList = Object.keys(lookup).map((t) => t.replace(/([\(\$\+\-\*\/\=\<\>])/, '\\$1'))
            this.tokenRegex[machine] = `(${tokenList.join('|')})`
        }
        this.lineNumberTokens['v7'] = [ ...this.lineNumberTokens['v2'], ...this.lineNumberTokens['v7'] ]
    }

    constructor() {
        this.setVersion('v7')
    }

    setVersion(newVersion) {
        if (newVersion === this.version) { return }
        this.version = newVersion
        this.tokensMap = Tokenizer.tokensMap[this.version]
        this.tokenLookup = Tokenizer.tokenLookup[this.version]
        this.tokenRegex = new RegExp(Tokenizer.tokenRegex[this.version], 'g')
        this.maxLineLength = Tokenizer.maxLineLength[this.version]
        this.lineNumberTokens = Tokenizer.lineNumberTokens[this.version]
    }

    detokenize(byte, nextByte) {
        let mapped = this.tokensMap[byte] || D64.petsciiTable[byte] || `{${byte}}`
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
                line += D64.petsciiTable[byte] || `{${byte}}`
            } else {
                const { mapped, count } = this.detokenize(byte, nextByte)
                line += mapped
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

        // parse the line by quotes
        let varName = null
        let varStart = 0
        for (let linesplit of line.split(/(")/)) {
            if (linesplit === '"') {
``               ;({ varName, varStart} = this.addVariable(variables, varName, varStart))
                inQuote = !inQuote
                tokenBytes.push(D64.petsciiLookup['"'])
                lineIdx += 1
                continue
            }
            let lineTokens = inQuote ? [] : linesplit.match(this.tokenRegex)
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
                    const char = linesplit[0]
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
                    tokenBytes.push(D64.petsciiLookup[char])
                    lineIdx += 1
                }
            }
        }
        if (varName) { this.addVariable(variables, varName, varStart) }

        if (tokenBytes.length < this.maxLineLength) {
            tokenBytes.splice(2, 0, 32)
        }

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