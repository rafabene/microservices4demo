const tracer = require('./tracer');
const express = require('express')
const tracingMiddleware = require('./tracing-middleware')
const FORMAT_HTTP_HEADERS = require('opentracing').FORMAT_HTTP_HEADERS
const app = express()
const port = 3000
const os = require('os')
const version = (process.env.VERSION == undefined ? "V1" : process.env.VERSION )

let cont = 0
let misbehave= false

app.use(tracingMiddleware);

app.get('/health', function (req, res){
    res.json({status: 'UP'})
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
    if (misbehave) {
        res.status(503).send(`Ola ${version} FAILS(503) from "${os.hostname}"`)
    } else {
        res.send(`Ola ${version} de "${os.hostname}": ${++cont}`)
    }
    next()
}

app.listen(port, () => console.log(`Ola app listening on port ${port}!`))