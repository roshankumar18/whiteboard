import React, { useEffect } from 'react'
import { json, useLocation, useNavigate, useParams } from 'react-router-dom'
import useSocket from '../hooks/useSocket'

const Share = () => {
    const {id} = useParams()
    const {socket} = useSocket()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(()=>{
        if(!socket) return 
        socket.emit('join',id)
        localStorage.setItem('roomUuid',JSON.stringify('http://localhost:3000'+location.pathname))
        socket.emit('getInitialData',id)

        navigate('/')
    },[socket])
  return (
    <div>Share</div>    
  )
}

export default Share