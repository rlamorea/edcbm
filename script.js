class NameMenu {
    static passthroughKeys = [
        'Backspace',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Enter',
    ]
    static keyLookup
    static {
        this.keyLookup = { 
            'none' : { 
                ...Editor.petsciiLookup['none'],
                ...{
                    'KeyA' : 'A', 'KeyB' : 'B', 'KeyC' : 'C', 'KeyD' : 'D', 'KeyE' : 'E',
                    'KeyF' : 'F', 'KeyG' : 'G', 'KeyH' : 'H', 'KeyI' : 'I', 'KeyJ' : 'J',
                    'KeyK' : 'K', 'KeyL' : 'L', 'KeyM' : 'M', 'KeyN' : 'N', 'KeyO' : 'O',
                    'KeyP' : 'P', 'KeyQ' : 'Q', 'KeyR' : 'R', 'KeyS' : 'S', 'KeyT' : 'T',
                    'KeyU' : 'U', 'KeyV' : 'V', 'KeyW' : 'W', 'KeyX' : 'X', 'KeyY' : 'Y',
                    'KeyZ' : 'Z',
                    'Digit0' : '0', 'Digit1' : '1', 'Digit2' : '2', 'Digit3' : '3', 'Digit4' : '4', 
                    'Digit5' : '5', 'Digit6' : '6', 'Digit7' : '7', 'Digit8' : '8', 'Digit9' : '9', 
                    'Minus' : '-', 'Equal' : '=', 'BracketLeft': '[', 'BracketRight': ']',
                    'Semicolon': ';', 'Quote': "'", 'Comma': ',', 'Period' : '.', 'Slash': '/',
                    'Space': ' '
                }
            },
            'shift' : {
                ...Editor.petsciiLookup['shift'],
                ...{
                    'Digit1' : '!', 'Digit2': '@', 'Digit3' : '#', 'Digit4' : '$', 'Digit5' : '%',
                    'Digit7' : '&', 'Digit8': '*', 'Digit9' : '(', 'Digit0' : ')',
                    'Equal' : '+', 'Semicolon': ':', 'Quote' : '"',
                    'Comma' : '<', 'Period': '>', 'Slash' : '?'
                }
            },
            'alt' : { ...Editor.petsciiLookup['alt'] }
        }
    }

    constructor(id, parent, handlers) {
        this.id = id
        this.parent = parent
        this.handlers = handlers

        this.input = document.getElementById(this.id)
        this.drop = document.getElementById(this.id + 'drop')
        this.menu = document.getElementById(this.id + 'menu')

        this.menu.style.display = 'none'
        this.input.readOnly = true
        this.input.inert = true
        this.input.addEventListener('blur', () => { this.nameChanged() })
        this.input.addEventListener('keydown', (e) => { this.nameKey(e) })

        this.selections = {}
        this.menu.querySelectorAll('li').forEach((e) => {
            const l = e.querySelector('label')
            const name = (l ? l.textContent : e.textContent).toLowerCase().replaceAll(' ', '-')
            this.selections[name] = e
            e.dataset.name = name
            if (l) {
                e.querySelector('input').addEventListener('change', (e) => this.selectionFile(e))
            } else {
                e.addEventListener('click', (e) => this.selectionMade(e))
            }
        })

        this.drop.addEventListener('click', () => { this.toggleMenu() })
    }

    toggleMenu() {
        this.drop.classList.toggle('active')
        const isActive = this.drop.classList.contains('active')
        this.menu.style.display = isActive ? 'block' : 'none'
        this.parent.blocker.style.display = isActive ? 'block' : 'none'
        if (isActive) {
            this.parent.blockShutdown = () => { this.hideMenu() }
        } else {
            this.parent.blockShutdown = null
        }
    }

    hideMenu() {
        this.toggleMenu()
    }

    selectionMade(e) {
        this.toggleMenu()
        if (e.target.classList.contains('disabled')) { return }
        const handler = this.handlers[e.target.dataset.name]
        if (handler) { handler(e) }
    }

    selectionFile(e) {
        this.toggleMenu()
        const selection = e.target.closest('li')
        if (selection.classList.contains('disabled')) { return }
        if (e.target.files.length === 0) { return }
        const file = e.target.files[0]
        const handler = this.handlers[selection.dataset.name]
        if (handler) { handler(e, file, selection)}
    }

    selectionsEnable(disable = []) {
        this.menu.querySelectorAll('li').forEach((e) => {
            e.classList.toggle('disabled', disable.includes(e.dataset.name))
        })
    }

    editName() {
        this.input.readOnly = false
        this.input.inert = false
        this.input.focus()
    }

    nameKey(e) {
        // pass through
        if (e.ctrlKey || NameMenu.passthroughKeys.includes(e.code)) {
            if (e.code === 'Enter') { this.input.blur() }
            return
        }
        e.preventDefault()
        let modifier = (e.shiftKey ? 'shift' : '') + (e.ctrlKey ? 'ctrl' : '') + (e.altKey ? 'alt' : '')
        if (modifier.length === 0) { modifier = 'none' }
        const lookup = NameMenu.keyLookup[modifier] || {}
        const petscii = lookup[e.code]
        let val = this.input.value
        if (petscii) {
            val += petscii
            this.input.value = val
            this.input.setSelectionRange(val.length, val.length)
        }
    }

    nameChanged() {
        this.input.readOnly = true
        this.input.inert = true
        const handler = this.handlers['namechange']
        if (handler) { handler(this.input.value.trim() )}
    }

    name() {
        return this.input.value || ''
    }

    setName(name) {
        this.input.value = name || ''
        this.nameChanged()
    }
}

