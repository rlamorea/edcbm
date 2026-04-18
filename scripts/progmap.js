class ProgramMap {
    constructor(editor) {
        this.editor = editor
        this.editorDiv = editor.editor

        this.clear() 
    }

    clear() {
        this.lineLookup = {}
        this.reverseLineLookup = {}
        this.lineInfo = {}
        this.variableReferences = {}
    }

    getLineStepAddresses(lineAddr, lineLength, tokens) {
        lineAddr += 4 // skip next address and line number
        let breakpoints = { }
        let dataPoints = { }
        let lastBreakpoint = null
        for (const token of tokens) {
            const addr = lineAddr + (token.byteOffset ?? 0)
            if (token.token === 'data-val') {
                dataPoints[addr] = { address: addr, start: token.start, end: token.end }
                continue
            }
            if (![ 'line-number', 'colon', 'then-split', 'else-split' ].includes(token.token)) { continue }
            if (lastBreakpoint) { 
                if (token.token === 'else-split') { // destroy the breakpoint for the preceding colon
                    delete breakpoints[lastBreakpoint.address]
                } else {
                    lastBreakpoint.end = token.start + 1 
                }
            }
            breakpoints[addr] = { address: addr, start: token.end + 2 } // +1 to move past token, +1 due to 1-based column indexes in editor
            lastBreakpoint = breakpoints[addr]
        }
        lastBreakpoint.end = lineLength + 1
        return { breakpoints, dataPoints }
    }

    // options:
    //   linesOnly
    parseContent(startAddress, options = {}) {
        this.clear()
        const lines = this.editorDiv.getValue().split('\n')
        let editorLine = 1
        let lineAddress = startAddress
        let precedingCommentCount = 0
        for (const line of lines) {
            let lineNo = null
            if (options.lineNumbersOnly) {
                const lineNumber = lineValue.match(/^(\d+)/)
                if (lineNumber) {
                    lineNo = parseInt(lineNumber)
                }
            } else {
                const { byteArray, lineNumber, variables, tokens } = window.tokenizer.tokenizeLine(line)
                if (byteArray.length > 0) {
                    const { breakpoints, dataPoints } = this.getLineStepAddresses(lineAddress, line.length, tokens)
                    this.lineInfo[lineNo] = {
                        length: line.length,
                        breakpoints: breakpoints,
                        datapoints: datapoints,
                        variables: variables
                    }
                    lineAddress+= byteArray.length + 3 // 3 was worked out by trial-and-error
                    lineNo = lineNumber
                }
            }
            if (lineNo) {
                this.lineLookup[lineNo] = editorLine
                this.reverseLineLookup[editorLine] = lineNo
                this.lineInfo[lineNo].precedingCommentCount = precedingCommentCount
                precedingCommentCount = 0
            } else {
                precedingCommentCount += 1
            }
            editorLine += 1
        }
    }

    getLineInfoForLineNumber(lineNo) {
        return this.lineInfo[lineNo]
    }

    getLineInfoForEditorLine(editorLine) {
        const lineNo = this.reverseLineLookup(editorLine)
        return lineNo ? this.lineInfo[lineNo] : null
    }

    // addLine(line, editorLine)
    // moves line if out of position

    // removeLine(editorLine)
    
}