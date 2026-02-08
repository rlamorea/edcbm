class NameMenu {
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
        window.petscii.registerRerenderHandler(this)

        this.inDiacritical = false
    }

    preFontChange() {
        this.inputPetsciiBytes = window.petscii.stringToPetscii(this.input.value)
    }

    postFontChange() {
        this.input.value = window.petscii.petsciiBytesToString(this.inputPetsciiBytes)
    }

    toggleMenu(fromBlocker) {
        if (fromBlocker) {
            this.drop.classList.remove('active')
        } else {
            this.drop.classList.toggle('active')
        }
        const isActive = this.drop.classList.contains('active')
        if (isActive) {
            window.blocker.show(this.menu, 'block', () => { this.toggleMenu(true) })
        } else if (!fromBlocker) {
            window.blocker.hide()
        }
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
        this.input.select()
        this.input.focus()
    }

    cleanDiacriticals() {
        let curpos = this.input.selectionStart
        let cleanValue = ''
        let delNext = false
        for (const char of this.input.value) {
            const charCode = char.codePointAt(0)
            if (Keymap.diacriticals.includes(charCode)) {
                curpos -= 1
                delNext = true
            } else if (delNext) {
                curpos -= 1
                delNext = false
            } else if (Keymap.diacriticalChars.includes(char)) {
                curpos -= 1
            } else {
                cleanValue += char
            }
        }
        this.input.value = cleanValue
        this.input.setSelectionRange(curpos, curpos)
        this.inDiacritical = false
    }

    nameKey(e) {
        const petscii = window.keymap.getPetsciiForKey(e, { 
            noCtrl: true, noNonPet: true, reportTrans: true, 
            passthrough: FileControls.passthroughKeys 
        })
        if (this.inDiacritical && petscii !== Keymap.TRANSFORMER) {
            setTimeout(() => this.cleanDiacriticals(), 20) // wait for OS to insert composed char
            return
        } else if (petscii === Keymap.PASSTHROUGH || petscii === Keymap.TRANSFORMER) { // pass through
            if (e.code === 'Enter') { this.input.blur() }
            return
        } else if (petscii === Keymap.DIACRITICAL) {
            this.inDiacritical = true
            return
        }
        const curpos = this.input.selectionStart
        if (this.input.selectionEnd > this.input.selectionStart) {
            if (this.input.selectionStart === 0 && this.input.selectionEnd === this.input.value.length) {
                this.input.value = '' // clear selection
            } else {
                // delete selected text
                const val = this.input.value
                const start = val.substring(0, this.input.selectionStart)
                const end = val.substring(this.input.selectionEnd)
                this.input.value = start + end
                this.input.setSelectionRange(curpos, curpos)
            }
        }
        e.preventDefault()
        e.stopPropagation()
        if (petscii === 0) { return } // invalid keypress

        let val = this.input.value
        if (petscii) {
            if (val.length >= 16) { return } // max length
            const char = window.petscii.petsciiBytesToString(petscii)
            if (curpos !== val.length) {
                // insert at cursor position
                const start = val.substring(0, this.input.selectionStart)
                const end = val.substring(this.input.selectionStart)
                val = start + char + end
            } else {
                val += char
            }
            this.input.value = val
            this.input.setSelectionRange(curpos + 1, curpos + 1)
        }
    }

    nameChanged() {
        this.input.readOnly = true
        this.input.inert = true
        if (this.inDiacritical) { this.cleanDiacriticals() }
        const name = window.petscii.stringToPetsciiString(this.input.value.trim())
        const handler = this.handlers['namechange']
        if (handler) { handler(name) }
    }

    name(asPetscii = true) {
        let name = this.input.value.trim() || ''
        if (asPetscii) {
            name = window.petscii.stringToPetsciiString(name)
        }
        return name
    }

    setName(name, isPetscii = true) {
        if (isPetscii) {
            name = window.petscii.petsciiStringToString(name || '')
        }
        this.input.value = name || ''
        this.nameChanged()
    }
}

class FileControls {
    constructor() {
        this.blockShutdown = null

        this.machine = 'c128'

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

    setMachine(machine) {
        this.machine = machine
        this.startAddress = machine.startAddress

    }

    newFile(e) {
        this.startAddress = this.startAddress
        window.editor.setProgram('')
        this.fileOptions.editName()
    }

    renameFile(e) {
        this.fileOptions.editName()
    }

    cleanFilename(name, validExt = []) {
        const extLoc = name.lastIndexOf('.')
        let ext = ''
        if (extLoc > 0) {
            ext = name.substring(extLoc + 1)
            name = name.substring(0, extLoc)
            if (validExt.includes(ext.toUpperCase())) {
                ext = ''
            }
        }
        name = name.replace(/\(\d+\)$/, '') // remove (n) suffix
        if (ext) {
            name += '.' + ext
        }
        return name.toUpperCase()
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
                this.startAddress = this.startAddress
            }
            window.editor.setProgram(content)
            window.editor.enableEditor()
            const fname = this.cleanFilename(file.name, ['EPRG'])
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
        window.editor.enableEditor()
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

        window.blocker.show(this.catalog)
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
        if (this.startAddress === 0) { 
            this.startAddress = this.startAddress
        }
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
        window.editor.enableEditor()
        window.blocker.hide()
    }
}

window.addEventListener('load', () => {
    window.fileControls = new FileControls()
})

