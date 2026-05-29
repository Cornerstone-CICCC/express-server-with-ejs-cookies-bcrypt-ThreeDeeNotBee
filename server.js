const express = require('express')
const path = require('path')
const app = express()
const PORT = 3012

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

const usersDb = []

const findUserByEmail = (email) => usersDb.find((user) => user.email === email)

app.use((req, res, next) => {
  res.locals.siteTitle = 'Auth App'
  next()
})

app.get('/', (req, res) => {
  res.render('home', { pageTitle: 'Welcome Home' })
})

app.get('/register', (req, res) => {
  res.render('register', { pageTitle: 'Create an Account', error: null })
})

app.post('/register', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.render('register', {
      pageTitle: 'Create an Account',
      error: 'All fields are required.',
    })
  }

  if (findUserByEmail(email)) {
    return res.render('register', {
      pageTitle: 'Create an Account',
      error: 'Email already registered.',
    })
  }

  usersDb.push({ email, password })

  res.redirect('/login')
})

app.get('/login', (req, res) => {
  res.render('login', { pageTitle: 'Sign In', error: null })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = findUserByEmail(email)

  if (user && user.password === password) {
    return res.redirect('/')
  }

  res.render('login', {
    pageTitle: 'Sign In',
    error: 'Invalid email or password.',
  })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
