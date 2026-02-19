class Petscii {
    static coreTable_Sym = {
        0x20: ' ', 0x21: '!', 0x22: '"', 0x23: '#', 0x24: '$', 0x25: '%', 0x26: '&', 0x27: "'", 
        0x28: '(', 0x29: ')', 0x2A: '*', 0x2B: '+', 0x2C: ',', 0x2D: '-', 0x2E: '.', 0x2F: '/', 
        0x30: '0', 0x31: '1', 0x32: '2', 0x33: '3', 0x34: '4', 0x35: '5', 0x36: '6', 0x37: '7', 
        0x38: '8', 0x39: '9', 0x3A: ':', 0x3B: ';', 0x3C: '<', 0x3D: '=', 0x3E: '>', 0x3F: '?', 
    }
    static coreTable_UC = {
        0x40: '@', 0x41: 'A', 0x42: 'B', 0x43: 'C', 0x44: 'D', 0x45: 'E', 0x46: 'F', 0x47: 'G',
        0x48: 'H', 0x49: 'I', 0x4A: 'J', 0x4B: 'K', 0x4C: 'L', 0x4D: 'M', 0x4E: 'N', 0x4F: 'O', 
        0x50: 'P', 0x51: 'Q', 0x52: 'R', 0x53: 'S', 0x54: 'T', 0x55: 'U', 0x56: 'V', 0x57: 'W', 
        0x58: 'X', 0x59: 'Y', 0x5A: 'Z', 0x5B: '[', 
        0x5C: '\uE01C' /* pound or backslash */, 0x5D: ']', 0x5E: '\uE01E' /* up arrow */, 0x5F: '\uE01F', /* left arrow */
    }
    static coreTable_lc = {
        0x40: '@', 0x41: 'a', 0x42: 'b', 0x43: 'c', 0x44: 'd', 0x45: 'e', 0x46: 'f', 0x47: 'g',
        0x48: 'h', 0x49: 'i', 0x4A: 'j', 0x4B: 'k', 0x4C: 'l', 0x4D: 'm', 0x4E: 'n', 0x4F: 'o', 
        0x50: 'p', 0x51: 'q', 0x52: 'r', 0x53: 's', 0x54: 't', 0x55: 'u', 0x56: 'v', 0x57: 'w', 
        0x58: 'x', 0x59: 'y', 0x5A: 'z', 0x5B: '[', 
        0x5C: '\uE01C' /* pound or backslash */, 0x5D: ']', 0x5E: '\uE01E' /* up arrow */, 0x5F: '\uE01F', /* left arrow */
    }

    static commonCodeNames = {
        0x03: 'stop',
        0x0D: 'return',     
        0x11: 'down',       
        0x12: 'reverse-on',
        0x13: 'home',       
        0x14: 'delete',     
        0x1D: 'right',      
        0x20: 'space',      
        0x5E: 'up-arrow',   
        0x5F: 'left-arrow', 
        0x7E: 'pi',         
        0x83: 'run',        
        0x8D: 'shift-return',
        0x91: 'up',
        0x92: 'reverse-off',
        0x93: 'clear',
        0x94: 'insert',     
        0x9D: 'left'     
    }

    static generateCodeSequence(startCode, endCode, startPetscii) {
        let petscii = startPetscii
        let codes = {}
        for (let code = startCode; code <= endCode; code++) {
            codes[code] = String.fromCodePoint(petscii++)
        }
        return codes
    }

    static addCodeNames(codeNames, code, prefix, letters) {
        for (const letter of letters) {
            codeNames[code++] = prefix + letter
        }        
    }

    static clearCodeNames(codeNames, codes, codeEnd) {
        if (!Array.isArray(codes)) {
            if (codeEnd) {
                codes = Array.from({ length: (codeEnd - codes) + 1 }, (_, index) => codes + index)
            } else {
                codes = [ codes ]
            }
        }
        for (const code of codes) {
            delete codeNames[code]
        }
    }

    static tables = { }
    static lookup = { }
    static codeNames = { }
    static nameLookup = { }
    static machineMapping = {
        'c64': { 'Ug': 'c64-Ug', 'lU': 'c64-lU' },
        'c128': { 'Ug': 'c128-Ug', 'lU': 'c128-lU' },
        'c128-80': { 'Ug': 'c128-Ug', 'lU': 'c128-lU' },
        'c16': { 'Ug': 'ted-Ug', 'lU': 'ted-lU' },
        'plus4': { 'Ug': 'ted-Ug', 'lU': 'ted-lU' },
        'vic20': { 'Ug': 'vic20-Ug', 'lU': 'vic20-lU' },
        'pet-g': { 'Ug': 'pet-Ug', 'lU': 'pet-lU' },
        'pet-b': { 'lU': 'pet-lU', default: 'lU' },
        'cbm2': { 'Ug': 'cbm2-Ug', 'lU': 'cbm2-lU', default: 'lU' },
    }

    static {
        this.tables['c64-Ug'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE080),
            ...this.coreTable_Sym,
            ...this.coreTable_UC,
            ...this.generateCodeSequence(0x60, 0x7F, 0xE040),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE0C0),
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE060),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE040)
        }
        this.tables['c64-lU'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE180),
            ...this.coreTable_Sym,
            ...this.coreTable_lc,
            ...this.generateCodeSequence(0x60, 0x7F, 0xE140),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE1C0),
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE160),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE140)
        }
        this.tables['c128-Ug'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE280),
            ...this.coreTable_Sym,
            ...this.coreTable_UC,
            ...this.generateCodeSequence(0x60, 0x7F, 0xE240),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE2C0),
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE260),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE240)
        }
        this.tables['c128-lU'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE380),
            ...this.coreTable_Sym,
            ...this.coreTable_lc,
            ...this.generateCodeSequence(0x60, 0x7F, 0xE340),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE3C0),
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE360),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE340)
        }
        this.tables['c128-80-Ug'] = this.tables['c128-Ug']
        this.tables['c128-80-lU'] = this.tables['c128-lU']
        this.tables['c16-Ug'] = this.tables['c128-Ug']
        this.tables['c16-lU'] = this.tables['c128-lU']
        this.tables['plus4-Ug'] = this.tables['c128-Ug']
        this.tables['plus4-lU'] = this.tables['c128-lU']
        this.tables['pet-g-Ug'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE280), // stealing control charas from VIC-20 set
            ...this.coreTable_Sym,
            ...this.coreTable_UC,
            ...this.generateCodeSequence(0x60, 0x7F, 0xE040),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE2C0), // from VIC-20 set
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE060),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE040)
        }
        this.tables['pet-g-lU'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE280), // VIC-20
            ...this.coreTable_Sym,
            ...this.coreTable_lc,
            ...this.generateCodeSequence(0x60, 0x7F, 0xE0C0),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE2C0), // VIC-20
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE0E0),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE0C0)
        }
        this.tables['pet-b-lU'] = this.tables['pet-g-lU']
        this.tables['vic20-Ug'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE280),
            ...this.coreTable_Sym, // can use base PET font for these
            ...this.coreTable_UC,
            0x5C: '\uE21C',
            ...this.generateCodeSequence(0x60, 0x7F, 0xE240),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE2C0),
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE260),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE240)
        }
        this.tables['vic20-lU'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE380),
            ...this.coreTable_Sym, // can use base PET font for these
            ...this.coreTable_lc,
            0x5C: '\uE21C',
            ...this.generateCodeSequence(0x60, 0x7F, 0xE340),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE3C0),
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE360),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE340)
        }
        this.tables['cbm2-lU'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE280), // stealing control charas from VIC-20 set
            ...this.coreTable_Sym, // can use base PET font for these
            ...this.coreTable_lc,
            0x5C: '\uE81C',
            ...this.generateCodeSequence(0x60, 0x7F, 0xE840),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE2C0), // from VIC-20 set
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE860),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE840)
        }
        this.tables['cbm2-Ug'] = {
            ...this.generateCodeSequence(0x00, 0x1F, 0xE280), // stealing control charas from VIC-20 set
            ...this.coreTable_Sym, // can use base PET font for these
            ...this.coreTable_UC,
            0x5C: '\uE81C',
            ...this.generateCodeSequence(0x60, 0x7F, 0xE8C0),
            ...this.generateCodeSequence(0x80, 0x9F, 0xE2C0), // from VIC-20 set
            ...this.generateCodeSequence(0xA0, 0xBF, 0xE8E0),
            ...this.generateCodeSequence(0xC0, 0xFF, 0xE8C0)
        }

        for (const table in this.tables) {
            this.lookup[table] = Object.fromEntries( Object.entries(this.tables[table]).map(([k,v]) => [v,parseInt(k)]))
        }

        let coreCodeNames = { }
        this.addCodeNames(coreCodeNames, 0x00, 'ctrl-', [ ...'@ABCDEFGHIJKLMNOPQRSTUVWXYZ[', 'backslash', ']', 'up-arrow', 'left-arrow' ])
        this.addCodeNames(coreCodeNames, 0x80, 'shift-ctrl-', [ ...'@ABCDEFGHIJKLMNOPQRSTUVWXYZ[', 'backslash', ']', 'up-arrow', 'left-arrow' ])
        coreCodeNames[0x9E] = 'ctrl-pi' // implied shift
        this.addCodeNames(coreCodeNames, 0x20, '', [ ...` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[`, 'backslash', ']', 'up-arrow', 'left-arrow' ])
        this.addCodeNames(coreCodeNames, 0x60, 'shift-', '@ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        coreCodeNames = { ...coreCodeNames, ...this.commonCodeNames }

        let lowerCodeNames = { ...coreCodeNames }
        this.addCodeNames(lowerCodeNames, 0x41, '', 'abcdefghijklmnopqrstuvwxyz')
        this.addCodeNames(lowerCodeNames, 0x61, '', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')

        // pet graphics
        this.codeNames['pet-Ug'] = { ...coreCodeNames, ...this.commonCodeNames }
        this.addCodeNames(this.codeNames['pet-Ug'], 0x7B, 'shift-', [ '[', 'backslash', ']', 'up-arrow', 'left-arrow' ])
        this.codeNames['pet-Ug'][0x7E] = 'pi'
        this.addCodeNames(this.codeNames['pet-Ug'], 0xA0, 'shift-', ` !"#$%&'()*+,-./0123456789:;<=>?`)
        this.codeNames['pet-lU'] = { ...this.codeNames['pet-Ug'], ...lowerCodeNames }

        // pet business
        this.codeNames['pet-b-lU'] = { 
            ...this.codeNames['pet-lU'],
            0x07: 'bell',
            0x09: 'tab',
            0x0F: 'window-top-left',
            0x15: 'insert-line',
            0x16: 'delete-to-eol',
            0x19: 'scroll-up',
            0x1B: 'esc',
            0x89: 'set-tab',
            0x8F: 'window-bottom-right',
            0x95: 'delete-line',
            0x96: 'delete-to-sol',
            0x99: 'scroll-down',
        }
        this.clearCodeNames(this.codeNames['pet-b-lU'], 0x60)
        this.clearCodeNames(this.codeNames['pet-b-lU'], 0x7B, 0x7F)
        this.clearCodeNames(this.codeNames['pet-b-lU'], 0xA0, 0xBF)

        // cbm2
        this.codeNames['cbm2-Ug'] = {
            ...this.codeNames['pet-Ug'],
            0x04: 'ce',
            0x07: 'bell',
            0x09: 'tab',
            0x0E: 'lower-case',
            0x0F: 'window-top-left',
            0x1B: 'esc',
            0x84: 'shift-ce',
            0x84: 'shift-tab',
            0x8E: 'upper-case',
            0x8F: 'window-bottom-right',
        }
        this.addCodeNames(this.codeNames['cbm2-Ug'], 0x60, 'graph-', 'VABCDEFGHIJK[,MOPQRSTULWXYZ')
        this.addCodeNames(this.codeNames['cbm2-Ug'], 0xA1, 'ctrl-', 
            [ ...`12345"6'=`, 'num--', 'num-+', '0', 'num-0', 'num-2', 'num-/', 'num-1', 'num-4', 'num-5', 
              'num-6', 'num-7', 'num-8', 'num-9', 'num-?', 'ce', 'num-.', ']8-', 'num-.', '7', '9' ]
        )
        this.codeNames['cbm2-Ug'] = {
            ...this.codeNames['cbm2-Ug'],
            0x6D: 'ctrl-,',
            0x7B: 'ctrl-num-3',
            0x7C: 'ctrl-;',
            0x7D: 'graph-N',
            0x7E: 'pi',
            0x7F: 'ctrl-left-arrow'
        }
        this.codeNames['cbm2-lU'] = {
            ...this.codeNames['cbm2-Ug'],
            ...lowerCodeNames
        }

        // vic20
        this.codeNames['vic20-Ug'] = {
            ...coreCodeNames,
            0x05: 'white',
            0x0E: 'lower-case',
            0x1C: 'red',
            0x1E: 'green',
            0x1F: 'blue',
            0x85: 'f1', 0x86: 'f3', 0x87: 'f5', 0x88: 'f7', 0x89: 'f2', 0x8A: 'f4', 0x8B: 'f6', 0x8C: 'f8',
            0x8E: 'upper-case',
            0x90: 'black',
            0x9C: 'purple',
            0x9E: 'yellow',
            0x9F: 'cyan',
        }
        this.addCodeNames(this.codeNames['vic20-Ug'], 0xA1, 'cbm-', [ ...'KIT@G+M', 'gb-pound', ...'xNQDZSPAERWHJLYUOxFCXVB' ])
        this.codeNames['vic20-Ug'] = {
            ...this.codeNames['vic20-Ug'],
            0x5C: 'gb-pound',
            0x7B: 'shift-+',
            0x7C: 'cbm--',
            0x7D: 'shift--',
            0x7E: 'pi',
            0x7F: 'cbm-*',
            0xBA: 'shift-@',
            0xA9: 'shift-gb-pound',
        }
        this.codeNames['vic20-lU'] = {
            ...this.codeNames['vic20-Ug'],
            ...lowerCodeNames
        }

        // c64
        this.codeNames['c64-Ug'] = {
            ...this.codeNames['vic20-Ug'],
            0x08: 'lock-case',
            0x09: 'unlock-case',
            0x81: 'orange',
            0x95: 'brown',
            0x96: 'light-red',
            0x97: 'dark-gray',
            0x98: 'medium-gray',
            0x99: 'light-green',
            0x9A: 'light-blue',
            0x9B: 'light-gray'
        }
        this.codeNames['c64-lU'] = {
            ...this.codeNames['c64-Ug'],
            ...lowerCodeNames
        }

        // c128 (uses VIC-II colors)
        this.codeNames['c128-Ug'] = {
            ...this.codeNames['c64-Ug'],
            0x02: 'uline-on',
            0x07: 'bell',
            0x09: 'tab',
            0x0A: 'linefeed',
            0x0B: 'lock-case',
            0x0C: 'unlock-case',
            0x0F: 'flash-on',
            0x18: 'toggle-tab',
            0x1B: 'esc',
            0x82: 'uline-off',
            0x8F: 'flash-off',           
        }
        this.clearCodeNames(this.codeNames['c128-Ug'], 0x08)
        this.codeNames['c128-lU'] = {
            ...this.codeNames['c128-Ug'],
            ...lowerCodeNames
        }

        // c16/plus4
        this.codeNames['ted-Ug'] = {
            ...this.codeNames['c64-Ug'],
            0x82: 'flash-on',
            0x84: 'flash-off',
            0x96: 'yellow-green',
            0x97: 'pink',
            0x98: 'blue-green',
            0x99: 'light-blue',
            0x9A: 'dark-blue',
            0x9B: 'light-green',
        }
        this.codeNames['ted-lU'] = {
            ...this.codeNames['ted-Ug'],
            ...lowerCodeNames
        }

        for (const codeKey in this.codeNames) {
            this.nameLookup[codeKey] = Object.fromEntries( Object.entries(this.codeNames[codeKey]).map(([k,v]) => [v,parseInt(k)]) )
        }
    }

    constructor() {
        this.machine = null
        this.charSet = null

        this.charSets = null
        this.table = {}
        this.lookup = {}
        this.codes = {}
        this.nameLookup = {}

        this.rerenderHandlers = []
        this.enableHandlers = true
    }

    registerRerenderHandler(handler) {
        this.rerenderHandlers.push(handler)
    }

    setMachine(machine, charSet) {
        this.machine = machine.name
        this.charSets = Petscii.machineMapping[this.machine]
        this.setCharSet(charSet ?? 'default')
    }

    setCharSet(charSet = 'default') {
        if (charSet === 'default') { charSet = this.charSets.default || 'Ug' }
        if (!(charSet in this.charSets)) { charSet = this.charSets.default ?? 'Ug' }
        this.charSet = charSet

        this.setKey = `${this.machine}-${charSet}`

        if (this.enableHandlers) {
            this.rerenderHandlers.forEach((h) => h.preFontChange ? h.preFontChange() : 0)
        }

        this.table = Petscii.tables[this.setKey]
        this.lookup = Petscii.lookup[this.setKey]
        this.codes = Petscii.codeNames[this.setKey]
        this.nameLookup = Petscii.nameLookup[this.setKey]

        if (this.enableHandlers){
            this.rerenderHandlers.forEach((h) => h.postFontChange ? h.postFontChange() : 0)
        }
    }

    availableCharSets() {
        let cs = Object.keys(this.charSets)
        if ('default' in cs) { delete cs.default }
        return cs
    }

    stringToPetscii(str, alwaysArray = false) {
        let petscii = []
        for (const char of str) { 
            let petsciiByte = this.lookup[char]
            if (!petsciiByte && char === '\n') { petsciiByte = 0x0D } // CR if necessary
            if (petsciiByte) { petscii.push(this.lookup[char]) }
            // NOTE: this will remove all non-petscii characters
        }
        // return a single value if given a char
        if (!alwaysArray && str.length === 1 && petscii.length === 1) { petscii = petscii[0] }
        return petscii
    }

    stringToPetsciiString(str) {
        let petsciiStr = ''
        let raw = false
        for (const char of str) { 
            if (char === '\n') { 
                petsciiStr += '\n' 
                raw = false
            } else if (char === '`') {
                petsciiStr += '`'
                raw = true
            } else {
                const petsciiByte = this.lookup[char]
                if (isNaN(petsciiByte)) {
                    console.log(`NaN char "${char}"`)
                    if (char.length > 0) { console.log('code is', char.codePointAt(0)) }
                    continue
                }
                if (petsciiByte <= 0) {
                    petsciiStr += raw ? char : `{${char.codePointAt(0).toString(0).padStart(2, '0')}}`
                } else {
                    petsciiStr += String.fromCodePoint(petsciiByte)
                }
            }
        }
        return petsciiStr
    }

    petsciiBytesToString(petscii) {
        let str = ''
        if (!Array.isArray(petscii)) { petscii = [ petscii ] }
        for (const byte of petscii) { str += this.table[byte] ?? `{\\u${byte.toString(16)}}` }
        return str
    }

    petsciiStringToString(petsciiStr) {
        let str = ''
        let raw = false
        let inBraces = null
        for (const petsciiChar of petsciiStr) {
            if (petsciiChar === '\n') {
                str += '\n'
                raw = false
            } else if (petsciiChar === '`') {
                str += '`'
                raw = true
            } else if (petsciiChar === '{') {
                inBraces = ' '
            } else if (petsciiChar === '}') {
                str += String.fromCodePoint(parseInt(inBraces.trim(), 16))
                inBraces = null
            } else if (inBraces) {
                inBraces += petsciiChar
            } else {
                let char = this.table[petsciiChar.codePointAt(0)]
                if (char == null) {
                    str += raw ? char : `{${petsciiChar.codePointAt(0).toString(16).padStart(2, '0')}}`
                } else {
                    str += char
                }
            }
        }
        return str
    }
}

window.addEventListener('load', () => {
    window.petscii = new Petscii()
})