class Controls {
    static programStartAddress = {
        'c128' : 0x1c01,
        'c64' : 0x0801,
    }

    constructor() {
        // TODO: machine menu
        // TODO: palette menu
        this.c64Button = document.getElementById('mode-c64')
        this.c128Button = document.getElementById('mode-c128')
        this.darkMode = false

        this.c64Button.addEventListener('click', () => this.setMode('c64', this.darkMode))
        this.c128Button.addEventListener('click', () => this.setMode('c128', this.darkMode))

        this.darkButton = document.getElementById('dark-mode')
        this.darkButton.addEventListener('click', () => this.setMode(this.mode, !this.darkMode))
        this.darkButton.classList.add('inactive')

        document.getElementById('clean').addEventListener('click', () => this.cleanCode())

        this.blocker = document.getElementById('blocker')
        this.blocker.addEventListener('click', () => { this.hideBlocker() })
        this.blockShutdown = null

        this.mode = 'c128'
        this.c64Button.classList.add('inactive')
        document.body.className = 'c128'

        this.file = null
        this.fileOptions = new NameMenu('fname', this, {
            'new' : (e) => { this.newFile(e) },
            'rename': (e) => { this.renameFile(e) },
            'load-prg': (e, f, s) => { this.loadProgramFile(e, f, s) },
            'load-from-disc': (e) => { this.loadFromDisc(e) },
            'save-prg': (e) => { this.saveProgramFile(e) },
            'save-to-disc': (e) => { this.saveToDisc(e) },
            'namechange': (n) => { this.fileNameChanged(n) }
        })

        this.disc = null
        this.catalogRendered = false
        this.discOptions = new NameMenu('dname', this, {
            'new': (e) => { this.newDisc(e) },
            'rename': (e) => { this.renameDisc(e) },
            'catalog': (e) => { this.discCatalog(e) },
            'load-d64': (e, f, s) => { this.loadDisc(e, f, s) },
            'save-d64': (e) => { this.saveDisc(e) },
            'namechange': (n) => { this.discNameChanged(n) }
        })

        this.catalog = document.getElementById('catalog')
        this.catalog.style.display = 'none'
        this.catalogLoaded = false
        this.catalog.querySelector('ul').addEventListener('click', (e) => { this.discFileSelected(e) })

        if (window.editor) { window.editor.disabled = true }
    }

    setMode(newMode, newDarkMode) {
        this.mode = newMode
        this.darkMode = newDarkMode
        this.c64Button.classList.toggle('inactive', newMode !== 'c64')
        this.c128Button.classList.toggle('inactive', newMode !== 'c128')
        this.darkButton.classList.toggle('inactive', !this.darkMode)
        document.body.className = this.darkMode ? '' : this.mode
        window.editor.setMode(this.mode, this.darkMode)
    }

    cleanCode() {
        window.editor.cleanProgram()
    }

    newFile(e) {
        this.startAddress = Controls.programStartAddress[this.mode]
        window.editor.setProgram('')
        window.editor.disabled = false
        this.fileOptions.editName()
    }

    renameFile(e) {
        this.fileOptions.editName()
    }

    loadProgramFile(e, file, selection) {
        const reader = new FileReader()
        reader.onload = () => {
            let content = reader.result
            let sa = content.match(/^`` SA\: *(\d+)/)
            if (sa) {
                this.startAddress = parseInt(sa[1])
                content = content.substring(content.indexOf('\n')).trim()
            } else {
                this.startAddress = Controls.programStartAddress[this.mode]
            }
            window.editor.setProgram(content)
            const fname = file.name.replace(/\.EPRG$/, '').toUpperCase()
            this.fileOptions.setName(fname)
        }
        reader.readAsText(file)
    }

    loadFromDisc(e) {
        this.discCatalog()
    }

