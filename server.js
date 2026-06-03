const express = require('express')
const path = require('path')
const bcrypt = require('bcrypt')
const cookieSession = require('cookie-session')
const app = express()
const PORT = 3421
const SALT = 12 //recommended 12, minimum 10
//server Configuration & Middleware
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }))

// Configure cookie-session
app.use(
  cookieSession({
    name: 'session',
    keys: ['super_secret_key_1', 'super_secret_key_2'],
    maxAge: 24 * 60 * 60 * 1000,
  }),
)
// database & DRY Helper Functions
const usersDb = []

const findUserByEmail = (email) => usersDb.find((user) => user.email === email)

app.use((req, res, next) => {
  res.locals.siteTitle = 'Auth App'
  res.locals.user = req.session.userId
    ? findUserByEmail(req.session.userId)
    : null
  next()
})
// 3. Routes / HTTP Methods
// Home Page
app.get('/', (req, res) => {
  res.render('home', { pageTitle: 'Welcome Home' })
})

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/')
  res.render('register', { pageTitle: 'Create an Account', error: null })
})

app.post('/register', async (req, res) => {
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
  const hashedPassword = await bcrypt.hash(password, SALT)
  usersDb.push({ email, password: hashedPassword })
  res.redirect('/login')
})

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/')
  res.render('login', { pageTitle: 'Sign In', error: null })
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = findUserByEmail(email)
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user.email
    return res.redirect('/')
  }
  res.render('login', {
    pageTitle: 'Sign In',
    error: 'Invalid email or password.',
  })
})

app.get('/logout', (req, res) => {
  req.session = null // Destroys the cookie session
  res.redirect('/login')
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running smoothly at http://localhost:${PORT}`)
})
