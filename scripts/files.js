class NameMenu {
    static passthroughKeys = [ 
        'Enter', 'Esc', 'Tab', // exit keys
        'Backspace', 'Home', 'End', // edit keys
        'ArrowLeft', 'ArrowRight', // cursor keys
    ]

    constructor(id, parent, handlers) {
        this.id = id
        this.parent = parent
        this.handlers = handlers

        this.input = document.getElementById(this.id)
        this.drop = document.getElementById(this.id + 'drop')
        this.menu = document.getElementById(this.id + 'menu')

        this.input.readOnly = true
        this.input.inert = true
        this.input.addEventListener('blur', () => { this.nameChanged() })
        this.input.addEventListener('keydown', (e) => { this.nameKey(e) })

        this.selections = {}
        this.dropMenu = new DropMenu(this.menu, {
            drop: this.drop,
            selectHandler: (li) => { this.selectionMade(li) },
            closeHandler: (reason) => { this.menuClosed(reason) },
            changeHandler: (li, event) => { this.selectionFile(li, event) }
        })

        window.petscii.registerRerenderHandler(this)

        this.inDiacritical = false
    }

    preFontChange() {
        if (this.input.value.trim() === '') { return }
        this.inputPetsciiBytes = window.petscii.stringToPetscii(this.input.value)
    }

    postFontChange() {
        this.input.classList.toggle('f-lc', window.petscii.charSet === 'lU')
        if ((this.inputPetsciiBytes || '') === '') { return }
        this.input.value = window.petscii.petsciiBytesToString(this.inputPetsciiBytes)
    }

    menuClosed(reason) {
        this.drop.blur()
    }

    selectionMade(li) {
        const handler = this.handlers[li.dataset.name]
        if (handler) { handler(li) }
    }

    selectionFile(li, event) {
        if (event.target.files.length === 0) { return }
        const file = event.target.files[0]
        const handler = this.handlers[li.dataset.name]
        if (handler) { handler(event, file, li)}
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
        this.nameAction = ''
    }

    nameKey(e) {
        const petscii = window.keymap.getPetsciiForKey(e, { 
            noCtrl: true, noNonPet: true, reportTrans: true, 
            passthrough: NameMenu.passthroughKeys 
        })
        if (this.inDiacritical && petscii !== Keymap.TRANSFORMER) {
            setTimeout(() => this.cleanDiacriticals(), 20) // wait for OS to insert composed char
            return
        } else if (petscii === Keymap.PASSTHROUGH || petscii === Keymap.TRANSFORMER) { // pass through
            if (e.code === 'Enter' || e.code === 'Esc' || e.code === 'Tab') { this.input.blur() }
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

        this.machine = null

        this.file = null
        this.fileOptions = new NameMenu('fname', this, {
            'new' : (li) => { this.newFile(li) },
            'rename': (li) => { this.renameFile(li) },
            'load-edcbm-file': (li, f, s) => { this.loadEdcbmFile(li, f, s) },
            'load-prg': (li, f, s) => { this.loadPrgFile(li, f, s) },
            'load-from-disk': (li) => { this.loadFromDisk(li) },
            'save-edcbm-file': (li) => { this.saveEdcbmFile(li) },
            'save-prg': (li) => { this.savePrgFile(li) },
            'save-to-disk': (li) => { this.saveToDisk(li) },
            'namechange': (n) => { this.fileNameChanged(n) }
        })

        this.disk = null
        this.catalogRendered = false
        this.diskOptions = new NameMenu('dname', this, {
            'new': (e) => { this.newDisk(e) },
            'rename': (e) => { this.renameDisk(e) },
            'catalog': (e) => { this.diskCatalog(e) },
            'load-d64': (e, f, s) => { this.loadDisk(e, f, s) },
            'save-d64': (e) => { this.saveDisk(e) },
            'namechange': (n) => { this.diskNameChanged(n) }
        })

        this.catalog = document.getElementById('catalog')
        this.catalog.style.display = 'none'
        this.catalogLoaded = false
        this.catalogRendered = false
        this.catalog.querySelector('ul').addEventListener('click', (e) => { this.diskFileSelected(e) })

        window.petscii.registerRerenderHandler(this)

        this.namingAction = ''
    }

    init() {
        const programName = window.localStorage.getItem('programName')
        if (programName) {
            this.fileOptions.setName(programName)
        }
        const currentDisk = window.localStorage.getItem('currentDisk')
        if (currentDisk) {
            const diskBytes = Uint8Array.fromBase64(currentDisk)
            this.currentDisk = new D64(diskBytes)
            this.diskOptions.setName(this.currentDisk.diskName)
            this.diskOptions.selectionsEnable()
        }
    }

    preFontChange() {
        this.catalogRendered = false
    }

    setMachine(machine) {
        this.machine = machine
        this.startAddress = Machines[machine].startAddress
    }

    newFile(e) {
        this.startAddress = Machines[this.machine].startAddress
        this.namingAction = 'new'
        window.editor.enableEditor(false)
        this.fileOptions.editName()
    }

    renameFile(e) {
        this.fileOptions.editName()
        this.namingAction = 'rename'
        window.editor.enableEditor(false)
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

    loadEdcbmFile(e, file, selection) {
        const reader = new FileReader()
        reader.onload = () => {
            let content = reader.result
            let sa = content.match(/^`` SA\: *(\d+)/)
            if (sa) {
                this.startAddress = parseInt(sa[1])
                content = content.substring(content.indexOf('\n')).trim()
            } else {
                this.startAddress = Machines[this.machine].startAddress
            }
            window.editor.setProgram(content)
            window.editor.enableEditor()
            const fname = this.cleanFilename(file.name, ['EDCBM'])
            this.fileOptions.setName(fname)
            window.localStorage.setItem('programName', fname)
        }
        reader.readAsText(file)
    }

    loadPrgFile(e, file, selection) {
        const reader = new FileReader()
        reader.onload = () => {
            const fname = this.cleanFilename(file.name, ['PRG'])
            this.fileOptions.setName(fname)
            window.localStorage.setItem('programName', fname)

            const data = new Uint8Array(reader.result)
            // NOTE: we are going to assume BASIC and use machine default start address
            //const startAddress = data[0] + (data[1] << 8)
            this.loadFileBytes(data)
        }
        reader.readAsArrayBuffer(file)
    }

    loadFromDisk(e) {
        this.diskCatalog()
    }

    saveEdcbmFile(li) {
        let fileName = this.fileOptions.name().trim()
        if (fileName === '') { return }
        fileName += '.EDCBM'
        const content = "`` SA:" + this.startAddress.toString() + '\n' + window.editor.getProgram()
        const blob = new Blob([content], { type: 'text/plain' })
        this.saveBlobFile(blob, fileName)
    }

    savePrgFile(li) {
        let fileName = this.fileOptions.name().trim()
        if (fileName === '') { return }
        fileName += '.PRG'
        const bytes = window.editor.getProgramBytes(this.startAddress)
        if (bytes.length === 0) { return }
        const blob = new Blob([bytes], { type: 'application/octetstream' })
        this.saveBlobFile(blob, fileName)
    }

    saveBlobFile(blob, fileName) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName.toLowerCase()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }

    saveToDisk(e) {
        if (!this.currentDisk) { return }
        let fileName = this.fileOptions.name().trim()
        if (fileName === '') { return }
        const bytes = window.editor.getProgramBytes(this.startAddress)
        if (bytes.length === 0) { return }
        this.currentDisk.writeFileData(fileName, bytes)
        window.localStorage.setItem('currentDisk', this.currentDisk.diskBytes().toBase64())
        this.catalogRendered = false
    }

    fileNameChanged(name) {
        const hasName = name.length > 0
        const disabled = hasName ? [ ] : [ 'rename', 'save-prg', 'save-to-disk' ]
        this.fileOptions.selectionsEnable(disabled)
        if (this.namingAction === 'new') { window.editor.setProgram('') }
        window.localStorage.setItem('programName', name)
        window.editor.enableEditor()
    }

    newDisk(e) {
        this.diskOptions.editName()
        if (this.currentDisk) { delete this.currentDisk }
        this.currentDisk = new D64()
        window.localStorage.setItem('currentDisk', this.currentDisk.diskBytes().toBase64())
        this.catalogRendered = false
        this.diskOptions.selectionsEnable()
    }

    renameDisk(e) {
        this.diskOptions.editName()
    }

    diskCatalog(e) {
        if (!this.currentDisk) { return }

        window.blocker.show(this.catalog)
        if (this.catalogRendered && this.currentDisk.catalogLoaded) { return }

        const dnameEl = this.catalog.querySelector('h2 span')
        let dname = window.petscii.petsciiStringToString(this.currentDisk.diskName).padEnd(16) + ' '
        dname += window.petscii.petsciiStringToString(this.currentDisk.diskId).padEnd(2) + ' '
        dname += window.petscii.petsciiStringToString(this.currentDisk.diskDOS).padEnd(2)
        dnameEl.textContent = dname

        const catalog = this.currentDisk.getCatalog()
        const catalogEl = this.catalog.querySelector('ul')
        catalogEl.innerHTML = ''
        for (let index = 0; index < catalog.length; index++) {
            const li = document.createElement('li')
            const file = catalog[index]
            let fentry = file.fileSize.toString().padEnd(5)
            fentry += '"' + window.petscii.petsciiStringToString(file.name).padEnd(16) + '" '
            fentry += window.petscii.petsciiStringToString(file.fileType)
            li.textContent = fentry
            li.dataset.catalogIndex = index
            catalogEl.appendChild(li)
        }
        this.catalogRendered = true
    }

    async loadDisk(e, file, selection) {
        if (this.currentDisk) { delete this.currentDisk }
        this.currentDisk = new D64(file)
        this.catalogRendered = false
        await this.currentDisk.diskLoaded()
        window.localStorage.setItem('currentDisk', this.currentDisk.diskBytes().toBase64())
        const dname = this.currentDisk.diskName

        this.diskOptions.setName(dname)
        this.diskOptions.selectionsEnable()
        this.diskCatalog()
    }

    saveDisk(e) {
        if (!this.currentDisk) { return }
        let diskName = this.diskOptions.name().trim()
        if (diskName === '') { return }
        diskName += '.d64'
        const content = this.currentDisk.diskBytes()
        const blob = new Blob([content], { type: 'application/octetstream' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = diskName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(link.href)
    }

    diskNameChanged(name) {
        if (!this.currentDisk) { return }
        this.currentDisk.nameDisk(name)
        window.localStorage.setItem('currentDisk', this.currentDisk.diskBytes().toBase64())
        this.catalogRendered = false
    }

    readWord(data, index) {
        const lo = data[index]
        const hi = data[index+1]
        return hi * 256 + lo
    }

    diskFileSelected(e) {
        const catalogIndex = e.target.dataset.catalogIndex
        if (catalogIndex === null || catalogIndex === undefined) { return }
        const fileInfo = this.currentDisk.getFileInfo(catalogIndex)
        if (fileInfo === null || fileInfo.fileType !== 'PRG') { return }
        const fileData = this.currentDisk.getFileData(catalogIndex)

        this.fileOptions.setName(fileInfo.name)

        this.loadFileBytes(fileData)
    }

    loadFileBytes(fileData) {
        let fileIdx = 0
        this.startAddress = this.readWord(fileData, fileIdx)
        if (this.startAddress === 0) { 
            this.startAddress = Machines[this.machine].startAddress
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

