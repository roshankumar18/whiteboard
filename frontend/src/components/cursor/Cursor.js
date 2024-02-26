import React from 'react'
import './style.css'
const Cursor = (cursor) => {
    const userId = Object.keys(cursor)[0];
    let cursorPosition = cursor[userId];
    const id = Object.keys(cursorPosition)[0]
    const {clientX,clientY} = cursorPosition[id]
  return (
    <div style={{left:`${clientX}px`, top:`${clientY}px`}} className='cursor'></div>
  )
}

export default Cursor