import React from 'react'
import './style.css'
const Cursor = ({x,y}) => {
  return (
    <div style={{left:`${x}px`, right:`${y}px`}} className='cursor'></div>
  )
}

export default Cursor