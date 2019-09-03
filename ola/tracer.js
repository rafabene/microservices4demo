const {initTracerFromEnv, ZipkinB3TextMapCodec} = require('jaeger-client')
const FORMAT_HTTP_HEADERS = require('opentracing').FORMAT_HTTP_HEADERS
const config = {
    serviceName: 'ola',
    sampler: {
      type: "const",
      param: 1,
    },
    reporter: {
      logSpans: true,
    },
  };
const options = {
    logger: {
        info(msg) {
            console.log("INFO ", msg);
        },
        error(msg) {
            console.log("ERROR", msg);
        },
    },
}
let tracer = initTracerFromEnv(config, options)
let codec = new ZipkinB3TextMapCodec({ urlEncoding: true });
tracer.registerInjector(FORMAT_HTTP_HEADERS, codec);
tracer.registerExtractor(FORMAT_HTTP_HEADERS, codec);
module.exports = tracer
