const tracer = require('./tracer');
const { Tags, FORMAT_HTTP_HEADERS } = require('opentracing');

module.exports = function(req, res, next) {
  // set parent context if needed
  const parentSpanContext = tracer.extract(FORMAT_HTTP_HEADERS, req.headers);
  req.span = tracer.startSpan(`${req.method}: ${req.path}`, {
    childOf: parentSpanContext
  })

  res.on('finish', function() {
    req.span.setTag(Tags.HTTP_STATUS_CODE, res.statusCode);    
    // check HTTP status code
    req.span.setTag(Tags.ERROR, ((res.statusCode >= 500 ) ? true : false));
    // close the span
    req.span.finish();
  });
  
  next();
}