const express = require('express');
const app = express();
const {createServer} = require('http');
const { Server } = require("socket.io");
require('dotenv').config()
var cors = require('cors')

app.use(cors())

const httpServer = createServer(app)

const PORT = process.env.PORT || 4000
const io = new Server(httpServer,{
    cors:{
        origin:'https://whiteboard-u69n.vercel.app',
        // origin:'http://localhost:3000',
        credentials:true,
        methods: ["GET", "POST"]
    }
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

let initialData = []
io.on('connection', (socket) => {
    console.log('a user connected',socket.id);

    socket.on('join',(roomId)=>{
        console.log('user joined room')
        socket.join(roomId)
        io.to(roomId).emit('join-count',io.sockets.adapter.rooms.get(roomId).size)
        
    })

    socket.on('initialData',(roomId, data)=>{
        console.log('shared data')
        const index = initialData.findIndex((value)=>{
            return roomId == value[roomId]
        })
        
        if(index===-1)
        {
            initialData = [...initialData,{roomId:roomId, data:data}]
            
        }else{
            initialData[index] = {roomId:roomId, data:data}
        }
        
    })

    socket.on('getInitialData',(roomId)=>{
        const data = initialData.find(value=>{
            
            return value.roomId == roomId
        })
        socket.emit('initialData', data )
    })

    socket.on('drawImage',(roomId,tools,x1,y1,x2,y2,width,height,option)=>{
        socket.to(roomId).emit('drawClient',tools,x1,y1,x2,y2,width,height,option)
    })

    socket.on('saveDrawing',(roomId,data)=>{
        socket.to(roomId).emit('saveDrawing',data)
    })

    socket.on('mouseDown',(roomId, x1, y1 ,tools, option)=>{
        io.to(roomId).emit('mouseDown',x1,y1, tools, option)
    })

    socket.on('drawText',(roomId, text, x, y, lineHeight, option)=>{
        socket.to(roomId).emit('drawText',text, x, y, lineHeight, option)
    })

    socket.on('disconnect',()=>{
        console.log('a user disconnected',socket.id);
        const rooms = socket.adapter.rooms
        const keys = rooms.keys()
        while(true){
            let result = keys.next()
            if(result.done) break
            io.to(result.value).emit('join-count',io.sockets.adapter.rooms.get(result.value).size)
            
        }
    })

  

  });
httpServer.listen(PORT, () => {
  console.log(PORT);
});