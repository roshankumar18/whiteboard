import React, { memo } from 'react'
import  './toolbar.css'
import useTool from '../utils/tools'

import { Minus, Palette, Pencil, Redo, Square, Type, Undo } from 'lucide-react'
const Toolbar = () => {

    const {toggle}= useTool()
  return (
    <>
    <div className='topbar-container'>
        <div className='pallete mobile'>
           <div >
             <Palette/>
           </div>
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
        <div onClick={()=>toggle('text')}>
            <Type size={16}/>
        </div>
        </div>
        <div className='share mobile'>
           <div>Share</div>
        </div>
    </div>
    <div className='bottom-container'>
        <div className='bottom'>
           <div className='pallete-mobile'>
             <Palette/>
           </div>
           <div className='undo'>
             <Undo/>
           </div>
          <div className='redo'>
           <Redo/>
          </div>
        </div>

    </div>
    </>
  )
}

export default memo(Toolbar)