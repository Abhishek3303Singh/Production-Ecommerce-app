const {createClient} = require( 'redis')
console.log('url',process.env.REDIS_URL)
const redisClient = createClient(
    {
        url: process.env.REDIS_URL
    }
)
redisClient.on('error', (err) => console.log('Redis Error', err));
(
    async ()=>{
        await redisClient.connect()
    }
)()

module.exports = redisClient;