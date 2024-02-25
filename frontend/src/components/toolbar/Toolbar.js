import React, { memo, useEffect, useState } from 'react'
import  './toolbar.css'
import useTool from '../../hooks/tools'

import { Circle, Minus, MousePointer, Palette, Pencil, Redo, Square, Type, Undo } from 'lucide-react'
import usePallete from '../../hooks/usePalette'
import Pallete from '../pallete/Pallete'
import ShareModal from '../shareModal/ShareModal'
import useSocket from '../../hooks/useSocket'

const toolItems = [
  {
    type:'select',
    icon : () => <MousePointer size={16} />
  },
  {
    type:'pencil',
    icon : () => <Pencil size={16} />
  },
  {
    type:'square',
    icon : () => <Square size={16} />
  },
  {
    type:'line',
    icon : () => <Minus size={16} />
  },
  {
    type:'text',
    icon : () => <Type size={16} />
  },
  {
    type:'ellipse',
    icon : () => <Circle size={16}/>
  }]

const Toolbar = ({undo ,redo}) => {

    const {tools,toggle}= useTool()
    const {open,setOpen} = usePallete()
    const [modal,setModal] = useState(false)
    const {socket} = useSocket()
    const [count, setCount] = useState(null)

    useEffect(()=>{
      if(!socket) return
      socket.on('join-count',(count)=>{
        console.log(count)
        setCount(count)
      })
      return ()=>{
        socket.off('join-count')
      }
    },[socket])
  return (
    <>
    <div className='topbar-container'>
        <div className={`pallete mobile ${open?'pallete-clicked':''}`}>
           <div  className='icon' onClick={()=>setOpen(prev=>!prev)}>
             <Palette/>
           </div>
           <Pallete/>
        </div>
        <div className='toolbar'>
          {toolItems.map(({type,icon:Icon},index)=>{
            return (
              
            <button key={type} onClick={()=>toggle(type)} className={tools[type]===true?'selected':''}>
              {<Icon size={16}/>}
            </button>)
          })}

        </div>
        <div className='share mobile'>
          
          <button onClick={()=>setModal(true)}>Share</button>
          <div>
            <span className='count'>{count}</span>
          </div>
          
          
          
        </div>
    </div>
    <div className='bottom-container'>
        <div className='bottom'>
                
           <div className='pallete-mobile'>
           <Pallete />
             <Palette onClick={(()=>setOpen(prev=>!prev))}/>
           </div>
           
           <div className='icon undo' onClick={(e)=>undo(e)}>
             <Undo/>
           </div>
          <div className='icon redo' onClick={(e)=>redo(e)}>
           <Redo/>
          </div>
        </div>

    </div>
    {modal && <ShareModal setModal={setModal}/>}
    
    </>
  )
}

export default memo(Toolbar)