const {redisClient} = require('../redis_session.js')
const {cacheQuery} = require('../cache_redis.js')

async function handler(job){
    switch (job.action.trim()) {
        case 'add':
            await redisClient.rPush(
                job.room_id, 
                JSON.stringify({ id: job.message_id,  username: job.username, message: job.message_body }))
                await redisClient.expire(job.room_id,600)
            const response = {
                action: job.action,
                id: job.message_id, 
                username: job.username,
                message: job.message_body
            }
            return response
        case 'reply':
                console.log(job)
            await redisClient.rPush(
                job.room_id, 
                JSON.stringify({ id: job.message_id,  username: job.username, message: job.message_body, reply_parent: job.reply_message}))
                await redisClient.expire(job.room_id,600)
            const response_reply = {
                action: job.action,
                id: job.message_id, 
                username: job.username,
                message: job.message_body,
                reply_parent: job.reply_message
            }
            return response_reply
        default:
            console.log("queue logic error")
        }
    
}

exports.handler = handler
