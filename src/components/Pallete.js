import React, { useState } from 'react'
import usePallete from '../utils/usePalette'
import './pallete.css'
import { TwitterPicker } from 'react-color'
const Pallete = () => {
    const {open ,pallete, changePallete} = usePallete()
    const [color,setColor] = useState(pallete.color)

    const onChange = (color,event) =>{
        setColor(color)
        changePallete('color',color)
    }
    
  return (
    <>
        {open && 
        <div className='pallete-container'>
            <div>
                Stroke
            </div>
          
             <TwitterPicker 
             color={color}
             onChange={onChange}
             width='170px'
             colors={['#000000','#FF6900', '#FCB900', '#7BDCB5',]}
             triangle='hide'/>
            
            
        </div>}
    </>
  )

}

export default Pallete