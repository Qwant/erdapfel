const express = require('express')
const app = express()

const baseUrl = process.env.MAPS_BASE_URL || '/'

let port = 3000
app.set('view engine', 'ejs')

app.use(express.static(`${__dirname}/../public`))

app.get('/*', function (req, res) {
  res.render('index', {base : baseUrl})
})

app.use(function (error, req, res, next) {
  res.status(500).render('error', {error})
})

app.listen(port, () => {
  console.log('*--------------------*')
  console.log(`App listening on port ${port}!`)
  console.log('*--------------------*')
})

