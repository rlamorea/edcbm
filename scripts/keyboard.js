class KeyboardWindow {
    static CapsCodes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    static SmallLabelMininum = 5
    static PrependKeys = {
        'key': '',
        'shft' : 's',
        'cbm': 'a',
        'ctrl' : 'ca'
    }
    static CSS_ROOT_ID = 'vkeyboard-palette'

    constructor() {
        this.keyboardShowing = false
        this.kbButton = document.getElementById('keyboard')
        this.kbButton.addEventListener('click', () => this.toggleKeyboard() )

        this.keyboard = document.getElementById('vkeyboard')
        this.header = this.keyboard.querySelector('h2')
        this.machineName = this.header.querySelector('span')
        this.header.querySelector('button.close').addEventListener('click', () => this.toggleKeyboard(false) )

        this.loadedKeyboards = {}
        this.loadedKeyboard = null

        this.virtualKeyboard = this.keyboard.querySelector('.kb-layout')
        this.hostKeys = {
            'fn': this.keyboard.querySelector('.key-host-fn'),
            'shift': this.keyboard.querySelector('.key-host-shift'),
            'control': this.keyboard.querySelector('.key-host-control'),
            'alt': this.keyboard.querySelector('.key-host-alt'),
            'any': this.keyboard.querySelector('.key-host-any')
        }
        this.virtualToggles = {
            'caps': false, // caps comes first so it can be overridden by shift lock
            'shft': false,
            'cbm': false,
            'ctrl': false,
        }

        this.repeat = this.keyboard.querySelector('#key-repeat')
        this.keyboard.querySelector('#rpt-mode-reset').addEventListener('click', () => { this.repeat.value = 1 })

        this.toggleKeyboard(false)
    }

    async setMachine(machine) {
        this.machineName.innerText = machine.display || machine.name
        for (const kb in this.loadedKeyboards) {
            this.keyboard.classList.remove(`kb-${kb}`)
        }
        const kbName = machine.kb ?? machine.name
        if (!(kbName in this.loadedKeyboards)) {
            const keyboardFile = `/scripts/keyboards/${kbName}.html`
            const linkElement = document.createElement('link')
            linkElement.href = `/styles/keyboards/${kbName}.css?x=${Math.floor(Math.random()*10000)}`
            linkElement.type = 'text/css'
            linkElement.rel = 'stylesheet'
            document.getElementsByTagName('head')[0].appendChild(linkElement)
            try {
                const response = await fetch(`${keyboardFile}?x=${Math.floor(Math.random()*10000)}`)
                this.loadedKeyboards[kbName] = await response.text()
            } catch (error) {
                console.log(`Unable to load keyboard html for ${machine.name}`, error)
                return
            }
        }
        this.virtualKeyboard.innerHTML = this.loadedKeyboards[kbName]
        const kbData = this.virtualKeyboard.querySelector('.kb-layout .kb')?.dataset ?? {}

        let style = document.getElementById(KeyboardWindow.CSS_ROOT_ID)
        if (!style) {
            style = document.createElement('style')
            style.id = KeyboardWindow.CSS_ROOT_ID
            document.head.appendChild(style)
        }
        let css = `:root {
            --key-case-color: ${kbData.caseColor || '#b2ad9d'};
            --key-color: ${kbData.keyColor || '#382a16'};
            --key-text-color: ${kbData.keyText || 'white'};
        }
        `
        style.textContent = css;

        this.keyboard.classList.add(`kb-${kbName}`)
        this.prepKeys()
    }

    toggleKeyboard(state = null) {
        if (state === null) {
            this.keyboardShowing = !this.keyboardShowing
        } else {
            this.keyboardShowing = state
        }
        this.keyboard.style.display = this.keyboardShowing ? 'block' : 'none'
        this.kbButton.classList.toggle('enabled', this.keyboardShowing)
    }

    prepKeys() {
        this.virtualKeyboard.querySelectorAll('key').forEach(key => {
            key.addEventListener('mouseover', (e) => this.keyOver(e))
            key.addEventListener('mouseout', (e) => this.keyOut(e))
            key.addEventListener('click', (e) => this.keyClicked(e))
            this.toggleKey(key, 'key')
        })
    }

    keyOver(e) {
        this.keyOut() // clear host keys
        const keyData = e.target.closest('key').dataset
        if (keyData.toggle) { return } // toggle keys don't get mappings

        let toggle = this.getToggle()
        if (toggle === 'caps') {
            toggle = (KeyboardWindow.CapsCodes.indexOf(baseCode) >= 0) ? 'shft' : 'key'
        }
        let hostKey = keyData[`${toggle}Host`]
        let prependKeys = hostKey ? '' : KeyboardWindow.PrependKeys[toggle]
        hostKey = hostKey || keyData.keyHost || keyData.key || ''
        let dotIdx = hostKey.indexOf('.')
        if (dotIdx === hostKey.length - 1) { dotIdx = -1 }
        if (dotIdx < 0 && prependKeys.length > 0) { 
            hostKey = `.${hostKey}` 
            dotIdx = 0
        }
        dotIdx += prependKeys.length
        hostKey = prependKeys + hostKey
        if (dotIdx > 0) {
            const toggleCodes = hostKey.substring(0, dotIdx)
            hostKey = hostKey.substring(dotIdx + 1)
            for (let codeIdx = 0; codeIdx < toggleCodes.length; codeIdx++) {
                switch (toggleCodes[codeIdx]) {
                    case 'f' : this.hostKeys['fn'].classList.toggle('active', true); break
                    case 's' : this.hostKeys['shift'].classList.toggle('active', true); break
                    case 'c' : this.hostKeys['control'].classList.toggle('active', true); break
                    case 'a' : this.hostKeys['alt'].classList.toggle('active', true); break
                }
            }
        }
        const barIdx = hostKey.lastIndexOf('|')
        if (barIdx > 0) {
            const pre = hostKey.substring(0, barIdx)
            hostKey = `${pre}<br/>${hostKey.substring(barIdx+1)}`
            this.hostKeys['any'].classList.add('split')
        }
        this.hostKeys['any'].innerHTML = hostKey
        this.hostKeys['any'].classList.add('active')
    }

    keyOut(e) {
        for (const hostKey in this.hostKeys) {
            this.hostKeys[hostKey].classList.remove('active', 'split')
        }
        this.hostKeys['any'].innerHTML = ''
    }

    keyClicked(e) {
        const key = e.target.closest('key')
        const keyData = key.dataset
        if (keyData.toggle) {
            this.setToggle(keyData.toggle, keyData.toggleLock)
            return
        }
        const repeats = parseInt(this.repeat.value)
        const repeatMode = this.keyboard.querySelector('input[name="rpt-mode"]:checked').value
        if (repeatMode === 'reset') {
            this.repeat.value = 1
        }

        // TODO: this will need to know which active editor when moving to split BASIC/ASM
        window.editor.insertInto(keyData.sendCode.repeat(repeats))
    }

    getToggle() {
        let currentToggle = null
        let lockedToggle = null
        for (const toggle in this.virtualToggles) {
            const toggleState = this.virtualToggles[toggle]
            if (toggleState === true) {
                currentToggle = toggle
            } else if (toggleState === 'lock') {
                lockedToggle = toggle
            }
        }
        if (lockedToggle && !currentToggle) { currentToggle = lockedToggle }
        return currentToggle || 'key'
    }

    setToggle(toggling, locking) {
        let newToggle = 'key'
        let lockedToggle = null
        // first disable any existing toggle -- reverting back to any 'locked' toggle case
        for (const toggle in this.virtualToggles) {
            const toggleState = this.virtualToggles[toggle]
            if (toggling === toggle) {
                if (locking && toggleState === 'lock') {
                    this.virtualToggles[toggle] = false
                } else if (locking && !toggleState) {
                    this.virtualToggles[toggle] = 'lock'
                    newToggle = toggle
                } else if (toggleState) {
                    this.virtualToggles[toggle] = false
                    newToggle = 'locked'
                } else {
                    this.virtualToggles[toggle] = true
                    newToggle = toggle
                }
            } else { // unmatching cases
                if (toggleState === 'lock') {
                    lockedToggle = toggle
                } else if (toggleState) {
                    this.virtualToggles[toggle] = false
                }
            }
        }
        if (newToggle === 'locked') { newToggle = lockedToggle || 'key' }
        this.virtualKeyboard.querySelectorAll('key').forEach((key) => { this.toggleKey(key, newToggle) })
    }

    getLabelLength(label) {
        let len = label.length
        if (label.indexOf('&') >= 0) {
            let tempLabel = label.replace(/&.*;/g, 'x')
            len = tempLabel.length
        }
        return len
    }

    cleanLabel(label) {
        let labelClass = null
        let maxWidth = label.length
        let maxWidthCutoff = KeyboardWindow.SmallLabelMininum

        const barIdx = label.indexOf('|')
        if (barIdx > 0) {
            const l1 = label.substring(0, barIdx).trim()
            const l2 = label.substring(barIdx + 1).trim()
            label = l1 + '<br/>' + label.substring(barIdx + 1)
            maxWidth = Math.max(this.getLabelLength(l1), this.getLabelLength(l2))
        } else {
            maxWidth = this.getLabelLength(label)
        }

        // check for cbm
        if (maxWidth === 1) {
            const keyCode = label.codePointAt(0)
            if (keyCode >= 0xE000 && keyCode <= 0xE1FF) {
                labelClass = 'cbm'
            }
        } else if (maxWidth >= maxWidthCutoff) {
            labelClass = 'k-label-sm'
        } else {
            labelClass = 'k-label'
        }

        return { cleanLabel: label.trim(), labelClass }
    }

    toggleKey(key, toggle) {
        if (key.classList.contains('k-disabled')) { return }

        key.classList.remove('k-unavail', 'k-toggled')
        const keyData = key.dataset
        if (keyData.toggle) {
            const toggleLocked = this.virtualToggles[keyData.toggle] === 'lock'
            if (keyData.toggleLock) { // this is the locking key -- show it as locked if locked
                key.classList.toggle('k-toggled', toggleLocked)
            } else if (toggleLocked) {
                key.classList.add('k-toggled', 'k-unavail')
            } else if (keyData.toggle === toggle) {
                key.classList.add('k-toggled')
            }
            return
        }
        // deal with regular keys
        key.classList.remove('cbm', 'k-label', 'k-label-sm')

        const baseCode = keyData.key
        let keyCode = baseCode
        let label = baseCode
        // deal with caps case
        if (toggle === 'caps') {
            toggle = (KeyboardWindow.CapsCodes.indexOf(baseCode) >= 0) ? 'shft' : 'key'
        }
        // determine state by seeing if there is a code associated with the current state
        if (toggle in keyData) {
            keyCode = keyData[toggle]
            label = keyData[`${toggle}Label`] || keyCode
        } else {
            key.dataset.sendCode = null
            key.classList.add('k-unavail')
            label = keyData['keyLabel'] || keyCode
        }

        key.dataset.sendCode = keyCode
        const { cleanLabel, labelClass } = this.cleanLabel(label)
        if (labelClass) { key.classList.add(labelClass) }
        if (cleanLabel !== '{keep}') {
            key.innerHTML = cleanLabel
        }
    }
}

window.addEventListener('load', () => { 
    window.virtualKeyboard = new KeyboardWindow()
}) 