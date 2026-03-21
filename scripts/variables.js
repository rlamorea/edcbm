class VariablePanel {
    static MIN_PANEL_WIDTH = 12
    static MAX_PANEL_WIDTH_PERCENT = 0.48
    static MAX_PANEL_WIDTH = null

    static CSS_ROOT_ID = 'edcbm-debug'

    static cbmNumberFormat(value) {
        if (isNaN(value)) { return '' }
        let numText = value.toPrecision(9).toUpperCase()
        // deal with CBM style of no leading 0, and space for positive
        if (numText.startsWith('0.')) {
            numText = ' ' + numText.substring(1)
        } else if (numText.startsWith('-0.')) {
            numText = '-' + numText.substring(2)
        } else if (numText.match(/^\d/)) {
            numText = ' ' + numText
        }
        if (numText === ' .00000000') { numText = ' 0' } // special case that fell out of the "fixes"

        // deal with cbm style of no trailing decimal 0s
        numText = numText.replace(/\.0+($|E)/, '$1')
        numText = numText.replace(/(\.[1-9]+)0+($|E)/, '$1$2')

        return numText
    }

    constructor() {
        this.panel = document.getElementById('debug-variables')
        this.panelShowing = false

        this.toggleButton = document.getElementById('var-panel-toggle')
        this.toggleButton.addEventListener('click', () => { this.togglePanel() })

        this.sortButton = document.getElementById('var-sort')
        this.sortMenu = document.getElementById('var-sort-menu')
        this.sortDropMenu = new DropMenu(this.sortMenu, {
            menubar: this.sortButton.closest('.menubar'),
            drop: this.sortButton,
            selectHandler: (li) => { this.setSortMode(li.dataset.sort) }
        })

        this.showButton = document.getElementById('var-show')
        this.showButton.addEventListener('click', () => { this.toggleShowMode() })
        this.showMode = 'watch'

        this.variableRecency = []
        this.variableMemory = []
        this.watchVariables = window.localStorage.getItem('variableWatch')
        if (this.watchVariables) {
            this.watchVariables = JSON.parse(this.watchVariables)
        } else {
            this.watchVariables = []
        }

        this.panel.addEventListener('click', (e) => { this.panelClicked(e) })

        this.sizer = document.getElementById('debug-var-sizer')
        this.sizerLeft = this.sizer.querySelector('.size-left')
        this.sizerLeft.addEventListener('click', (e) => { this.resizePanel(e) })
        this.sizerRight = this.sizer.querySelector('.size-right')
        this.sizerRight.addEventListener('click', (e) => { this.resizePanel(e) })
        this.panelSize = parseInt(window.localStorage.getItem('variablePanelSize') ?? 22)

        this.togglePanel(window.localStorage.getItem('variablePanel') === 'show')
        this.setSortMode(window.localStorage.getItem('variableSort') ?? 'by-recent')
        this.toggleShowMode(window.localStorage.getItem('variableShow') ?? 'all')
        this.sizePanel()
    }

    clear(clearWatch = false) {
        this.panel.innerHTML = ''
        this.variableMemory = []
        this.variableRecency = []
        if (clearWatch) { this.watchVariables = [] }
    }

    machineChanged() {
        VariablePanel.MAX_PANEL_WIDTH = null
    }

    togglePanel(show = 'toggle') {
        this.panelShowing = (show === 'toggle') ? !this.panelShowing : show
        this.panel.style.display = this.panelShowing ? 'flex' : 'none'
        this.sizer.style.display = this.panelShowing ? 'block' : 'none'
        document.body.dataset.showVars = this.panelShowing
        this.toggleButton.classList.toggle('enabled', this.panelShowing)
        this.sortButton.style.display = this.panelShowing ? 'inline' : 'none'
        this.showButton.style.display = this.panelShowing ? 'inline' : 'none'
        window.localStorage.setItem('variablePanel', this.panelShowing ? 'show' : 'hide')
        if (this.panelShowing && VariablePanel.MAX_PANEL_WIDTH == null) {
            setTimeout(() => { this.sizePanel() }, 50) // wait a bit to get panel size
        }
    }

    setSortMode(newMode) {
        if (this.sortMode) { 
            this.sortMenu.querySelector(`li[data-sort="${this.sortMode}"`).classList.remove('disabled')
        }
        this.sortMode = newMode
        this.sortButton.classList.toggle('by-recent', newMode === 'by-recent')
        this.sortButton.classList.toggle('by-memory', newMode === 'by-memory')
        this.sortButton.classList.toggle('by-a-to-z', newMode === 'by-a-to-z')
        this.sortButton.classList.toggle('by-z-to-a', newMode === 'by-z-to-a')
        this.sortMenu.querySelector(`li[data-sort="${newMode}"`).classList.add('disabled')
        this.sortVariables()
        window.localStorage.setItem('variableSort', this.sortMode)
    }

    toggleShowMode(mode = 'toggle') {
        this.showMode = (mode === 'toggle') ? (this.showMode === 'all' ? 'watch' : 'all') : mode
        this.showButton.classList.toggle('show-watch', this.showMode === 'watch')
        window.localStorage.setItem('variableShow', this.showMode)
        this.showVariables()
    }

    displayVariableValue(varEl, value, type) {
        const valEl = varEl.querySelector('.val')
        if (type === 'str') {
            valEl.innerText = window.petscii.petsciiBytesToString(value)
        } else { // num
            value = parseFloat(value)
            valEl.innerText = VariablePanel.cbmNumberFormat(value)
        }
    }

    highlightVariables(varList = []) {
        this.panel.querySelectorAll('.current').forEach( (e) => { e.classList.remove('current') })
        for (const variable of varList) {
            this.panel.querySelector(`.debug-var[data-var="${variable}"]`)?.classList.add('current')
        }
        this.showVariables()
    }

    displayVariables(variables, lineVariables = []) {
        if (lineVariables.length > 0) {
            for (const lvar of lineVariables.reverse()) {
                const varIdx = this.variableRecency.indexOf(lvar)
                if (varIdx >= 0) { this.variableRecency.splice(varIdx, 1) }
                this.variableRecency.unshift(lvar)
            }
        }
        this.variableMemory = []
        for (const variable in variables) {
            this.variableMemory.push(variable)
            let varEl = this.panel.querySelector(`.debug-var[data-var="${variable}"]`)
            const value = variables[variable]
            const isArray = variable.endsWith('(')
            if (!varEl) {
                varEl = document.createElement('div')
                varEl.className = 'debug-var'
                varEl.classList.toggle('watched', (this.watchVariables.indexOf(variable) >= 0))
                varEl.dataset.var = variable
                const nameEl = document.createElement('span')
                nameEl.className = 'var'
                nameEl.dataset.var = variable
                nameEl.innerText = variable
                varEl.appendChild(nameEl)
                const valEl = document.createElement('span')
                valEl.className = 'val'
                varEl.appendChild(valEl)
                if (isArray) {
                    varEl.classList.add('v-arr')
                    const maxDimension = value.dimensions.length - 1
                    for (let idx = maxDimension; idx >= 0; idx--) {
                        if (idx !== maxDimension) { nameEl.appendChild(document.createTextNode(',')) }
                        const dimension = value.dimensions[idx]
                        const dimInput = document.createElement('input')
                        dimInput.dataset.dimension = idx
                        dimInput.setAttribute('type', 'number')
                        dimInput.setAttribute('min', 0)
                        dimInput.setAttribute('max', dimension - 1)
                        dimInput.style.width = `${Math.max(Math.ceil(Math.log10(dimension)),1)+1}em`
                        dimInput.value = 1
                        nameEl.appendChild(dimInput)
                        dimInput.addEventListener('change', (e) => { this.arrayDimensionChanged(e) })
                    }
                    nameEl.appendChild(document.createTextNode(')'))
                    varEl.dataset.values = JSON.stringify(value.values)
                }
                this.panel.append(varEl)
            }
            let type = (variable.endsWith('$') || variable.endsWith('$(')) ? 'str' : 'num'
            if (isArray) {
                varEl.dataset.type = type
                this.arrayDimensionChanged(null, varEl)
            } else {
                this.displayVariableValue(varEl, value, type)
            }
        }
        this.sortVariables()
        this.highlightVariables(lineVariables)
    }

    arrayDimensionChanged(event, variableElement) {
        const varEl = variableElement ?? event.target.closest('.debug-var')
        const valEl = varEl.querySelector('.val')
        let value = JSON.parse(varEl.dataset.values)
        const type = varEl.dataset.type
        const nameEl = varEl.querySelector('.var')
        const inputs = [...nameEl.querySelectorAll('input')].sort( (a,b) => { return a.dataset.dimension - b.dataset.dimension } )
        for (let dim = 0; dim < inputs.length; dim++) {
            let subscript = 1
            try {
                subscript = parseInt(inputs[dim].value)
            } catch (e) {
                subscript = 1 // just force it!
            }
            const min = parseInt(inputs[dim].getAttribute('min'))
            const max = parseInt(inputs[dim].getAttribute('max'))
            if (subscript < min) { subscript = min }
            if (subscript > max) { subscript = max }
            inputs[dim].value = subscript // put it back no matter what
            value = value[subscript]
        }
        this.displayVariableValue(varEl, value, type)
    }

    sortVariables() {
        let sortOrder = this.variableRecency
        if (this.sortMode === 'by-memory') {
            sortOrder = this.variableMemory
        } else {
            sortOrder = [...this.variableMemory].sort()
            if (this.sortMode === 'by-z-to-a') { sortOrder = sortOrder.reverse() }
        }
        let varEls = this.panel.querySelectorAll('.debug-var')
        let sortIdx = 0
        if (this.watchVariables.length > 0) {
            let newSortOrder = []
            let insIdx = 0
            for (let idx = 0; idx < sortOrder.length; idx++) {
                const variable = sortOrder[idx]
                if (this.watchVariables.indexOf(variable) >= 0) {
                    newSortOrder.splice(insIdx++, 0, variable)
                } else {
                    newSortOrder.push(variable)
                }
            }
            sortOrder = newSortOrder
        }
        for (let idx = 0; idx < sortOrder.length; idx++) {
            this.panel.querySelector(`.debug-var[data-var="${sortOrder[idx]}"]`).style.order = idx
        }
    }

    showVariables() {
        let allEls = []
        allEls = [ ...this.panel.querySelectorAll('.debug-var') ]
        let els = this.showMode === 'all' ? allEls : []
        if (this.showMode === 'watch') {
            els = [ ...this.panel.querySelectorAll('.debug-var.watched') ]
            els = [ ...els, ...this.panel.querySelectorAll('.debug-var.current') ]
        } else {
            allEls = []
        }
        for (const el of allEls) { el.style.display = 'none' }
        for (const el of els) { el.style.display = 'inline-block' }
    }

    panelClicked(event) {
        let varTarget = event.target.closest('.debug-var')
        if (varTarget && event.offsetX <= 18) {
            const variable = varTarget.dataset.var
            varTarget.classList.toggle('watched')
            if (varTarget.classList.contains('watched')) {
                this.watchVariables.push(variable)
                this.sortVariables()
            } else {
                const varIdx = this.watchVariables.indexOf(variable)
                this.watchVariables.splice(varIdx, 1)
                this.showVariables()
            }
            window.localStorage.setItem('variableWatch', JSON.stringify(this.watchVariables))
        } else if (event.target.className.contains('val')) {
            // TODO: value display
        }
    }

    resizePanel(event) {
        const target = event.target.closest('svg')
        if (target.classList.contains('size-left')) {
            this.panelSize = this.panelSize + 1
        } else { // right
            this.panelSize = this.panelSize - 1
        }
        this.sizePanel()
    }

    sizePanel() {
        let style = document.getElementById(VariablePanel.CSS_ROOT_ID)
        if (!style) {
            style = document.createElement('style')
            style.id = VariablePanel.CSS_ROOT_ID
            document.head.appendChild(style)
        }           
        let css = ':root {';
        css += `--variable-pane-width: ${this.panelSize};`
        css += '}'
        style.textContent = css

        if (VariablePanel.MAX_PANEL_WIDTH == null) {
            const panelWidth = this.panel.offsetWidth
            if (panelWidth === 0) { return } // come back later
            const editorPane = document.getElementById('editor-pane')
            const editorPaneWidth = editorPane.offsetWidth * VariablePanel.MAX_PANEL_WIDTH_PERCENT
            const emWidth = panelWidth / this.panelSize
            VariablePanel.MAX_PANEL_WIDTH = Math.floor(editorPaneWidth / emWidth)
            if (this.panelSize > VariablePanel.MAX_PANEL_WIDTH) {
                this.panelSize = VariablePanel.MAX_PANEL_WIDTH
                return this.sizePanel() // reset the css
            }
        }
        this.sizerLeft.classList.toggle('disabled', this.panelSize === VariablePanel.MAX_PANEL_WIDTH)
        this.sizerRight.classList.toggle('disabled', this.panelSize === VariablePanel.MIN_PANEL_WIDTH)
        window.localStorage.setItem('variablePanelSize', this.panelSize)
    }
}
