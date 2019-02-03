const mongoose = require('mongoose')

if (process.argv.length < 3){
  console.log('Give password as an argument!')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb://fullstack:${password}@ds135974.mlab.com:35974/fullstack_puhelinluettelo`

mongoose.connect(url, { useNewUrlParser: true })


const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
  const newName = process.argv[3]
  const newNumber = process.argv[4]

  const person = new Person({
    name: newName,
    number: newNumber
  })

  person.save().then(response => {
    console.log(`lisätään ${response.name} numero ${response.number} luetteloon`)
    mongoose.connection.close()
  })
} else if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('puhelinluettelo:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else {
  console.log('suljetaan yhteys')
  mongoose.connection.close()
}