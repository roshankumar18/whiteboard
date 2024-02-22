const express = require('express');
const app = express();
const {createServer} = require('http');
const { Server } = require("socket.io");
require('dotenv').config()
var cors = require('cors')

app.use(cors({
    origin:'https://whiteboard-u69n.vercel.app/'
}))

const httpServer = createServer(app)

const PORT = process.env.PORT || 4000
const io = new Server(httpServer,{
    cors:{
        origin:'https://whiteboard-u69n.vercel.app/'
    }
})

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

let initialData = []
io.on('connection', (socket) => {
    console.log('a user connected',socket.id);

    socket.on('join',(roomId)=>{
        socket.join(roomId)
    })

    socket.on('initialData',(roomId, data)=>{
        const index = initialData.findIndex((value)=>{
            return roomId == value[roomId]
        })
        initialData[index] = {[roomId]:roomId, [data]:data}
        
    })

    socket.on('getInitialData',(roomId)=>{
        console.log('intcalled')
        const data = initialData.find(value=>{
            return value[roomId] == roomId
        })
        socket.to(roomId).emit('initialData', data )
    })

    socket.on('drawImage',(roomId,tools,x1,y1,x2,y2,width,height,option)=>{
        // console.log(roomId,option)
        socket.to(roomId).emit('drawClient',tools,x1,y1,x2,y2,width,height,option)
    })

    socket.on('saveDrawing',(roomId)=>{
        socket.to(roomId).emit('saveDrawing')
    })

    socket.on('mouseDown',(roomId, x1, y1 ,tools, option)=>{
        socket.to(roomId).emit('mouseDown',x1,y1, tools, option)
    })

    socket.on('drawText',(roomId, text, x, y, lineHeight, option)=>{
        socket.to(roomId).emit('drawText',text, x, y, lineHeight, option)
    })

    socket.on('disconnect',()=>{
        console.log('a user disconnected',socket.id);
    })

  

  });
httpServer.listen(PORT, () => {
  console.log(PORT);
});