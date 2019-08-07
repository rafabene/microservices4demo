const express = require('express')
const app = express()
const port = 3000
const os = require('os')
const version = "V1"
let cont = 0
let misbehave= false

app.get('/health', function (req, res){
    res.json({status: 'UP'})
})

app.get('/', root)

app.get('/misbehave', function(request, response) {
    misbehave = true;
    response.send("Following requests to '/' will return a 503\n");
});

app.get ('/behave', function(request, response) {
    misbehave = false;
    response.send("Following requests to '/' will return a 200\n");
});


function root (req, res){
    if (misbehave) {
        res.status(503).send(`Ola ${version} FAILS(503) from "${os.hostname}"`)
    } else {
        res.send(`Ola ${version} de "${os.hostname}": ${++cont}`)
    }
}

app.listen(port, () => console.log(`Ola app listening on port ${port}!`))