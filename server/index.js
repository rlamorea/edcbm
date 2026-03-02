import express from 'express'
import { ViceConnection } from './vice.js'
import { ViceCommand } from './viceComm.js'
import { ViceDebugger } from './viceDebugger.js'
import cors from 'cors'
import config from './config.js'
import { createServer } from 'http'
import { WebSocketServer } from 'ws' 

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

let currentVice = null

const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', ws => {
    if (currentVice) {
        ws.send(JSON.stringify({ status: 'error', error: 'VICE already running'}))
        return
    }

    console.log('socket connected')
    currentVice = new ViceConnection()
    const viceDebugger = new ViceDebugger(currentVice, ws)

    ws.on('message', message => {
        console.log('got message:', message.toString())
        viceDebugger.handleMessage(message)
    })

    ws.on('end', () => {
        viceDebugger.close()
    })

    ws.on('close', () => {
        viceDebugger.close()
        currentVice = null
        console.log('socket closed')
    })

    ws.on('error', (e) => {
        console.log('socket error', e)
    })
})
wss.on('error', (e) => {
    console.log('socket server error', e)
})

const port = config.PORT

app.get('/', (req, res) => {
    res.send({ edcbm: true })
})

// Define a basic route
app.get('/ping', (req, res) => {
    res.send({ status: 'pong' })
})

// VICE routes
app.post('/vice/run', async (req, res) => {
    if (currentVice) {
        res.status(500).json({ status: 'error', error: 'VICE already running'})
        return
    }
    const machine = req.body.executeMachine
    //const programBytes = Uint8Array.fromBase64(req.body.programBytes) // NOT SUPPORTED BY NODEJS YET!
    const programBytes = [ ...Buffer.from(req.body.programBytes, 'base64') ].splice(2) // cut off the address bytes from the program
    console.log('start', req.body.startAddress, 'programBytes', programBytes)
    currentVice = new ViceConnection()
    try {
        await currentVice.launchViceForMachine(machine)
        await currentVice.loadProgram(programBytes, req.body.startAddress)
        await currentVice.runBASICProgram()
        res.send({ status: 'running' })
    } catch (e) {
        res.status(500).json({ status: 'error', error: e.message })
    }
})

app.post('/vice/stop', async (req, res) => {
    console.log('asked to stop')
    if (currentVice) {
        console.log('shutting down')
        try {
            currentVice.shutDown()
            currentVice = null
        } catch (e) {
            console.log('shut down error', e)
        }
    }
    res.send({ status: 'stopped' })
})

if (config.good) {
    // Start the server
    server.listen(port, () => {
        console.log(`EDCBM Server listening at http://localhost:${port}`)
        console.log('Websocket listening here as well')
    })
}
