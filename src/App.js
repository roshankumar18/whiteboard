import { memo, useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import useTool from './utils/tools';
import usePallete from './utils/usePalette';

function App() {
  const canvasRef = useRef()
  const tempRef = useRef()
  const inputRef = useRef()
  const textStartCoordinates = useRef({x:0,y:0})
  const [coordinates,setCoordinates] = useState({x:0,y:0})
  const [mouseDown ,setMouseDown] = useState(false)
  const [canvasCtx ,setCanvasCtx] = useState(null)
  const [undoState, setUndoState] = useState([])
  const [redoState, setRedoState] = useState([])
  const [tempCanvasCtx ,setTempCanvasCtx] = useState(null)
  const [isInput ,setIsInput] = useState(false)
  const [size, setSize] = useState(2)
  const {tools,reset} = useTool()
  const {pencil,square,line,text} = tools
  const {pallete} = usePallete()

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
    // ctx.beginPath()
    // ctx.moveTo(coordinates.x,coordinates.y)
    tempCanvasCtx.beginPath()
    tempCanvasCtx.moveTo(coordinates.x,coordinates.y)
    ctx.lineWidth = size
    tempCanvasCtx.lineWidth = size
    tempCanvasCtx.lineCap = "round"
    tempCanvasCtx.lineJoin ='round'
    
    const mouseMove = (e) =>{
      if(pencil){
        tempCanvasCtx.lineTo(e.clientX,e.clientY)
        tempCanvasCtx.stroke()
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
    tempRef.current.addEventListener('mousemove',mouseMove)
    // tempRef.current.addEventListener('touchmove',mouseMove)
    return () => {
      tempRef.current.removeEventListener('mousemove',mouseMove)
      // tempRef.current.removeEventListener('touchmove',mouseMove)

    }
  },[mouseDown,tempRef])



  useEffect(()=>{
    if(canvasCtx===null || tempCanvasCtx===null)
      return
    canvasCtx.strokeStyle = pallete.color.hex
    tempCanvasCtx.strokeStyle =pallete.color.hex
    console.log(pallete.color)
  },[canvasCtx,tempCanvasCtx,pallete.color])

  const handleMouseDown = useCallback((e) =>{
    console.log(e.clientX,e.clientY)
    setMouseDown(true)
    setCoordinates({
      x:e.clientX,
      y:e.clientY
    })
    if(text){
      console.log('inputshould')
      setIsInput(true)
    }else{
      setIsInput(false)
    }
  },[text,mouseDown])

  const handleMouseUp = (e) =>{
    setMouseDown(false)
    
    canvasCtx.drawImage(tempRef.current,0,0)
    const _tempDrawingState = [...undoState,canvasRef.current.toDataURL()]
    setUndoState(_tempDrawingState)
    // console.log(_tempDrawingState)
  }

  useEffect(()=>{
    tempRef.current.addEventListener('mousedown',handleMouseDown)
    tempRef.current.addEventListener('mouseup',handleMouseUp)
    return () => {
      tempRef.current.removeEventListener('mousedown',handleMouseDown)
      tempRef.current.removeEventListener('mouseup',handleMouseUp)
    }
  },[canvasCtx,text,undoState,tempRef])

  useEffect(()=>{
    console.log(inputRef)
    if(inputRef.current)
    {
      inputRef.current.focus()
      console.log(inputRef)
      textStartCoordinates.current.x = inputRef.current.offsetLeft
      textStartCoordinates.current.y = inputRef.current.offsetTop 
    }
     
  },[inputRef,text])
 
  const inputBlur = () =>{
    setIsInput(false)
    canvasCtx.font='16px serif'
    canvasCtx.textBaseline = 'middle'
    
    canvasCtx.fillText(inputRef.current.value, textStartCoordinates.current.x+1 , textStartCoordinates.current.y+1)
    reset()
  }


  const undo = (e) => {
    e.stopPropagation()
    if (undoState.length > 0) {
      setRedoState([...redoState, undoState[undoState.length - 1]])
      const state = undoState.slice(0, -1);
      setUndoState(state)
      redrawCanvas(state)
    }
  }
  
  // const undo = (e) =>{
  //   e.stopPropagation()
  //   if(undoState.length>0){
  //     setUndoState((prevDrawingState) => {
  //       setRedoState(prevRedoState=>[...prevRedoState, prevDrawingState[prevDrawingState.length-1]])
  //       const state = prevDrawingState.slice(0, -1);
  //       redrawCanvas(state);
  //       return state;
  //     });
  
  //   }
  // }

  const redrawCanvas =(state) =>{
    tempCanvasCtx.clearRect(0,0,tempRef.current.width,tempRef.current.height)
    canvasCtx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height)
    const img = new Image()
    img.src = state[state.length-1]
    img.onload = () =>{
      canvasCtx.drawImage(img,0,0)
    }
  }


const redo = (e) => {
  e.stopPropagation();
  if (redoState.length > 0) {
    const nextState = [...undoState, redoState[redoState.length - 1]];
    const nextRedoState = redoState.slice(0, -1);
    
    setUndoState(nextState);
    setRedoState(nextRedoState);

    redrawCanvas(nextState);
  }
}

  return (
    <div className="App">
      <Toolbar 
      undo={undo}
      redo={redo}/>
      {isInput && 
      <input ref={inputRef} 
      style={{position:'absolute' ,left:`${coordinates.x}px` ,top:`${coordinates.y}px` ,border:'1px solid black',zIndex:99}}
      onBlur={inputBlur}
       />}
      <canvas className='temp-canvas' ref={tempRef} style={{position:'absolute'}}></canvas>

      <canvas ref={canvasRef} style={{display:'block'}}></canvas>
     
    </div>
  );
}

export default memo(App);
