import net from 'net'
import { ViceCommand, ViceResponse } from './viceDebugger.js'
import { spawn } from 'child_process'

// TODO: remove the default here
const VICE_ROOT = process.env.VICE_ROOT || '/Applications/vice-arm64-gtk3-3.9/bin'
const VICE_DEFAULT_PORT = 6502
const RETRY_DELAY = 2000 // 2 seconds
const MAX_RETRIES = 5
const VICE_DEBUG = true

export class ViceConnection {
    static machines = {
        'c128': { 
            launcher: 'x128', 
            check: { addresses: [ 0x41cf, 0x41d2 ], values: [ 0x56, 0x37, 0x2e, 0x30] },
            exec: { break: 0x4b41, lookup: [ 0x3b, 0x3e] },
            startOfBasic: 0x2d          
        },
        'c64': {
            launcher: 'x64sc',
            check: { addresses: [ 0xe488, 0xe489 ], values: [ 0x36, 0x34 ] },
            exec: { break: 0xa7ef, lookup: [ 0x39, 0x7b ] },
            startOfBaskc: 0x2b
        },
        'c16': { 
            launcher: 'xplus4', args: '--model c16',
            check: { addresses: [ 0x80df, 0x80e4 ], values: [ 0x56, 0x33, 0x2e, 0x35, 0x20, 0x31 ] },
            exec: { break: 0x8c27, lookup: [ 0x39, 0x3c ] },
            startOfBasic: 0x2b
         },
        'plus4': { 
            launcher: 'xplus4', args: '--model plus4',
            check: { addresses: [ 0x80df, 0x8fe4 ], values: [ 0x56, 0x33, 0x2e, 0x35, 0x20, 0x36 ] },
            exec: { break: 0x8c27, lookup: [ 0x39, 0x3c ] },
            startOfBasic: 0x2b
        },
        'vic20': {
            launcher: 'xvic',
            check: { addresses: [ 0xe446, 0xe447 ], values: [ 0x56, 0x32 ] },
            exec: { break: 0xc7ef, lookup: [ 0x39, 0x7b ] },
            startOfBasic: 0x2b
        },
        'petgr': { 
            launcher: 'xpet', args: '--model 3032',
            check: { addresses: [ 0xe1d2, 0xe1d4 ], values: [ 0x42, 0x41, 0x53 ] },
            exec: { break: 0xc702, lookup: [ 0x36, 0x78 ] },
            startOfBasic: 0x28
         },
        'petb': { 
            launcher: 'xpet', args: '--model 8032', 
            check: { addresses: [ 0xdab8, 0xdabb ], values: [ 0x56, 0x34, 0x2e, 0x30 ] },
            exec: { break: 0xb787, lookup: [ 0x36, 0x78 ] },
            startOfBasic: 0x28
        },
        'b128': {
            launcher: 'xcbm2',
            check: { addresses: [ 0xbb96, 0xbb98 ], values: [ 0x31, 0x32, 0x38 ] },
            exec: { break: 0x87aa, lookup: [ 0x42, 0x86 ] },
            startOfBasic: 0x2d, // NOTE: always in bank ram01
        }
    }

    constructor(viceRoot = VICE_ROOT, opts = {}) {
        this.viceRoot = viceRoot
        this.viceProcess = null
        this.viceProcessRunning = false
        this.viceDebug = opts.viceDebug || VICE_DEBUG

        this.machine = null

        this.port = null
        this.diskPath = null
        this.connected = false
        this.closed = true
        this.lastError = null

        this.expectedResponse = null
        this.currentCallback = null
        this.viceInfo = {}

        this.commands = []
        this.bufferedResponses = {}
    }

    setViceApp(viceApp) {
        this.viceApp = viceApp
    }

    async launchVice(machine, diskPath = null, port = 6502) {
        this.port = port
        this.diskPath = diskPath
        let resolve = null
        let reject = null
        let done = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
        const machineData = ViceConnection.machines[machine]
        if (!machineData) {
            return reject(new Error(`Invalid machine: ${machine}`))
        }
        this.machine = machine
        const launcher = machineData.launcher
        let args = [ '--binarymonitor' ] // TODO: add port later
        if (this.port !== VICE_DEFAULT_PORT) {
            args.push('--binarymonitoraddress', `ip4://localhost:${this.port}`)
        }
        if (machineData.args) {
            args.push(machineData.args) // for now a single string because all use cases are that
        }
        if (this.diskPath) {
            args.push('--8', this.diskPath)
        }
        this.viceProcess = spawn(`${this.viceRoot}/${launcher}`, args)
        this.viceProcessRunning = false
        this.viceProcess.stdout.on('data', (data) => {
            if (this.viceDebug) {
                const dstr = String.fromCharCode(...data)
                console.log('vice process stdout:', dstr)
            }
            this.closed = false
            this.establishConnection()
            resolve(true)
        })
        this.viceProcess.stderr.on('data', (data) => {
            if (this.viceDebug) {
                const dstr = String.fromCharCode(...data)
                console.log('vice process stderr:', dstr)
            }
        })
        this.viceProcess.on('error', (err) => {
            console.log('vice process failed:', err)
            this.viceProcess = null
            if (this.viceProcessRunning) { return }
            reject(true)
        })
        this.viceProcess.on('close', (code) => {
            console.log(`VICE closed with ${code}`)
            this.viceProcess = null
        })
        return done
    }

