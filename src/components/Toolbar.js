import React, { memo } from 'react'
import  './toolbar.css'
import useTool from '../utils/tools'

import { Minus, Palette, Pencil, Redo, Square, Type, Undo } from 'lucide-react'
import usePallete from '../utils/usePalette'
import Pallete from './Pallete'
const Toolbar = ({undo ,redo}) => {

    const {toggle}= useTool()
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
        <div onClick={(e)=>{
            e.stopPropagation()
            toggle('pencil')}}>
            <Pencil size={16}/>
        </div>
        <div onClick={()=>toggle('square')}>
            <Square size={16}/>
        </div>
        <div onClick={()=>toggle('line')}>
            <Minus size={16}/>
        </div>
        <div onClick={(e)=>{
            e.stopPropagation()
            toggle('text')}}>
            <Type size={16}/>
        </div>
        </div>
        <div className='share mobile'>
           <div>Share</div>
        </div>
    </div>
    <div className='bottom-container'>
        <div className='bottom'>
                <Pallete/>
           <div className='pallete-mobile'>
             <Palette/>
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