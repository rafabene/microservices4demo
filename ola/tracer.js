const {initTracerFromEnv, ZipkinB3TextMapCodec} = require('jaeger-client')
const FORMAT_HTTP_HEADERS = require('opentracing').FORMAT_HTTP_HEADERS
let tracer = initTracerFromEnv({
    serviceName: 'ola'
    }, { 
        logger: console,
    })
    let codec = new ZipkinB3TextMapCodec({ urlEncoding: true });
tracer.registerInjector(FORMAT_HTTP_HEADERS, codec);
tracer.registerExtractor(FORMAT_HTTP_HEADERS, codec);
module.exports = tracer
