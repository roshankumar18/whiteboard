import React, { memo } from 'react'
import  './toolbar.css'
import useTool from '../utils/tools'

import { Minus, MousePointer, Palette, Pencil, Redo, Square, Type, Undo } from 'lucide-react'
import usePallete from '../utils/usePalette'
import Pallete from './Pallete'

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
  }]

const Toolbar = ({undo ,redo}) => {

    const {tools,toggle}= useTool()
    const {open,setOpen} = usePallete()
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
              
            <div key={type} onClick={()=>toggle(type)} className={tools[type]===true?'selected':''}>
              {<Icon size={16}/>}
            </div>)
          })}

        </div>
        <div className='share mobile'>
           <div>Share</div>
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
    </>
  )
}

export default memo(Toolbar)