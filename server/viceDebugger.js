import { ViceCommand, ViceResponse } from './viceComm.js'
import { ViceConnection } from './vice.js'
import config from './config.js'

export class ViceDebugger {
    constructor(connection, socket) {
        this.vice = connection
        this.socket = socket

        this.breakpointLines = []

        this.freeRunning = false
    }

    close() {
        if (this.vice) { 
            this.stopDebugger() 
        } else if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    handleMessage(message) {
        if (message.toString() === 'ping') { // handshake
            this.socket.send('pong')
            return
        }
        const data = JSON.parse(message.toString() || "{}")
        let result = {}

        const command = data.command
        switch (command) {
            case 'start' : this.startDebugger(data); break;
            case 'stop': this.stopDebugger(data); break;
            case 'step': this.doStep(data); break;
            case 'pause': this.doPause(data); break;
            case 'continue': this.doContinue(data); break;
            case 'breakpoints': this.updateBreakPoints(data); break;
        }

        return JSON.stringify(result)
    }

    async startDebugger(data) {
        if (!data.restart) {
            const machine = data.executeMachine
            //const programBytes = Uint8Array.fromBase64(req.body.programBytes) // NOT SUPPORTED BY NODEJS YET!
            const programBytes = [ ...Buffer.from(data.programBytes, 'base64') ].splice(2) // cut off the address bytes from the program
            console.log('start', data.startAddress, 'programBytes', programBytes)

            await this.vice.launchViceForMachine(machine, data)
            await this.vice.loadBASICProgram(programBytes, data.startAddress)
            const { execCheckpoint, stopCheckpoints } = await this.vice.setUpforBASICBreak()
            this.execCheckpoint = execCheckpoint
            this.stopCheckpoints = stopCheckpoints
            this.programStartAddress = data.startAddress
            this.programBytes = programBytes
        }
        this.breakpointLines = data.breakpoints
        if (this.breakpointLines.length > 0) {
            this.freeRunning = true
        }
        await this.vice.runBASICProgram()
        this.socket.send(JSON.stringify({ status: 'running' }))
        this.skipNextLineBreak = true
        if (data.restart) {
            this.vice.startWaiting() // NOTE: restart has been disabled, and might not be viable
        } else {
            this.vice.startWaiting((response) => { this.basicCheckpointHit(response) })
        }
    }

    async basicCheckpointHit(checkpoint, response) {
        const machine = this.vice.machineData
        if (checkpoint !== this.execCheckpoint) {
            let message = { status: 'ended' }
            const { variables, dataLine, dataAddress } = await this.vice.getVariableValues(this.programStartAddress, this.programBytes)
            message = { ...message, variables, dataLine, dataAddress }
            this.socket.send(JSON.stringify(message))
            await this.vice.sendCommand(new ViceCommand('execrun'))
            this.vice.startWaiting()
            return
        }
        if (this.skipNextLineBreak) { // still getting started, ignore
            this.skipNextLineBreak = false
            await this.vice.sendCommand(new ViceCommand('execrun'))
            this.vice.startWaiting()
            return
        }
        // look up line number
        const lineData = await this.vice.sendCommand(new ViceCommand('memget', {
            startAddress: machine.exec.lookup.line,
            endAddress: machine.exec.lookup.line + 1,
            bankId: machine.exec.lookup.bank ?? 0
        }))
        const lineNo = ViceResponse.parseInt(lineData.response().memory)
        // look up break address
        const addrData = await this.vice.sendCommand(new ViceCommand('memget', {
            startAddress: machine.exec.lookup.addr,
            endAddress: machine.exec.lookup.addr + 1,
            bankId: machine.exec.lookup.bank ?? 0
        }))
        const address = ViceResponse.parseInt(addrData.response().memory)
        if (this.breakpointLines.includes(lineNo)) { this.freeRunning = false }
        let message = { status: 'checkpoint', reason: 'step', lineNo, address, info: this.freeRunning }
        if (!this.freeRunning) {
            const { variables, dataLine, dataAddress } = await this.vice.getVariableValues(this.programStartAddress, this.programBytes)
            message = { ...message, variables, dataLine, dataAddress }
        }
        this.socket.send(JSON.stringify(message))
        if (this.freeRunning) {
            await this.vice.sendCommand(new ViceCommand('execrun'))
            this.vice.startWaiting()
        }
    }

    stopDebugger(data) {
        this.vice.stopWaiting(true)
        console.log('shutting down')
        try {
            this.vice.shutDown()
            this.vice = null
        } catch (e) {
            console.log('shut down error', e)
        }
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    async doStep(data) {
        this.updateBreakPoints(data)
        this.freeRunning = false
        await this.vice.sendCommand(new ViceCommand('execrun'))
        this.vice.startWaiting()
    }

    async doPause(data) {
        this.freeRunning = false
    }

    async doContinue(data) {
        this.updateBreakPoints(data)
        this.freeRunning = true
        await this.vice.sendCommand(new ViceCommand('execrun'))
        this.vice.startWaiting()
    }

    updateBreakPoints(data) {
        if ('breakpoints' in data) {
            this.breakpointLines = data.breakpoints
        }
    }
}