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

    constructor(editor) {
        this.editor = editor
        this.container = document.getElementById('container')
        this.editorArea = this.container.querySelector('.editor-scrollable')
        this.editorBox = null
        this.charSize = null
        
        this.menu = document.getElementById('context-menu')
        this.menu.style.display = 'none'

        // character stuff
        this.charDisplay  = this.menu.querySelector('.cm-char')
        this.showChar = this.menu.querySelector('.cm-charvis')
        this.petsciiVal = this.menu.querySelector('.cm-petscii')
        this.screenCodeVal = this.menu.querySelector('.cm-screen')
        this.inlineCode = this.menu.querySelector('.cm-inline')
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

        // edits stuff
        this.cutAction = this.menu.querySelector('li[data-action=cut]')
        this.copyAction = this.menu.querySelector('li[data-action=copy]')
    }

    setDebugger(debuggr) {
        this.debugger = debuggr
    }

    machineChanged() {
        this.charSize = null
    }

    getCharPos(location) {
        return {
            column: Math.floor((location.x - this.editorBox.left) / this.charSize.width) + 1,
            lineNumber: Math.floor(location.y / this.charSize.height) + 1
        }
    }

    show(event, chained) {
        if (this.editorBox?.left !== this.editorArea.offsetLeft) {
            this.editorBox = {
                left: this.editorArea.offsetLeft,
                top: this.container.offsetTop,
                width: this.editorArea.offsetWidth,
                height: this.editorArea.offsetHeight
            }
            console.log('editorBox', this.editorBox)
        }
        if (this.charSize == null) {
            const c1 = this.editor.editor.getScrolledVisiblePosition({ column: 1, lineNumber: 1 })
            const c2 = this.editor.editor.getScrolledVisiblePosition({ column: 2, lineNumber: 1 })
            this.charSize = {
                width: c2.left - c1.left,
                height: c1.height
            }
        }

        const charPos = this.getCharPos({ x: event.event.relativePos.x, y: event.event.relativePos.y })
        const menuPos = {
            left: this.editorBox.left + charPos.column * this.charSize.width,
            top: this.editorBox.top + charPos.lineNumber * this.charSize.height
        }

        const currentSelections = this.editor.editor.getSelections()
        let inSelection = false
        for (const selection of currentSelections) {
            if (selection.containsPosition(charPos)) {
                inSelection = true
                break
            }
        }

        this.charDisplay.style.display = 'none'

        if (event.target.type === monaco.editor.MouseTargetType.CONTENT_TEXT) {
            this.textContext(event, charPos, inSelection)
        }
        this.editsContext(event, inSelection)

        this.ignoreNext = !chained
        window.blocker.show(this.menu, 'block', (e) => { return this.menuClosed(e) })
        this.menu.style.left = `${menuPos.left}px`
        this.menu.style.top = `${menuPos.top}px`

        const menuSize = {
            width: this.menu.offsetWidth,
            height: this.menu.offsetHeight
        }

        if (menuPos.left + menuSize.width > this.editorBox.width) {
            this.menu.style.left = `${menuPos.left - menuSize.width}px`
        }
        if (menuPos.top + menuSize.height > this.editorBox.height) {
            this.menu.style.top = `${menuPos.top - this.charSize.height - menuSize.height}px`
        }
    }

    textContext(event, charPos, inSelection) {
        if (event.target.detail.mightBeForeignElement) {
            // TODO: handle click on inline annotation -- this is a variable thing
            return
        }

        const lineIndex = charPos.lineNumber
        const model = this.editor.editor.getModel()

        const char = model.getValueInRange(new monaco.Range(charPos.lineNumber, charPos.column, charPos.lineNumber, charPos.column + 1))
        const petscii = window.petscii.stringToPetscii(char)

        if (!inSelection) {
            this.debugChar(model, charPos, petscii)
        }

        if ((petscii >= 0x30 && petscii <= 0x39) || (petscii >= 0x40 && petscii <= 0x5a)) {
            const line = model.getLineContent(lineIndex)
            // TODO: if over a variable or line number, do the thing
        }
    }

    editsContext(event, inSelection) {
        this.cutAction.style.display = inSelection ? 'block' : 'none'
        this.copyAction.style.display = inSelection ? 'block' : 'none'
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

    debugChar(model, charPos, petscii) {
        const upCase = window.petscii.charSet.endsWith('Ug')

        this.charDisplay.style.display = (petscii == null) ? 'none' : 'block'
        if (petscii != null) {
            this.editor.editor.setSelection({ 
                startLineNumber: charPos.lineNumber, endLineNumber: charPos.lineNumber,
                startColumn: charPos.column, endColumn: charPos.column + 1
            })
            this.addedSelection = true

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
            this.inlineCode.style.display = hideInline ? 'none' : 'inline-block'
            this.inlineCode.innerText = `{${inlineCode}}`

            this.menuNeeded = true
        }
    }

    menuClosed(event) {
        if (this.ignoreNext) { 
            this.ignoreNext = false
            return true 
        }
        console.log(event)
        if (this.addedSelection) {
            const curPos = this.editor.editor.getPosition()
            this.editor.editor.setSelection({
                startLineNumber: curPos.lineNumber, endLineNumber: curPos.lineNumber,
                startColumn: curPos.column, endColumn: curPos.column
            })
        }
        this.editor.enableEditor()
        const newLoc = {
            x: event.pageX - this.container.offsetLeft,
            y: event.pageY - this.container.offsetTop
        }
        if (event.type === 'click') {
            const charPos = this.getCharPos(newLoc)
            setTimeout(() => { this.editor.editor.setPosition(charPos) }, 150)
        } else if (event.type === 'contextmenu') {
            setTimeout(() => {
                this.show({ event: { relativePos: newLoc } }, true) // mocked up "event"
            }, 50)
        }
        return false
    }
}
