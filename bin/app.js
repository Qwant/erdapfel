const express = require('express')
const app = express()
const yaml = require('node-yaml')
const environment = require('environment')
const sites = yaml.readSync('../config/sites.yml')[environment]
let port = 3000
app.set('view engine', 'ejs')

app.use(express.static(`${__dirname}/../public`))

app.get('/*', function (req, res) {
  res.render('index', {base : sites.base})
})

app.use(function (error, req, res, next) {
  res.status(500).render('error', {error})
})

app.listen(port, () => {
  console.log('*--------------------*')
  console.log(`App listening on port ${port}!`)
  console.log(`Environment is ${environment}`)
  console.log('*--------------------*')
})


