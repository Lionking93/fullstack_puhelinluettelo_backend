require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const MAX_ID = 100000

app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())

morgan.token('post-body', (req, res) => {
    return Object.getOwnPropertyNames(req.body).length > 0 ? JSON.stringify(req.body) : ''  
})

app.use(
    morgan((tokens, req, res) => {
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req,res), 'ms',
            tokens['post-body'](req, res)
        ].join(' ')
    })
)

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

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

app.use(errorHandler)

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(persons => {
            console.log(`${persons.length} persons were returned successfully from db`)
            return res.json(persons.map(p => p.toJSON()))
        })
        .catch(error => next(error))
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

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            console.log("Removal of person successful")
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {
    const body = req.body
    
    if (body.name === undefined || body.name === "") {
        return res.status(400).json({
            error: 'name missing'
        })
    }

    if (body.number === undefined || body.number === "") {
        return res.status(400).json({
            error: 'number missing'
        })
    }

   /* if (persons.find(p => p.name === body.name)) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }*/

    const newPerson = new Person({
        name: body.name,
        number: body.number
    })

    newPerson.save().then(addedPerson => {
        console.log(`New person ${addedPerson.name} with number ${addedPerson.number} was added successfully!`)
        return res.json(addedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.get('/info', (req, res) => { 
    res.send(
        `<p>Puhelinluettelossa ${persons.length} henkilön tiedot</p>
        <p>${new Date()}</p>`)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Listening for requests to port ${PORT}`)
})