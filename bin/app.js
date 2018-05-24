const express = require('express')
const app = express()
app.set('view engine', 'ejs')

app.use(express.static(`${__dirname}/../public`))

app.get('/', function (req, res) {
  res.render('index')
})


app.use(function (error, req, res) {
  res.status(500).render('error', {error})
})


app.listen(3000, () => console.log('App listening on port 3000!'))