    isViceRunning() {
        return this.viceProcessRunning
    }

    checkConnection() {
        if (this.retry > MAX_RETRIES) {
            this.failed = true
            this.failReason = 'Too many retries'
            return false
        }
        const ping = new ViceCommand('ping')
        this.viceSocket.write(Buffer.from(ping.bytes()))
        this.retry += 1
    }

    establishConnection(retry = 0) {
        if (retry > 0) {
            this.connected = false
            if (this.viceSocket) {
                this.viceSocket.destroy()
            }

            this.viceSocket = net.createConnection({ host: 'localhost', port: this.port }, () => {
                this.retry = 0
                this.viceSocket.on('data', (data) => { this.processIncomingData(data) })
                this.checkConnection()
            })
            this.viceSocket.on('close', () => {
                console.log('VICE connection closed')
                this.connected = false
            })
            this.viceSocket.on('error', (err) => {
                if (this.closed) { return }
                if (err.code === 'ECONNREFUSED' && retry <= MAX_RETRIES) {
                    console.log('Failed to connect, retry', retry)
                    setTimeout(() => { this.establishConnection(retry + 1) }, RETRY_DELAY)
                    return
                }
                console.error('VICE socket error:', err)
                this.lastError = err
                this.connected = false
                this.viceSocket.destroy()
            })
        } else {
            setTimeout(() => { this.establishConnection(retry + 1) }, RETRY_DELAY)
        }
    }

    issueCommand(command, callback = null) {
        this.commands.push({ command, callback })
        if (this.connected && this.expectedResponse === null) {
            this.executeCommand()
        }
    }

    executeCommand() {
        if (this.commands.length === 0) { return }
        const { command, callback } = this.commands.shift()
        this.expectedResponse = command.responseByte()
        this.currentCallback = callback
        this.viceSocket.write(Buffer.from(command.bytes()))
    }

    confirmMachine() {
        const check = ViceConnection.machines[this.machine].check
        this.connected = true
        this.issueCommand(new ViceCommand('memget', {
            startAddress: check.addresses[0],
            endAddress: check.addresses[1]
        }), (response) => {
            const memory = response.response().memory
            if (memory.length !== check.values.length) {
                console.log('Failed machine type check.')
                this.shutDown()
                return
            }
            for (let idx = 0; idx < memory.length; idx++) {
                if (memory[idx] !== check.values[idx]) {
                    console.log('Failed machine type check.')
                    this.shutDown()
                    return
                }
            }
            console.log(`VICE machine ${this.machine} confirmed`)
            this.connected = true
            if (this.commands.length > 0) { this.executeCommand() }
            this.issueCommand(new ViceCommand('execrun'))
        })
        this.connected = false
    }

    processIncomingData(data) {
        let rb = null
        try {
            const response = new ViceResponse(data)
            rb = response.responseByte()
            if (response.type() === 'ping') {
                console.log('VICE launched and able to be pinged')
                this.confirmMachine()
                return
            }
            if (rb === this.expectedResponse) {
                if (this.currentCallback) {
                    this.currentCallback(response)
                }
                this.expectedResponse = null
                this.executeCommand()
            } else {
                let responses = this.bufferedResponses[response.type] || []
                responses.push(response)
                console.log('buffering:', response.response())
                this.bufferedResponses[response.type] = responses
            }
        } catch (err) {
            console.log('Error parsing response', err)
            console.log('Raw data from VICE:', data)
        }
    }

    bufferedResponses(type) {
        const responses = this.bufferedResponses[type]
        this.bufferedResponses[type] = []
    }

    shutDown() {
        this.issueCommand(new ViceCommand('quit'), () => {
            this.connected = false
            this.closed = true
            this.viceProcess.kill()
            this.viceProcess = null
            this.viceProcessRunning = false
        })
    }
}

