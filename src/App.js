import { memo, useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import useTool from './utils/tools';

function App() {
  const canvasRef = useRef()
  const tempRef = useRef()
  const inputRef = useRef()
  const textStartCoordinates = useRef({x:0,y:0})
  const [coordinates,setCoordinates] = useState({x:0,y:0})
  const [mouseDown ,setMouseDown] = useState(false)
  const [canvasCtx ,setCanvasCtx] = useState(null)
  const [tempCanvasCtx ,setTempCanvasCtx] = useState(null)
  const [isInput ,setIsInput] = useState(false)
  const [color, setColor] = useState("#000000")
  const [size, setSize] = useState(2)
  const {tools,reset} = useTool()
  const {pencil,square,line,text} = tools

  useEffect(()=>{
    if(canvasRef){
      const canvas = canvasRef.current
      const tempCanvas = tempRef.current
      const ctx=  canvas.getContext("2d")
      const tempCtx=  tempCanvas.getContext("2d")
      setCanvasCtx(ctx)
      setTempCanvasCtx(tempCtx)
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      tempCanvas.width = window.innerWidth
      tempCanvas.height = window.innerHeight
    }
  },[])
  
  useEffect(()=>{
    const canvas = canvasRef.current
    const tempCanvas = tempRef.current
    const handleResize = () =>{
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      tempCanvas.width = window.innerWidth
      tempCanvas.height = window.innerHeight
    } 

    window.addEventListener('resize',handleResize)
    return () =>{
      window.removeEventListener('resize',handleResize)
    }
  },[])


  useEffect(()=>{
    if(!mouseDown)
      return
    const ctx = canvasCtx
    ctx.beginPath()
    ctx.moveTo(coordinates.x,coordinates.y)
    ctx.lineWidth = size
    tempCanvasCtx.lineWidth = size
    ctx.strokeStyle = 'green'
    tempCanvasCtx.strokeStyle ='green'
    ctx.lineCap = "round"
    
    const mouseMove = (e) =>{
      if(pencil){
        ctx.lineTo(e.clientX,e.clientY)
        ctx.stroke()
      }

      if(line){
        tempCanvasCtx.clearRect(0, 0, tempRef.current.width, tempRef.current.height)
        tempCanvasCtx.beginPath()
        tempCanvasCtx.moveTo(coordinates.x,coordinates.y)
        tempCanvasCtx.lineTo(e.clientX,e.clientY)
        tempCanvasCtx.stroke()
      }
      if(square){
        tempCanvasCtx.clearRect(0, 0, tempRef.current.width, tempRef.current.height)
        tempCanvasCtx.strokeRect(
          coordinates.x,
          coordinates.y,
          e.clientX-coordinates.x,
          e.clientY-coordinates.y)
      }

    }
    document.addEventListener('mousemove',mouseMove)
    return () => document.removeEventListener('mousemove',mouseMove)
  },[mouseDown])

  const handleMouseDown = useCallback((e) =>{
    console.log(e.clientX,e.clientY)
    setMouseDown(true)
    setCoordinates({
      x:e.clientX,
      y:e.clientY
    })
    if(text){
      setIsInput(true)
    }else{
      setIsInput(false)
    }
  },[text,mouseDown])

  const handleMouseUp = (e) =>{
    setMouseDown(false)
    
    canvasCtx.drawImage(tempRef.current,0,0)
 
  }

  useEffect(()=>{
    document.addEventListener('mousedown',handleMouseDown)
    document.addEventListener('mouseup',handleMouseUp)
    return () => {
      document.removeEventListener('mousedown',handleMouseDown)
      document.removeEventListener('mouseup',handleMouseUp)
    }
  },[canvasCtx,text])

  useEffect(()=>{
    if(inputRef.current)
    {
      inputRef.current.focus()
      console.log(inputRef)
      textStartCoordinates.current.x = inputRef.current.offsetLeft
      textStartCoordinates.current.y = inputRef.current.offsetTop 
    }
     
  },[inputRef.current])
 
  const inputBlur = () =>{
    setIsInput(false)
    canvasCtx.font='16px serif'
    canvasCtx.textBaseline = 'middle'
    
    canvasCtx.fillText(inputRef.current.value, textStartCoordinates.current.x+1 , textStartCoordinates.current.y+1)
    reset()
  }

  return (
    <div className="App">
      <Toolbar/>
      <canvas className='temp-canvas' ref={tempRef} style={{position:'absolute'}}></canvas>
      {isInput && 
      <input ref={inputRef} 
      style={{position:'absolute' ,left:`${coordinates.x}px` ,top:`${coordinates.y}px`}}
      onBlur={inputBlur}  />}
      <canvas ref={canvasRef} style={{display:'block'}}></canvas>
     
    </div>
  );
}

export default memo(App);
