const express = require('express')
const app = express()

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "045-1236543"
    },
    {
        id: 2,
        name: "Arto Järvinen",
        number: "041-21423123"
    },
    {
        id: 3,
        name: "Lea Kutvonen",
        number: "040-4323234"
    },
    {
        id: 4,
        name: "Martti Tienari",
        number: "09-784232"
    }
]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const personToFind = persons.find(p => p.id === id)

    if (personToFind) {
        return res.json(personToFind)
    } else {
        res.status(404).end()
    }
})

app.get('/info', (req, res) => { 
    res.send(
        `<p>Puhelinluettelossa ${persons.length} henkilön tiedot</p>
        <p>${new Date()}</p>`)
})

const port = 3001
app.listen(port, () => {
    console.log("Listening for requests to port", port)
})