    saveProgramFile(e) {
        let fileName = this.fileOptions.name().trim()
        if (fileName === '') { return }
        fileName += '.EPRG'
        const content = "`` SA:" + this.startAddress.toString() + '\n' + window.editor.getProgram()
        const blob = new Blob([content], { type: 'text/plain' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }

    saveToDisc(e) {
        if (!this.currentDisc) { return }
        let fileName = this.fileOptions.name().trim()
        if (fileName === '') { return }
        const bytes = window.editor.getProgramBytes(this.startAddress)
        if (bytes.length === 0) { return }
        this.currentDisc.writeFileData(fileName, bytes)
        this.catalogRendered = false
    }

    fileNameChanged(name) {
        const hasName = name.length > 0
        const disabled = hasName ? [ ] : [ 'rename', 'save-prg', 'save-to-disc' ]
        this.fileOptions.selectionsEnable(disabled)
    }

    newDisc(e) {
        this.discOptions.editName()
        if (this.currentDisc) { delete this.currentDisc }
        this.currentDisc = new D64()
        this.catalogRendered = false
        this.discOptions.selectionsEnable()
    }

    renameDisc(e) {
        this.discOptions.editName()
    }

    discCatalog(e) {
        if (!this.currentDisc) { return }

        this.catalog.style.display = 'block'
        this.blocker.style.display = 'block'
        this.blockShutdown = () => { this.catalog.style.display = 'none' }
        if (this.catalogRendered && this.currentDisc.catalogLoaded) { return }

        const dnameEl = this.catalog.querySelector('h2 span')
        let dname = this.currentDisc.discName.padEnd(16) + ' '
        dname += this.currentDisc.discId.padEnd(2) + ' '
        dname += this.currentDisc.discDOS.padEnd(2)
        dnameEl.textContent = dname

        const catalog = this.currentDisc.getCatalog()
        const catalogEl = this.catalog.querySelector('ul')
        catalogEl.innerHTML = ''
        for (let index = 0; index < catalog.length; index++) {
            const li = document.createElement('li')
            const file = catalog[index]
            let fentry = file.fileSize.toString().padEnd(5)
            fentry += '"' + file.name.padEnd(16) + '" '
            fentry += file.fileType
            li.textContent = fentry
            li.dataset.catalogIndex = index
            catalogEl.appendChild(li)
        }
        this.catalogRendered = true
    }

    async loadDisc(e, file, selection) {
        if (this.currentDisc) { delete this.currentDisc }
        this.currentDisc = new D64(file)
        this.catalogRendered = false
        await this.currentDisc.discLoaded()
        const dname = this.currentDisc.discName
        this.discOptions.setName(dname)
        this.discOptions.selectionsEnable()
        this.discCatalog()
    }

    saveDisc(e) {
        if (!this.currentDisc) { return }
        let discName = this.discOptions.name().trim()
        if (discName === '') { return }
        discName += '.d64'
        const content = this.currentDisc.discBytes()
        const blob = new Blob([content], { type: 'application/octetstream' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = discName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }

    discNameChanged(name) {
        if (!this.currentDisc) { return }
        this.currentDisc.nameDisc(name)
        this.catalogRendered = false
    }

    readWord(data, index) {
        const lo = data[index]
        const hi = data[index+1]
        return hi * 256 + lo
    }

    discFileSelected(e) {
        const catalogIndex = e.target.dataset.catalogIndex
        if (catalogIndex === null || catalogIndex === undefined) { return }
        const fileInfo = this.currentDisc.getFileInfo(catalogIndex)
        if (fileInfo === null || fileInfo.fileType !== 'PRG') { return }
        const fileData = this.currentDisc.getFileData(catalogIndex)

        this.fileOptions.setName(fileInfo.name)

        let fileIdx = 0
        this.startAddress = this.readWord(fileData, fileIdx)
        if (this.startAddress === 0) { this.startAddress = Controls.programStartAddress[this.mode] }
        fileIdx += 2
        let program = ''
        while (fileIdx < fileData.length) {
            // read next line address
            const nla = this.readWord(fileData, fileIdx)
            if (nla === 0) break
            fileIdx += 2
            // read line number
            const lineNo = this.readWord(fileData, fileIdx)
            fileIdx += 2
            program += `${lineNo} `
            // read line content
            let lineBytes = []
            while (fileIdx < fileData.length) {
                const byte = fileData[fileIdx++]
                if (byte === 0) break
                lineBytes.push(byte)
            }
            program += window.tokenizer.detokenizeLine(lineBytes) + '\n'
        }

        window.editor.setProgram(program)
        window.editor.disabled = false
        this.hideBlocker()
    }

    hideBlocker() {
        if (this.blockShutdown) { this.blockShutdown() }
        this.blocker.style.display = 'none'
    }
}

window.addEventListener('load', () => {
    new Controls()
})
