const redisClient = require("../config/redis");

exports.clearProductCache = async ()=>{
    try{
        for(const pattern of ['products:*', 'filters:*']){
            const keys = [];
            for await (const k of redisClient.scanIterator({MATCH:pattern, COUNT:100})){
                keys.push(...(Array.isArray(k) ? k :[k]))
            }
            if(keys.length){
                await redisClient.del(keys)
            }
        }

    }catch(e){
        console.log('Cache clear error : ' , e.message)
    }
}