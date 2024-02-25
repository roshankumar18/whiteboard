import { useContext } from "react";
import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const Socket = createContext()

export const SocketProvider = ({children}) =>{
    const [socket ,setSocket] = useState(null)
    useEffect(()=>{
        const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000')
        setSocket(newSocket)
        return ()=> newSocket.disconnect()
      },[])

    useEffect(()=>{
        if(!socket) 
        return 
        console.log(socket)
        socket.on("connect", () => {
            console.log(socket.id); 
          });
          socket.on("disconnect", () => {
            console.log(socket.id); 
          });
    },[socket])
    return (
        <Socket.Provider value ={{socket}}>
            {children}
        </Socket.Provider>
    )
}

const useSocket = () =>{
    return useContext(Socket)
}

export default useSocket
