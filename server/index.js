import express from 'express'
import { ViceConnection } from './vice.js'
const app = express()
const port = 6503 // You can choose any available port

const vice = new ViceConnection()

// Define a basic route
app.post('connect-vice', (req, res) => {
    // TODO
})

// Start the server
app.listen(port, () => {
    console.log(`Express app listening at http://localhost:${port}`)
    vice.launchVice('c128')
})