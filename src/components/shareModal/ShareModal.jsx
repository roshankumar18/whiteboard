import React, { useEffect, useState } from 'react'
import './style.css'
import { Copy, X } from 'lucide-react'  
import shortid from 'shortid'
import useSocket from '../../utils/useSocket'

const ShareModal = ({setModal}) => {
  const [uuid,setUuid] = useState('');
  const {socket} = useSocket()

  const getId = () =>{
    return window.location.href+'share/'+shortid.generate()
  }
  useEffect(()=>{
    if(!localStorage.getItem('roomUuid')){  
        const id = getId()    
        setUuid(id)
        localStorage.setItem('roomUuid',JSON.stringify(id))
   }else{
    setUuid()
    const id = JSON.parse(localStorage.getItem('roomUuid'))
    setUuid(id)
   }
  },[])

  useEffect(()=>{
    if(socket && uuid!==''){
        const id = uuid.split('/').slice(-1)[0]
        console.log(id)
        socket.emit('join',id)
       }
  },[uuid])

  return (
    <div className='share-modal-container'>
        <div className='share-modal'>
            <div className='header'>
                <div>Copy Link</div>
                <button 
                className='button'
                onClick={()=>setModal(false)}><X /></button>
            </div>
            <div className='content'>
                <div>{uuid}</div>
                <button className='button'><Copy/></button>
            </div>
        </div>
    </div>
  )
}

export default ShareModal