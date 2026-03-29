class ContextMenu {
    static cbmKeyLookup = {
        0x93: [ 'shift', 'CLR\nHOME' ]
    }

    static localKeyLookup = {
        0x09: [ 'control', 'alt', 'tab' ],
        0x0a: [ 'control', 'alt', 'J' ],
        0x11: [ 'control', 'alt', '\u25bc' ],
        0x13: [ 'control', 'alt', 'S' ],
        0x1d: [ 'control', 'alt', '\u25c0' ],
        0x1b: [ 'control', 'alt', '{\n[' ],
        0x2b: [ 'shift', '+\n=' ],
        0x40: [ 'shift', '@\n2' ],
        0x5c: [ 'shift', 'alt', '?\n/' ],
        0x5e: [ 'shift', '^\n6' ],
        0x5f: [ 'shift', '~\n`' ],
        0x85: [ 'fn', 'F1' ],
        0x86: [ 'fn', 'F3' ],
        0x87: [ 'fn', 'F5' ],
        0x88: [ 'fn', 'F7' ],
        0x89: [ 'fn', 'F2' ],
        0x8a: [ 'fn', 'F4' ],
        0x8b: [ 'fn', 'F6' ],
        0x8c: [ 'fn', 'F8' ],
        0x91: [ 'control', 'alt', '\u25b2' ],
        0x9d: [ 'control', 'alt', '\u25b6' ],
        0x93: [ 'control', 'shift', 'alt', 'S' ],
        0xe9: [ 'shift', 'alt', '<\n,' ],
    }

    static convertPetsciiToScreenCode(petscii) {
        let code = petscii
        if (petscii >= 0x40 && petscii <= 0x5f) {
            code = code - 0x40
        } else if (petscii >= 0x60 && petscii <= 0x7f) {
            code = code - 0x20
        } else if (petscii >= 0xa0 && petscii <= 0xbf) {
            code = code - 0x40
        } else if (petscii >= 0x00 && petscii <= 0x1f) {
            code = code + 0x80
        } else if (petscii >= 0x80 && petscii <= 0x9f) {
            code = code - 0x20
        } else if (petscii >= 0xc0 && petscii <= 0xff) {
            code = code - 0x80
        }
        return code
    }

    static {
        this.petsciiExclude.push([])
    }

    constructor(editor) {
        this.editor = editor
        
        this.menu = document.getElementById('context-menu')
        this.menu.style.display = 'none'

        // character stuff
        this.charDisplay  = this.menu.querySelector('.cm-char')
        this.showChar = this.menu.querySelector('.cm-charvis')
        this.petsciiVal = this.menu.querySelector('.cm-petscii')
        this.screenCodeVal = this.menu.querySelector('.cm-screen')
        this.inlineCodeEls = this.menu.querySelectorAll('.cm-inline')
        this.inlineCode = this.inlineCodeEls[1].querySelector('span')
        this.cbmKeys = {
            ctrl: this.menu.querySelector('.cm-cbmkey span[data-key=ctrl]'),
            cbm: this.menu.querySelector('.cm-cbmkey span[data-key=cbm]'),
            shift: this.menu.querySelector('.cm-cbmkey span[data-key=shift]'),
            any: this.menu.querySelector('.cm-cbmkey span[data-key=any]')
        }
        this.localKeys = {
            fn: this.menu.querySelector('.cm-localkey span[data-key=fn'),
            control: this.menu.querySelector('.cm-localkey span[data-key=control'),
            alt: this.menu.querySelector('.cm-localkey span[data-key=alt]'),
            shift: this.menu.querySelector('.cm-localkey span[data-key=shift]'),
            any: this.menu.querySelector('.cm-localkey span[data-key=any]')
        }
    }

    setDebugger(debuggr) {
        this.debugger = debuggr
    }

    showKeys(keySet, keys) {
        for (const key in keySet) {
            const keyEl = keySet[key]
            if (key === 'any') {
                let keyDef = keys.slice(-1)[0]
                keyEl.className = ''
                let keyDefWidth = keyDef.length
                const nlIdx = keyDef.indexOf('\n')
                if (nlIdx > 0) {
                    keyEl.className = 'splt '
                    keyDefWidth = keyDef.substring(0, nlIdx).length
                    keyDef = keyDef.replace('\n', '<br/>')
                }
                if (keyDefWidth > 2) {
                    keyEl.className += 'sml'
                }
                keyEl.innerHTML = keyDef
                continue
            }
            keyEl.style.display = keys.includes(key) ? 'inline-block' : 'none'
        }

    }

    show(line, position) {
        const trimLine = line.trim()
        if (trimLine.startsWith("`")) { return }

        const upCase = window.petscii.charSet.endsWith('Ug')

        const char = line.charAt(position.column - 1)
        const petscii = window.petscii.stringToPetscii(char)
        this.charDisplay.style.display = (petscii == null) ? 'none' : 'block'
        if (petscii != null) {
            const screenCode = ContextMenu.convertPetsciiToScreenCode(petscii)
            let petsciiHex = petscii.toString(16).padStart(2, '0')
            let screenCodeHex = screenCode.toString(16).padStart(2, '0')
            if (upCase) { 
                petsciiHex = petsciiHex.toUpperCase() 
                screenCodeHex = screenCodeHex.toUpperCase()
            }
            this.petsciiVal.innerText = `${petscii.toString().padStart(3, '\xa0')} $${petsciiHex}`
            this.screenCodeVal.innerText = `${screenCode.toString().padStart(3, '\xa0')} $${screenCodeHex}`

            let charVis = window.petscii.petsciiBytesToString([ petscii ])[0]
            if (charVis === ' ') { charVis = '\xa0' }
            this.showChar.innerText = charVis
            let inlineCode = window.petscii.codes[petscii]
            const hideInline = (inlineCode.length === 1 && inlineCode === charVis)

            let cbmKeys = ContextMenu.cbmKeyLookup[petscii]
            if (cbmKeys == null) {
                cbmKeys = []
                if (inlineCode.startsWith('ctrl-')) { cbmKeys.push('ctrl') }
                if (inlineCode.startsWith('cbm-')) { cbmKeys.push('cbm') }
                if (inlineCode.startsWith('shift-')) { cbmKeys.push('shift') }
                cbmKeys.push(inlineCode.slice(-1))
            }
            this.showKeys(this.cbmKeys, cbmKeys)

            let localKeys = ContextMenu.localKeyLookup[petscii]
            if (localKeys == null) {
                localKeys = []
                if (inlineCode.startsWith('ctrl-')) { localKeys.push('control', 'alt') }
                if (inlineCode.startsWith('cbm-')) { localKeys.push('shift', 'alt') }
                if (inlineCode.startsWith('shift-')) { localKeys.push('shift') }
                localKeys.push(inlineCode.slice(-1))
            }
            this.showKeys(this.localKeys, localKeys)

            if (upCase) { inlineCode = inlineCode.toUpperCase() }
            this.inlineCodeEls.forEach((e) => { e.style.display = hideInline ? 'none' : 'inline-block' })
            this.inlineCode.innerText = inlineCode

        }

        window.blocker.show(this.menu)

        const coords = this.editor.editor.getScrolledVisiblePosition(position);
        const editorSize = this.editor.editor.getLayoutInfo();

        this.menu.style.left = `${coords.left}px`
        this.menu.style.top = `${coords.top + coords.height}px`

        const menuSize = {
            width: this.menu.offsetWidth,
            height: this.menu.offsetHeight
        }

        if (coords.left + menuSize.width > editorSize.width) {
            this.menu.style.left = `${coords.left - menuSize.width}px`
        }
        if (coords.top + coords.height + menuSize.height > editorSize.height) {
            this.menu.style.top = `${coords.top - menuSize.height}px`
        }
    }
}