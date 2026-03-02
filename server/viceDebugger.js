import { ViceCommand, ViceResponse } from './viceComm.js'
import { ViceConnection } from './vice.js'
import config from './config.js'

export class ViceDebugger {
    constructor(connection, socket) {
        this.vice = connection
        this.socket = socket

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
        }

        return JSON.stringify(result)
    }

    async startDebugger(data) {
        if (!data.restart) {
            const machine = data.executeMachine
            //const programBytes = Uint8Array.fromBase64(req.body.programBytes) // NOT SUPPORTED BY NODEJS YET!
            const programBytes = [ ...Buffer.from(data.programBytes, 'base64') ].splice(2) // cut off the address bytes from the program
            console.log('start', data.startAddress, 'programBytes', programBytes)

            await this.vice.launchViceForMachine(machine)
            await this.vice.loadProgram(programBytes, data.startAddress)
            const { execCheckpoint, stopCheckpoint } = await this.vice.setUpforBASICBreak()
            this.execCheckpoint = execCheckpoint
            this.stopCheckpoint = stopCheckpoint
        }
        await this.vice.runBASICProgram()
        this.socket.send(JSON.stringify({ status: 'running' }))
        this.skipNextLineBreak = true
        if (data.restart) {
            this.vice.startWaiting()
        } else {
            this.vice.startWaiting((response) => { this.basicCheckpointHit(response) })
        }
    }

    async basicCheckpointHit(checkpoint, response) {
        if (checkpoint === this.stopCheckpoint) {
            this.socket.send(JSON.stringify({ status: 'ended' }))
            await this.vice.sendCommand(new ViceCommand('execrun'))
            return
        }
        // look up line number
        const machine = this.vice.machineData
        const lineData = await this.vice.sendCommand(new ViceCommand('memget', {
            startAddress: machine.exec.lookup.line,
            endAddress: machine.exec.lookup.line + 1,
            bankId: machine.exec.lookup.bank ?? 0
        }))
        const memory = lineData.response().memory
        const lineNo = ViceResponse.parseInt(memory)
        if (this.skipNextLineBreak) { // still getting started, ignore
            this.skipNextLineBreak = false
            await this.vice.sendCommand(new ViceCommand('execrun'))
            this.vice.startWaiting()
            return
        }
        this.socket.send(JSON.stringify({ status: 'checkpoint', reason: 'line', lineNo, info: this.freeRunning }))
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
        await this.vice.sendCommand(new ViceCommand('execrun'))
        this.vice.startWaiting()
    }

    async doPause(data) {
        this.freeRunning = false
    }

    async doContinue(data) {
        this.freeRunning = true
        await this.vice.sendCommand(new ViceCommand('execrun'))
        this.vice.startWaiting()
    }
}