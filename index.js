const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send("Hello there!")
})

const port = 3000
app.listen(port, () => {
    console.log("Listening for requests to port", port)
})