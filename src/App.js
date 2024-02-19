import { memo, useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import Toolbar from './components/Toolbar';
import useTool from './utils/tools';
import usePallete from './utils/usePalette';
import { RoughCanvas } from 'roughjs/bin/canvas';
import draw from './helpers/draw';
import {io} from 'socket.io-client'
import useSocket from './utils/useSocket';

function App() {
  const canvasRef = useRef()
  const tempRef = useRef()
  const inputRef = useRef()
  const textStartCoordinates = useRef({x:0,y:0})
  const [coordinates,setCoordinates] = useState({x:0,y:0})
  const [mouseDown ,setMouseDown] = useState(false)
  const [canvasCtx ,setCanvasCtx] = useState(null)
  const [roughCanvas, setRoughCanvas] = useState(null)
  const [undoState, setUndoState] = useState([])
  const [redoState, setRedoState] = useState([])
  const [tempCanvasCtx ,setTempCanvasCtx] = useState(null)
  const [isInput ,setIsInput] = useState(false)
  const {tools,reset} = useTool()
  const {pencil,square,line,text,ellipse} = tools
  const {pallete} = usePallete()
  const {socket} = useSocket()

  useEffect(()=>{
   
    if(canvasRef){
      const canvas = canvasRef.current
      const tempCanvas = tempRef.current
      const roughCanvas = new RoughCanvas(tempCanvas)
      setRoughCanvas(roughCanvas)
      const ctx=  canvas.getContext("2d")
      const tempCtx=  tempCanvas.getContext("2d")
      // ctx.imageSmoothingEnabled = true
      
      setCanvasCtx(ctx)
      setTempCanvasCtx(tempCtx)
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      tempCanvas.width = window.innerWidth
      tempCanvas.height = window.innerHeight

    }
  },[])
  



  useEffect(()=>{
    const scaleFactor = window.devicePixelRatio;
    const canvas = canvasRef.current
    const tempCanvas = tempRef.current
    const handleResize = () =>{
      canvas.width = window.innerWidth * scaleFactor
      canvas.height = window.innerHeight * scaleFactor
      tempCanvas.width = window.innerWidth * scaleFactor
      tempCanvas.height = window.innerHeight * scaleFactor
    } 

    window.addEventListener('resize',handleResize)
    return () =>{
      window.removeEventListener('resize',handleResize)
    }
  },[])

  useEffect(() => {
    if (!socket || !tempCanvasCtx) return;
  
    const drawClientHandler = (tools, x1, y1, x2, y2, width, height, option) => {
      draw(tools, x1, y1, x2, y2, tempCanvasCtx, roughCanvas, width, height, option);
      console.log('draw client called');
    };
  
    const saveDrawingHandler = () =>{
      console.log('save called')
      saveDrawingOnMainCanvas()
    }
    
    const mouseDownHandler = (x1,y1) =>{
      console.log('mouse down')
      tempCanvasCtx.beginPath()
      tempCanvasCtx.moveTo(x1,y1)
    }
    socket.on('drawClient', drawClientHandler);
    socket.on('saveDrawing',saveDrawingHandler);
    socket.on('mouseDown',mouseDownHandler)
  
    return () => {
      socket.off('drawClient', drawClientHandler);
      socket.off('saveDrawing',saveDrawingHandler)
      socket.off('mouseDown',mouseDownHandler)
    };
  }, [socket, tempCanvasCtx]);

  useEffect(()=>{
    if(!mouseDown)
      return
    tempCanvasCtx.beginPath()
    // tempCanvasCtx.moveTo(coordinates.x,coordinates.y)
    // tempCanvasCtx.lineWidth = pallete.strokeWidth
    // tempCanvasCtx.strokeStyle = pallete.color.hex
    tempCanvasCtx.lineCap = 'round'
    
    const mouseMove = (e) =>{ 
      const canvasHeight = tempRef.current.height
      const canvasWidth = tempRef.current.width
      const option = {
            stroke:pallete.color.hex,
            strokeWidth:pallete.strokeWidth,
            roughness:pallete.roughness,
            // bowing:4
          }
      draw(tools, coordinates.x, coordinates.y, e.clientX, e.clientY,tempCanvasCtx, roughCanvas, canvasWidth, canvasHeight, option)
      
      if(localStorage.getItem('roomUuid')){
        
        let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')

        socket.emit('drawImage',roomId,tools,coordinates.x,coordinates.y,e.clientX, e.clientY,canvasWidth,canvasHeight,option)
      }
      
    }
    tempRef.current.addEventListener('mousemove',mouseMove)
    return () => {
      tempRef.current.removeEventListener('mousemove',mouseMove)

    }
  },[mouseDown,tempRef])



  // useEffect(()=>{
  //   if(canvasCtx===null || tempCanvasCtx===null)
  //     return
  //   canvasCtx.strokeStyle = pallete.color.hex
  //   tempCanvasCtx.strokeStyle =pallete.color.hex
  //   console.log(pallete.color)
  // },[canvasCtx,tempCanvasCtx,pallete.color])

  const handleMouseDown = useCallback((e) =>{
    console.log(e.clientX,e.clientY)
    setMouseDown(true)
    setCoordinates({
      x:e.clientX,
      y:e.clientY
    })
    if(pencil){
      console.log(pencil,'called')
      tempCanvasCtx.moveTo(e.clientX,e.clientY)
      tempCanvasCtx.lineTo(e.clientX,e.clientY)
      tempCanvasCtx.stroke()
    }
    if(text){
      setIsInput(true)
    }else{
      setIsInput(false)
    }
    
    let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')
    
    socket.emit('mouseDown', roomId, e.clientX, e.clientY)

  },[text,pencil,mouseDown])

  const saveDrawingOnMainCanvas = () =>{
    setMouseDown(false)
    canvasCtx.drawImage(tempRef.current,0,0)
    tempCanvasCtx.clearRect(0, 0, tempRef.current.width, tempRef.current.height)
    const _tempDrawingState = [...undoState,canvasRef.current.toDataURL()]
    setUndoState(_tempDrawingState)
  }

  const handleMouseUp = useCallback((e) =>{
    saveDrawingOnMainCanvas()

    let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')
    socket.emit('saveDrawing',roomId)

   
  },[canvasCtx,tempCanvasCtx,undoState])

  useEffect(()=>{
    tempRef.current.addEventListener('mousedown',handleMouseDown)
    tempRef.current.addEventListener('mouseup',handleMouseUp)
    return () => {
      tempRef.current.removeEventListener('mousedown',handleMouseDown)
      tempRef.current.removeEventListener('mouseup',handleMouseUp)
    }
  },[canvasCtx,text,undoState,tempRef,handleMouseDown,handleMouseUp])

  useEffect(() => {
    console.log(inputRef)
    if (inputRef.current && isInput) {
      inputRef.current.focus();
      textStartCoordinates.current.x = inputRef.current.offsetLeft;
      textStartCoordinates.current.y = inputRef.current.offsetTop;
    }
  }, [inputRef, isInput]);

 
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
      <div className='input-container'
        style={{left:`${coordinates.x}px` ,top:`${coordinates.y}px` }}>
        {isInput && 
          <input 
          ref={inputRef}
          
          onBlur={inputBlur}
            />}
      </div>

      <Toolbar 
      undo={undo}
      redo={redo}/>
   
      <canvas className='temp-canvas' ref={tempRef} style={{position:'absolute'}}></canvas>
    
      <canvas ref={canvasRef} style={{display:'block'}}></canvas>
     
    </div>
  );
}

export default memo(App);
