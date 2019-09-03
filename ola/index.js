const express = require('express')
const {initTracerFromEnv, ZipkinB3TextMapCodec} = require('jaeger-client')
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing')
const app = express()
const port = 3000
const os = require('os')
const version = (process.env.VERSION == undefined ? "V1" : process.env.VERSION )
let cont = 0
let misbehave= false

let tracer = initTracerFromEnv({
    serviceName: 'ola'
    }, { 
        logger: console,
    });

let codec = new ZipkinB3TextMapCodec({ urlEncoding: true });
tracer.registerInjector(FORMAT_HTTP_HEADERS, codec);
tracer.registerExtractor(FORMAT_HTTP_HEADERS, codec);

app.get('/health', function (req, res){
    res.json({status: 'UP'})
})

app.get('/', [logHeaders, root, trace])

app.get('/misbehave', function(request, response) {
    misbehave = true
    response.send("Following requests to '/' will return a 503\n")
});

app.get ('/behave', function(request, response) {
    misbehave = false
    response.send("Following requests to '/' will return a 200\n")
});

function trace(req, res){
    // set parent context if needed
    const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers)
    req.span = tracer.startSpan(`${req.method}: ${req.path}`, {
        childOf: parentSpanContext,
    })
    tracer.inject(req.span, FORMAT_HTTP_HEADERS, {});

    req.span.setTag(Tags.HTTP_STATUS_CODE, res.statusCode);   
    // check HTTP status code
    req.span.setTag(Tags.ERROR, ((res.statusCode >= 500 ) ? true : false))
    // close the span
    req.span.finish()
    console.log(req.span._spanContext)
}

function logHeaders(req, res, next){
    console.log('Request received - Headers: ' + JSON.stringify(req.headers));
    next();
}

function root (req, res, next){
    res.set('Connection', 'close')
    if (misbehave) {
        res.status(503).send(`Ola ${version} FAILS(503) from "${os.hostname}"`)
    } else {
        res.send(`Ola ${version} de "${os.hostname}": ${++cont}`)
    }
    next()
}

app.listen(port, () => console.log(`Ola app listening on port ${port}!`))