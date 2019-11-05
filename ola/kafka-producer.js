let kafkaurl = process.env.KAFKA_URL?process.env.KAFKA_URL:'localhost:9092'
console.log(`Configuring kafka URL as ${kafkaurl}`)
let kafka = require('kafka-node'),
    Producer = kafka.Producer,
    client = new kafka.KafkaClient({kafkaHost: kafkaurl}),
    producer = new Producer(client)

producer.on('error', function (err) {})        

module.exports = function(topic, msg){

    producer.send([{ topic: topic, messages: msg, partition: 0 },], function (err, data) {
        data? console.log(data): false
    })
     
}