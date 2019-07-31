const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
const image = require('./image')
const Todo = require('./models/todo')

app.get('/', (req, res, next) => {
  res.render('index.ejs', {
    pageTitle: 'Welcome to the Homepage',
    image: image
  })
})

app.get('/feed', async (req, res, next) => {
  try {
    const todos = await Todo.find({}).sort({ createdAt: -1 })

    res.render('feed', {
      pageTitle: 'To do feed',
      todos: todos
    })
  } catch (err) {
    console.log(err)
    res.redirect('/')
  }
})

app.post('/add', async (req, res, next) => {
  const { title } = req.body
  let completed
  // console.log(`To Do: ${req.body.title}\nCompleted: ${req.body.completed}`)
  if (!req.body.completed) {
    completed = false
  } else {
    completed = true
  }
  try {
    const result = await new Todo({
      title,
      completed
    })
    await result.save()
    console.log(result)
    res.redirect('/feed')
  } catch (err) {
    console.log(err)
  }
})
app.get('/complete/:todoId', async (req, res, next) => {
  const todoId = req.params.todoId
  try {
    const todo = await Todo.findById(todoId)
    todo.completed = true
    await todo.save()
    res.redirect('/feed')
  } catch (err) {
    console.log(err)
    res.status(501).redirect('/')
  }
})

app.get('/delete/:todoId', async (req, res, next) => {
  const todoId = req.params.todoId
  try {
    await Todo.findByIdAndDelete(todoId)
    res.redirect('/feed')
  } catch (err) {
    console.log(err)
    res.status(501).redirect('/')
  }
})
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true }).then(res => {
  console.log('Connected to database')
  app.listen(port, () => {
    console.log(`Server runnning on port ${port}`)
  })
}).catch(err => {
  console.log(err)
})
