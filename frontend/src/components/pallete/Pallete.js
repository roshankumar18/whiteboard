import React, { useState } from 'react'
import usePallete from '../../utils/usePalette'
import './pallete.css'
import { TwitterPicker } from 'react-color'
import { Minus } from 'lucide-react'
import useTool from '../../utils/tools'

const fontSize= ['S','M','L','XL']

const Pallete = () => {
    const {open ,pallete, changePallete} = usePallete()
    const [color,setColor] = useState(pallete.color)
    const {tools} = useTool()
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
            <div>
              <div>
                Stroke width
              </div>
              <div className='stroke-width-container'>
              {Array(4).fill('').map((_,index)=>{
                    return <div className='stroke-width'>
                              <Minus 
                              key={index} 
                              style={{strokeWidth:index+1}}
                              onClick={()=>changePallete('strokeWidth',(index+1)*2)}/>
                          </div>
                  })}

              </div>
            </div>
            {tools.text && <div>
              <div>
                Font Size
              </div>
              <div className='stroke-width-container'>
              {fontSize.map((size,index)=>{
                    return <div 
                    onClick={()=>changePallete('fontSize',(index+1)*16)}
                    className={`font-size ${pallete.fontSize/((index+1)*16)===1?'selected':''}`}>
                    
                              <span 
                              key={index} 
                              style={{strokeWidth:index+1}}
                              >{size}</span>
                          </div>
                  })}

              </div>
            </div>}
            <div className='roughness-container'>
                  <div>Roughness</div>
                  <div>
                    <input 
                      type='range' 
                      defaultValue={1}
                      min={0} 
                      max={4} 
                      step={0.2}
                      onChange={(e)=>changePallete('roughness',e.target.value)} />
                  </div>
            </div>
            

            
        </div>}
    </>
  )

}

export default Pallete