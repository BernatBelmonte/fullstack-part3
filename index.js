const express = require('express')
const cors = require('cors')
require('dotenv').config()
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(errorHandler)

const Person = require('./models/person')

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => { response.json(persons) })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => {
    console.log(error)
    response.status(400).send({ error: 'malformated id' })
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  console.log(request)
  const name = request.body.name
  const number = request.body.number
  if (name && number) {
    const person = new Person({
      name,
      number
    })
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
  } else {
    response.status(400).json({
      error: 'name or number missing'
    })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
