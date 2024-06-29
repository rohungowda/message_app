const redis = require('redis');
const RedisStore = require("connect-redis").default;
const uid = require('uid-safe');
const session = require("express-session")


// Initialize client and connect
const redisClient = redis.createClient({  host: 'localhost', port: 6379})
redisClient.connect().catch((error)=>{console.error(error)})
// initalize store
const redisStore = new RedisStore({client: redisClient,  disableTouch: true, ttl: 300}) // five minutes

const generateSessionId = () => {
  return uid.sync(24);
};


const middleWareSession = session({
  store: redisStore,
  secret: 'rohun', // signs the cookie
  resave: false, // session data will not be saved back to the session store  unless the session was modified 
  saveUninitialized: false, // only save sessions that actually do something
  genid:generateSessionId,
  cookie: {
      maxAge: 300000,
      httpOnly: true, // False Allow client-side JavaScript to access the cookie
    }
})



exports.middleWareSession = middleWareSession
exports.redisClient = redisClient
exports.redisStore = redisStore




process.on('SIGINT', async () => {
  console.log('Stopping server...');

  try {
    if (redisClient.connected) {
      await redisStore.clear();
      await redisClient.quit();
      console.log('Redis connections closed.');
  } else {
      console.log('Redis client is not connected');
  }

  } catch (error) {
    console.error('Error closing Redis connections:', error);
  }

  console.log('Server stopped.');
  
  process.exit(0);
});