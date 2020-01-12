const tracer = require('./tracer')
const kafka = require('./kafka-producer')
const KAFKA_TOPIC = 'my-topic'
const express = require('express')
const session = require('express-session')
const tracingMiddleware = require('./tracing-middleware')
const FORMAT_HTTP_HEADERS = require('opentracing').FORMAT_HTTP_HEADERS
const app = express()
const port = 3000
const os = require('os')
const version = (process.env.VERSION == undefined ? "V1" : process.env.VERSION )

let cont = 0
let misbehave= false
let sessionStore = null

if (process.env.MYSQL_HOST == 'undefined' ){
    console.log(`variable MYSQL_HOST set as ${process.env.MYSQL_HOST}`) 
    var options = {
        host: (process.env.MYSQL_HOST == 'undefined' ? "localhost" : process.env.MYSQL_HOST),
        port: 3306,
        user: 'myuser',
        password: 'mypassword',
        database: 'session',
        createDatabaseTable: true
    }
    let MySQLStore = require('express-mysql-session')(session);
    sessionStore = new MySQLStore(options)
    console.log('sessionStore configured as ' + JSON.stringify(options))
}

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    store: (process.env.MYSQL_HOST == 'undefined' ? null : sessionStore),
    saveUninitialized: false,
}))

app.use(tracingMiddleware);

app.get('/health', function (req, res){
    res.json({status: 'UP'})
})

app.get('/session/add/:name', function(request, response) {
    let name = request.params.name
    request.session[name] = name
    console.log(`${name} added to Session`)
    response.send(request.session)
})

app.get('/session/get', function(request, response) {
    response.send(request.session)
})

app.get('/', [logHeaders, root])

app.get('/misbehave', function(request, response) {
    misbehave = true
    response.send("Following requests to '/' will return a 503\n")
});

app.get ('/behave', function(request, response) {
    misbehave = false
    response.send("Following requests to '/' will return a 200\n")
})

function logHeaders(req, res, next){
    console.log('Request received - Headers: ' + JSON.stringify(req.headers))
    next()
}

function root (req, res, next){
    res.set('Connection', 'close')
    const headers = {};

    tracer.inject(req.span, FORMAT_HTTP_HEADERS, headers);
    console.log(req.span.context())
    let msg = ''
    if (misbehave) {
        msg = `Ola ${version} FAILS(503) from "${os.hostname}"`
        res.status(503).send(msg)
    } else {
        msg = `Ola ${version} de "${os.hostname}": ${++cont}`
        res.send(msg)
    }
    kafka.send(KAFKA_TOPIC, msg);
    next()
}
app.listen(port, () => console.log(`Ola app listening on port ${port}!`))
kafka.createTopic(KAFKA_TOPIC)