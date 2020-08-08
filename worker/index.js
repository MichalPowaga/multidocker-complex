const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: (options) => {
        if (options.error && options.error.code === "ECONNREFUSED") {
            console.log(options.error.code); // take actions or throw exception
        }
        if (options.total_retry_time > 1000 * 5) { //in ms i.e. 15 sec
            console.log('redis: Retry time exhausted'); // take actions or throw exception
        }
        if (options.attempt > 10) {
            console.log('redis: 10 attempts done'); // take actions or throw exception
        }
        console.log("redis: Attempting connection");
        // reconnect after
        return 4000; //in ms
    },
});

const sub = redisClient.duplicate();

function fib(index) {
    if (index <= 1) return 1;
    return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

sub.subscribe('insert');
