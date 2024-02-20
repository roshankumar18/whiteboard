const express = require('express');
const app = express();
const {createServer} = require('http');
const { Server } = require("socket.io");

var cors = require('cors')

app.use(cors())

const httpServer = createServer(app)

const io = new Server(httpServer,{
    cors:{
        origin:3000
    }
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});
io.on('connection', (socket) => {
    console.log('a user connected',socket.id);

    socket.on('join',(roomId)=>{
        socket.join(roomId)
    })

    socket.on('drawImage',(roomId,tools,x1,y1,x2,y2,width,height,option)=>{
        // console.log(roomId,option)
        socket.to(roomId).emit('drawClient',tools,x1,y1,x2,y2,width,height,option)
    })

    socket.on('saveDrawing',(roomId)=>{
        socket.to(roomId).emit('saveDrawing')
    })

    socket.on('mouseDown',(roomId, x1, y1)=>{
        console.log('backedn mouse down',roomId,x1,y1)
        socket.to(roomId).emit('mouseDown',x1,y1)
    })

    socket.on('disconnect',()=>{
        console.log('a user disconnected',socket.id);
    })


  });
httpServer.listen(4000, () => {
  console.log('listening on *:3000');
});