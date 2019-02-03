if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

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

app.get('/api/persons', (req, res, next) => {
    Person.find({})
        .then(persons => {
            console.log(`${persons.length} persons were returned successfully from db`)
            return res.json(persons.map(p => p.toJSON()))
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(foundPerson => {
            if (foundPerson) {
                console.log(`Found person with id ${foundPerson.id}`)
                res.json(foundPerson.toJSON())
            } else {
                res.status(404).end()
            }
        }).catch(err => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            console.log("Removal of person successful")
            res.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body

    const newPerson = {
        number: body.number
    }

    Person.findByIdAndUpdate(req.params.id, newPerson, { new: true })
        .then(updatedPerson => {
            console.log(`Updated number of person with id ${req.params.id} to ${updatedPerson.number}`)
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body

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
    Person.find({})
        .then(persons => {
            res.send(
                `<p>Puhelinluettelossa ${persons.length} henkilön tiedot</p>
                <p>${new Date()}</p>`
            )
        })
        .catch(error => next(err)) 
})

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Listening for requests to port ${PORT}`)
})