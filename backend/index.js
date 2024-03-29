const express = require('express');
const app = express();
const {createServer} = require('http');
const { Server } = require("socket.io");
require('dotenv').config()
var cors = require('cors');
const { getRandomColor } = require('./utils/getRandomColor');

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
const userCusrors = {}
io.on('connection', (socket) => {
    console.log('a user connected',socket.id);

    socket.on('join',(roomId,name)=>{
        console.log('user joined room')
        socket.join(roomId)
        io.to(roomId).emit('join-count',io.sockets.adapter.rooms.get(roomId).size)
        const color =  getRandomColor()
        userCusrors[socket.id]={...userCusrors[socket.id],color,name}
        
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
        console.log('share',initialData)
    })

    socket.on('getInitialData',(roomId)=>{
        const data = initialData.find(value=>{
            
            return value.roomId == roomId
        })
        console.log('getini' ,data)
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

    socket.on('sendMessage',(roomId,message)=>{
        socket.to(roomId).emit('receiveMessage',message)
    })

    socket.on('updateElement',(roomId,element)=>{
        socket.to(roomId).emit('updateElement',element)
    })

    socket.on('action',(roomId, data)=>{
        socket.to(roomId).emit('action',data)
    })
    socket.on('disconnect',()=>{
        console.log('a user disconnected',socket.id);
        const rooms = socket.adapter.rooms
        const keys = rooms.keys()
        while(true){
            let result = keys.next()
            if(result.done) break
            io.to(result.value).emit('join-count',io.sockets.adapter.rooms.get(result.value).size)
            // io.to(result.value).emit('updateCursor', {clientX:0, clientY:0})
        }
        delete userCusrors[socket.id]
    })

    socket.on('updateCursor',(roomId, cursor)=>{
        userCusrors[socket.id] = {...userCusrors[socket.id], cursor}
        io.to(roomId).emit('updateCursor', userCusrors)
    })

  });
httpServer.listen(PORT, () => {
  console.log(PORT);
});