const express = require("express")
const http = require('http');
const socketIo   = require("socket.io");
const cors = require("cors")

const {middleWareSession, redisClient, redisStore} = require('./redis_session.js')
const {cache_queue} = require('./jobs/job_queue.js');
const {cacheQuery} = require('./cache_redis.js')

const port = 8000;
const app = express();
const server = http.createServer(app)

const io = socketIo(server,
    {cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true}
});


io.engine.use(middleWareSession)

app.use(middleWareSession)
app.use(express.json());

app.use(cors( {origin: 'http://localhost:3000', // Change to your frontend URL
credentials: true}))



// Middleware Begin

app.use((req,res, next)=>{

  if (!req.session.user && req.originalUrl != '/login'){
    res.status(404).json({error:"login"})
  }else{
    console.log("Credentials pass through Express middleware. \n")
    next()
  }
})

io.use((socket, next) => {
  const session = socket.request.session;

  if (!session.user) {
    next(new Error('Forbidden'));
  } else {
    console.log('Credentials passed through IO middleware. \n');
    next();
  }
});

// Middleware End


// Api routes Begin
app.post('/login', (req, res) => {
    req.session.user = req.body.username
    if(!req.body.username){
      req.session.user = "test_username"
    }
    res.json({status:"success"})
});


app.get('/rooms',(req,res)=>{
  res.json({rooms:[{name:"room_1", id:"12356754"},{name:"room_2", id:"5663423"},{name:"room_3", id:"8884374"}]})

});



app.post('/rooms', async (req,res)=>{
  const data = await cacheQuery(req.body.id)
  res.json(data)
})




// socket logic
  io.on("connection", (socket) => {
      socket.emit("serverReady");

      const interval = setInterval(() => {
        if (!socket.request.session) {
          socket.emit('connect_error');
          clearInterval(interval);
          socket.disconnect();
        }
      }, 5000);

    socket.on('disconnect', () => {
        socket.leaveAll();
        clearInterval(interval);
    })

    socket.on('roomChange',(data)=>{
      const {roomID, roomName } = data;
      socket.leaveAll();
      
      socket.join(roomName)
      socket.emit("roomChangeStatus", {room:roomName, id:roomID})

    })

    socket.on('SendMessage',(message)=>{
      message['username'] = socket.request.session.user
      cache_queue.add(message);
    })

    socket.on('ReplyMessage',(message)=>{
      message['username'] = socket.request.session.user
      cache_queue.add(message);
      //cache_queue.add(message);
    })
    socket.on('back', (reset) =>{
      socket.leaveAll();
    })
});
// socket logic


// Queue Logic
async function queue_finish(job, result){
  const data = job.data

  switch (data.action) {
    case 'add':
      console.log(result)
      io.to(data.room_name).emit("RoomMessage",result)
        break;
    case 'reply':
      console.log(result)
      io.to(data.room_name).emit("RoomMessage",result)
        break;
    default:
        console.log('Unkown case order Action Item 34354');
    }
}

cache_queue.on('completed', async (job, result) => {
  await queue_finish(job,result)
  await job.remove();
});
// Queue Logic


// Initialize Server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// Initalize Server

