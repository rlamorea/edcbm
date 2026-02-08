class Keymap {
    // notes:
    // -- preserving BackQuote (`) and shift BracketLeft ({) and shift BracketRight (}) for special use
    // -- using shift+alt combo for CBM (and some special chars) to avoid diacritical combo option sequences on Mac
    // -- using ctrl+alt (and shift+ctrl+alt) for CTRL (and SHIFT-CTRL) to avoid collisions with CTRL-key editor combos on Windows

    static baseKeyMappings = {
        'none': {
            'Backquote': -1, 'Tab': -1, // passthrough
            'Digit0': 0x30, 'Digit1': 0x31, 'Digit2': 0x32, 'Digit3': 0x33, 'Digit4': 0x34, 
            'Digit5': 0x35, 'Digit6': 0x36, 'Digit7': 0x37, 'Digit8': 0x38, 'Digit9': 0x39, 
            'Minus': 0x2D,  'Equal': 0x3D,  'BracketLeft': 0x5B, 'BracketRight': 0x5D, 'Backslash': 0x5C, 
            'Semicolon': 0x3B, 'Quote': 0x27, 'Comma': 0x2C, 'Period': 0x2E, 'Slash': 0x2F,
            'KeyA': 0x41, 'KeyB': 0x42, 'KeyC': 0x43, 'KeyD': 0x44, 'KeyE': 0x45, 'KeyF': 0x46,
            'KeyG': 0x47, 'KeyH': 0x48, 'KeyI': 0x49, 'KeyJ': 0x4A, 'KeyK': 0x4B, 'KeyL': 0x4C,
            'KeyM': 0x4D, 'KeyN': 0x4E, 'KeyO': 0x4F, 'KeyP': 0x50, 'KeyQ': 0x51, 'KeyR': 0x52,
            'KeyS': 0x53, 'KeyT': 0x54, 'KeyU': 0x55, 'KeyV': 0x56, 'KeyW': 0x57, 'KeyX': 0x58,
            'KeyY': 0x59, 'KeyZ': 0x5A,
            'Space': 0x20,
        },
        'shift': {
            'Backquote': 0x5F, // left arrow
            'Digit0': 0x29, 'Digit1': 0x21, 'Digit2': 0x40, 'Digit3': 0x23, 'Digit4': 0x24, 
            'Digit5': 0x25, 'Digit6': 0x5E, 'Digit7': 0x26, 'Digit8': 0x2A, 'Digit9': 0x28, 
            'KeyA': 0x61, 'KeyB': 0x62, 'KeyC': 0x63, 'KeyD': 0x64, 'KeyE': 0x65, 'KeyF': 0x66, // shifted petscii
            'KeyG': 0x67, 'KeyH': 0x68, 'KeyI': 0x69, 'KeyJ': 0x6A, 'KeyK': 0x6B, 'KeyL': 0x6C,
            'KeyM': 0x6D, 'KeyN': 0x6E, 'KeyO': 0x6F, 'KeyP': 0x70, 'KeyQ': 0x71, 'KeyR': 0x72,
            'KeyS': 0x73, 'KeyT': 0x74, 'KeyU': 0x75, 'KeyV': 0x76, 'KeyW': 0x77, 'KeyX': 0x78,
            'KeyY': 0x79, 'KeyZ': 0x7A,
            'BracketLeft': -1, 'BracketRight': -1, // passthrough
            'Minus': 0xA4, 'Equal': 0x2B, 
            'Semicolon': 0x3A, 'Quote': 0x22, 
            'Comma': 0x3C, 'Period': 0x3E, 'Slash': 0x3F
        },
        'shiftalt': {
            'KeyA': 0xB0, 'KeyB': 0xBF, 'KeyC': 0xBC, 'KeyD': 0xAC, 'KeyE': 0xB1, 'KeyF': 0xBB,
            'KeyG': 0xA5, 'KeyH': 0xB4, 'KeyI': 0xA2, 'KeyJ': 0xB5, 'KeyK': 0xA1, 'KeyL': 0xB6,
            'KeyM': 0xA7, 'KeyN': 0xAA, 'KeyO': 0xB9, 'KeyP': 0xAF, 'KeyQ': 0xAB, 'KeyR': 0xB2,
            'KeyS': 0xAE, 'KeyT': 0xA3, 'KeyU': 0xB8, 'KeyV': 0xBE, 'KeyW': 0xB3, 'KeyX': 0xBD,
            'KeyY': 0xB7, 'KeyZ': 0xAD,
            'Equal': 0x7B, // heavy cross
            'Semicolon': 0xBA, // lower right large border
            'BracketLeft': 0xA8, // horitozontal half checkerboard
            'BracketRight': 0x7C, // vertical half checkerboard
            'Backslash': 0xA6, // full checkerboard
            'Quote': 0x7E, // pi
            'Slash': 0x5C, // gb-pound
            'Comma': 0xA9, // top-left triangle
            'Period': 0x7F, // bottom-right triangle
        },
        'ctrlalt': { // lower control set
            'KeyA': 0x01, 'KeyB': 0x02, 'KeyC': 0x03, 'KeyD': 0x04, 'KeyE': 0x05, 'KeyF': 0x06, 
            'KeyG': 0x07, 'KeyH': 0x08, 'KeyI': 0x09, 'KeyJ': 0x0A, 'KeyK': 0x0B, 'KeyL': 0x0C, 
            /* no CTRL-M */ 'KeyN': 0x0E, 'KeyO': 0x0F, 'KeyP': 0x10, 'KeyQ': 0x11, 'KeyR': 0x12, 
            'KeyS': 0x13, /* No CTRL-T */ 'KeyU': 0x15, 'KeyV': 0x16, 'KeyW': 0x17, 'KeyX': 0x18, 
            'KeyY': 0x19, 'KeyZ': 0x1A,
            'BracketLeft': 0x1B,
            'Slash': 0x1C,
            'BracketRight': 0x1D,
            'Minus': 0x1E,
            'Equal': 0x1F,
            'ArrowDown': 0x11,
            'ArrowUp': 0x91,
            'ArrowRight': 0x1D,
            'ArrowLeft': 0x9D,
        },
        'shiftctrlalt': { // upper control set
            'KeyA': 0x81, 'KeyB': 0x82, 'KeyC': 0x83, 'KeyD': 0x84, 'KeyE': 0x85, 'KeyF': 0x86, 
            'KeyG': 0x87, 'KeyH': 0x88, 'KeyI': 0x89, 'KeyJ': 0x8A, 'KeyK': 0x8B, 'KeyL': 0x8C, 
            /* No CTRL-M */ 'KeyN': 0x8E, 'KeyO': 0x8F, 'KeyP': 0x90, 'KeyQ': 0x91, 'KeyR': 0x92, 
            'KeyS': 0x93, /* No CTRL-T */ 'KeyU': 0x95, 'KeyV': 0x96, 'KeyW': 0x97, 'KeyX': 0x98, 
            'KeyY': 0x99, 'KeyZ': 0x9A,
            'BracketLeft': 0x9B,
            'Slash': 0x9C,
            'BracketRight': 0x9D,
            'Minus': 0x9E,
            'Equal': 0x9F
        },
    }
    static hostIgnoreKeys = {
        'macOS': { 'alt': 'ALL' }
    }
    static invalidChars = 'àèìòùáéíóúäëïöüÿâêîôûãõñ' // these are all of them according to Gemini
    static diacriticals = [ 0x60, 0xB4, 0xA8, 0x02C6, 0x02DC ]

    static petsciiKeymap = { }

    static {
        this.petsciiKeymap['pet-g'] = this.baseKeyMappings
        this.petsciiKeymap['pet-b'] = {
            'none': { ...this.baseKeyMappings.none },
            'shift': { ...this.baseKeyMappings.shift },
            'shiftalt': { ...this.baseKeyMappings.shiftalt },
            'ctrlalt': { 
                ...this.baseKeyMappings.ctrlalt,
                'Tab': 0x09, 
            },
            'shiftctrlalt': { ...this.baseKeyMappings.shiftctrlalt },
        }
        this.petsciiKeymap['cbm2'] = this.petsciiKeymap['pet-b']
        this.petsciiKeymap['vic20'] = {
            'none': {
                ...this.baseKeyMappings.none,
                'Backslash': 0x6D, // diagonal top-left to bottom-right
                'F1': 0x85, 'F3': 0x86, 'F5': 0x87, 'F7': 0x88,
                'F2': 0x89, 'F4': 0x8A, 'F6': 0x8B, 'F8': 0x8C,
            },
            'shift': { ...this.baseKeyMappings.shift },
            'shiftalt': { ...this.baseKeyMappings.shiftalt },
            'ctrlalt': { 
                ...this.baseKeyMappings.ctrlalt,
                'Digit1': 0x90, 'Digit2': 0x05, 'Digit3': 0x1C, 'Digit4': 0x9F, // control colors
                'Digit5': 0x9C, 'Digit6': 0x1E, 'Digit7': 0x1F, 'Digit8': 0x9E,
                'Digit9': 0x12, 'Digit0': 0x92, // reverse on/off
            },
            'shiftctrlalt': { ...this.baseKeyMappings.shiftctrlalt },
        }
        this.petsciiKeymap['c64'] = {
            'none': { ...this.petsciiKeymap['vic20'].none },
            'shift': { ...this.petsciiKeymap['vic20'].shift },
            'shiftalt': { 
                ...this.petsciiKeymap['vic20'].shiftalt,
                'Digit1': 0x81, 'Digit2': 0x95, 'Digit3': 0x96, 'Digit4': 0x97, // cbm colors
                'Digit5': 0x98, 'Digit6': 0x99, 'Digit7': 0x9A, 'Digit8': 0x9B,
            },
            'ctrlalt': { ...this.petsciiKeymap['vic20'].ctrlalt },
            'shiftctrlalt': { ...this.baseKeyMappings.shiftctrlalt },
        }
        this.petsciiKeymap['c128'] = {
            'none': { ...this.petsciiKeymap['c64'].none },
            'shift': { ...this.petsciiKeymap['c64'].shift },
            'shiftalt': { ...this.petsciiKeymap['c64'].shiftalt },
            'ctrlalt': {
                ...this.petsciiKeymap['c64'].ctrlalt,
                'Tab': 0x09,
                'Return': 0x0A,
            },
            'shiftctrlalt': { ...this.petsciiKeymap['c64'].shiftctrlalt }
        }
        this.petsciiKeymap['c128-80'] = this.petsciiKeymap['c128']
        this.petsciiKeymap['c16'] = this.petsciiKeymap['c64']
        this.petsciiKeymap['plus4'] = this.petsciiKeymap['c64']

        this.ignoreKeys = this.hostIgnoreKeys[window.navigator.userAgentData.platform] || {}
    }

    constructor() {
        this.keymap = {}
    }

    setMachine(machine) {
        this.keymap = Keymap.petsciiKeymap[machine.name]
    }

    getPetsciiForKey(key, options) {
        if (key.metaKey) { return 0 }
        let modifier = (key.shiftKey ? 'shift' : '') + (key.ctrlKey ? 'ctrl' : '') + (key.altKey ? 'alt' : '')
        if (modifier.length === 0) { modifier = 'none' }
        const ignoreKeys = Keymap.ignoreKeys[modifier] || []
        if (ignoreKeys === 'ALL' || ignoreKeys.includes(key.code)) { return 0 }
        const lookup = this.keymap[modifier] || {}
        const petscii = lookup[key.code]
        if (petscii && petscii >= 0x00) {
            if (petscii === 0x00) { return 0 }
            if (options.noCtrl && (petscii <= 0x1F) || (petscii >= 0x80 && petscii <= 0x9F)) { return 0 }
            if (options.noExt && petscii >= 0xA0) { return 0 }
            return petscii
        }
        if (options.noNonPet && petscii < 0) { return 0 }
        if (options.passthrough && !options.passthrough.includes(key.code)) { return 0 }
        return -1 // passthrough
    }
}

window.addEventListener('load', () => {
    window.keymap = new Keymap()
})
