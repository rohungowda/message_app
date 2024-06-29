const {redisClient} = require('./redis_session.js')




const data = [
  JSON.stringify({ id: 1, username: "user1", message: "Hello" }),
  JSON.stringify({ id: 2, username: "test_username", message: "How are you?" }),
  JSON.stringify({ id: 3, username: "user2", message: "Good morning" }),
  JSON.stringify({ id: 4, username: "user3", message: "What's up?" }),
  JSON.stringify({ id: 5, username: "test_user", message: "Good evening" }),
  JSON.stringify({ id: 6, username: "user4", message: "See you later" }),
  JSON.stringify({ id: 7, username: "user5", message: "Take care" }),
  JSON.stringify({ id: 8, username: "user6", message: "Nice to meet you" }),
  JSON.stringify({ id: 9, username: "test_username", message: "Have a great day" }),
  JSON.stringify({ id: 10, username: "user7", message: "Good night" }),
  JSON.stringify({ id: 11, username: "user8", message: "Cheers" }),
  JSON.stringify({ id: 12, username: "user9", message: "Thank you" }),
  JSON.stringify({ id: 13, username: "user10", message: "You're welcome" }),
  JSON.stringify({ id: 14, username: "user11", message: "Congratulations" }),
  JSON.stringify({ id: 15, username: "user12", message: "Best wishes" }),
  JSON.stringify({ id: 16, username: "user13", message: "Good luck" }),
  JSON.stringify({ id: 17, username: "test_username", message: "Well done" }),
  JSON.stringify({ id: 18, username: "user14", message: "Happy birthday" }),
  JSON.stringify({ id: 19, username: "user15", message: "Merry Christmas" }),
  JSON.stringify({ id: 20, username: "user16", message: "Happy New Year" }),
  JSON.stringify({ id: 21, username: "user17", message: "Get well soon" }),
  JSON.stringify({ id: 22, username: "user18", message: "Happy anniversary" }),
  JSON.stringify({ id: 23, username: "user19", message: "Best regards" })
];




const TTL = 600


const Identifier = "8884374"

async function test_cache(identifier){
  for (let i = 0; i < data.length; i++) {
    await redisClient.rPush(Identifier, data[i]);
  }
  await redisClient.EXPIRE(Identifier, TTL)
  
}

async function cacheQuery(identifier){
  const response = await redisClient.exists(Identifier)

  if(response == 0){
    await test_cache(identifier)
  }
  const data = await redisClient.lRange(identifier,0,-1)
  const processed_data = data.map((element,index)=>{
    element = JSON.parse(element)
    return element
  })
  return processed_data
}



exports.cacheQuery = cacheQuery
exports.test_cache = test_cache


