import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './App.css';
import Toolbar from './components/toolbar/Toolbar';
import useTool from './hooks/tools';
import usePallete from './hooks/usePalette';
import { RoughCanvas } from 'roughjs/bin/canvas';
import draw from './helpers/draw';
import useSocket from './hooks/useSocket';
import drawFromLocalStrorage from './helpers/drawFromLocalStorage';
import getElementIndex from './helpers/getElement';
import Cursor from './components/cursor/Cursor';

function App() {
  const canvasRef = useRef()
  const tempRef = useRef()
  const inputRef = useRef(null)
  const textStartCoordinates = useRef({x:0,y:0})
  const [inputValue, setInputValue] = useState()
  const [coordinates,setCoordinates] = useState({x:0,y:0})
  const [mouseDown ,setMouseDown] = useState(false)
  const [canvasCtx ,setCanvasCtx] = useState(null)
  const [roughCanvas, setRoughCanvas] = useState(null)
  const [selectedElementIndex, setSelectedElementIndex] = useState(null)
  const [undoState, setUndoState] = useState([])
  const [redoState, setRedoState] = useState([])
  const [tempCanvasCtx ,setTempCanvasCtx] = useState(null)
  const [isInput ,setIsInput] = useState(false)
  const {tools,reset} = useTool()
  const {pencil,square,line,text,ellipse} = tools
  const {pallete} = usePallete()
  const {socket} = useSocket()
 
  useEffect(() => {
    let timeout;

    const focusInput = () => {
      if (inputRef.current && isInput) {
        console.log(inputRef)
        inputRef.current.focus();
        textStartCoordinates.current.x = inputRef.current.offsetLeft;
        textStartCoordinates.current.y = inputRef.current.offsetTop;
        console.log(textStartCoordinates.current.x);
      }
    }

    timeout = setTimeout(focusInput, 0)

    return () => {
      clearTimeout(timeout)
    };
  }, [inputRef, isInput])


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
  
  useEffect(() => {
    if (inputRef.current) {
       inputRef.current.style.height = "0px";
      const {scrollHeight,scrollWidth, clientWidth } = inputRef.current;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      inputRef.current.style.height = scrollHeight + "px";
      const newWidth = scrollWidth > clientWidth ? scrollWidth : clientWidth;
      inputRef.current.style.width = `${newWidth}px`;
      console.log(scrollWidth,clientWidth)
    }
  }, [inputRef, inputValue]);



  useEffect(()=>{
    if(!tempCanvasCtx || !tempRef) return
    drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef)
  },[tempCanvasCtx,tempRef])


  useEffect(()=>{
    const scaleFactor = window.devicePixelRatio;
    const canvas = canvasRef.current
    const tempCanvas = tempRef.current
    const handleResize = () =>{
      canvas.width = window.innerWidth * scaleFactor
      canvas.height = window.innerHeight * scaleFactor
      tempCanvas.width = window.innerWidth * scaleFactor
      tempCanvas.height = window.innerHeight * scaleFactor
      if(!tempCanvas || !canvasCtx) return
      drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef)
    } 
    
    window.addEventListener('resize',handleResize)
    return () =>{
      window.removeEventListener('resize',handleResize)
    }
  },[tempCanvasCtx,canvasCtx,tempRef])

  useEffect(() => {
    if (!socket || !tempCanvasCtx) return;

    if(localStorage.getItem('roomUuid')){
      let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')
      socket.emit('join',roomId)
    }
  
    const drawClientHandler = (tools, x1, y1, x2, y2, width, height, option) => {
      draw(tools, x1, y1, x2, y2, tempCanvasCtx, roughCanvas, width, height, option);
      console.log('draw client called');
    };
  
    const saveDrawingHandler = (element) =>{
      const existingDataString = localStorage.getItem('whiteboard');
      const existingDataArray = existingDataString ? JSON.parse(existingDataString) : []; 
      existingDataArray.push(element)
      localStorage.setItem('whiteboard', JSON.stringify(existingDataArray))
      saveDrawingOnMainCanvas()
      tempCanvasCtx.beginPath()
    }
    
    const mouseDownHandler = (x1, y1, tools, option) =>{
      console.log('mouse down')
      tempCanvasCtx.beginPath()
      tempCanvasCtx.moveTo(x1,y1)
      if(tools['pencil']){
        draw(tools, x1, y1, x1, y1, tempCanvasCtx, roughCanvas, tempRef.current.width, tempRef.current.height, option)
      }
        
      
    }

    const drawTextHandler =(data, x, y, lineHeight, option) =>{
      let myFont = new FontFace("virgil", "url(fonts/Virgil.woff2)");
      console.log(data,x,y,line,option)
      let text = data.split('\n')
      
  
      myFont.load().then((font) => {
       document.fonts.add(font)
       canvasCtx.font = `${pallete.fontSize}px ${myFont.family}`
       const measureText = canvasCtx.measureText(text)
       var lineHeight = 5 
       for(var i =0;i<text.length;i++){
        canvasCtx.fillText(text[i], x , y+ (measureText.actualBoundingBoxAscent*(i+1))+lineHeight)
        
       }

      });
    }
    socket.on('drawClient', drawClientHandler);
    socket.on('saveDrawing',saveDrawingHandler);
    socket.on('mouseDown',mouseDownHandler)
    socket.on('drawText',drawTextHandler)
    socket.on('initialData',(data)=>{
      localStorage.setItem('whiteboard',JSON.stringify(data.data))
      drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef)
    })
  
    return () => {
      socket.off('drawClient', drawClientHandler);
      socket.off('saveDrawing',saveDrawingHandler)
      socket.off('mouseDown',mouseDownHandler)
      socket.off('drawText',drawTextHandler)
    };
  }, [socket, tempCanvasCtx]);

  useEffect(()=>{
    if(!mouseDown ) return
      
    tempCanvasCtx.beginPath()

    let data;
    const existingDataString = localStorage.getItem('whiteboard');
    const existingDataArray = existingDataString ? JSON.parse(existingDataString) : []; 
    
    if(pencil){

       data = {
        type:Object.keys(tools).find(key=>tools[key]),
        points:[[coordinates.x,coordinates.y]],
        pallete:pallete
      }
      existingDataArray.push(data)
    }

    
    const mouseMove = (e) =>{ 
      if(tools.select && selectedElementIndex){
        const element = existingDataArray[selectedElementIndex]
        console.log(element);
      }
      const canvasHeight = tempRef.current.height
      const canvasWidth = tempRef.current.width
      const option = {
            stroke:pallete.color.hex,
            strokeWidth:pallete.strokeWidth,
            roughness:pallete.roughness,
          }
      draw(tools, coordinates.x, coordinates.y, e.clientX, e.clientY,tempCanvasCtx, roughCanvas, canvasWidth, canvasHeight, option)
      if (pencil)
        data.points.push([e.clientX, e.clientY])

      if(localStorage.getItem('roomUuid')){
        
        let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')

        socket.emit('drawImage',roomId,tools,coordinates.x,coordinates.y,e.clientX, e.clientY,canvasWidth,canvasHeight,option)
      }
      
    }
    tempRef.current.addEventListener('mousemove',mouseMove)
    return () => {
      if(pencil)
        localStorage.setItem('whiteboard',JSON.stringify(existingDataArray))  
      tempRef.current.removeEventListener('mousemove',mouseMove)

    }
  },[mouseDown,tempRef,tools,selectedElementIndex])





  const handleMouseDown = useCallback((e) =>{
    if(!tempRef.current && !tempCanvasCtx) return
    setMouseDown(true)
    if(tools.select===true){
      const elementIndex = getElementIndex(e.clientX, e.clientY)
      setSelectedElementIndex(elementIndex)
      
      return
    }
    const option = {
      stroke:pallete.color.hex,
      strokeWidth:pallete.strokeWidth,
      roughness:pallete.roughness,
      // bowing:4
    }
    let roomId
    if(localStorage.getItem('roomUuid')){
       roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')
    }
      
    // console.log(e.clientX,e.clientY)
    
    setCoordinates({
      x:e.clientX,
      y:e.clientY
    })
    if(pencil){
      tempCanvasCtx.beginPath()
      draw(tools, e.clientX,e.clientY, e.clientX, e.clientY,tempCanvasCtx, roughCanvas, tempRef.current.width, tempRef.current.height, option)
      }
    if(text){
      setIsInput(true)
    }
    
    
    if(!socket) return
    socket.emit('mouseDown', roomId, e.clientX, e.clientY ,tools ,option)

  },[text,pencil,tempCanvasCtx, mouseDown,socket,pallete,tools,coordinates,tempRef.current])

  const saveDrawingOnMainCanvas = () =>{
    // console.log(canvasCtx)
    setMouseDown(false)
    canvasCtx.drawImage(tempRef.current,0,0)
    tempCanvasCtx.clearRect(0, 0, tempRef.current.width, tempRef.current.height)
    const _tempDrawingState = [...undoState,canvasRef.current.toDataURL()]
    setUndoState(_tempDrawingState)
  }

  const saveDrawingInLocalStorage = (x, y, tools ,pallete) => {
    if(tools['select']) return
    
    const existingDataString = localStorage.getItem('whiteboard');
    const existingDataArray = existingDataString ? JSON.parse(existingDataString) : []; 
   
    const data = {
      type:Object.keys(tools).find(key=>tools[key]),
      points:[[coordinates.x,coordinates.y], [x,y]],
      pallete:pallete
    }
    existingDataArray.push(data)
    localStorage.setItem('whiteboard',JSON.stringify(existingDataArray))
    let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')
    socket.emit('saveDrawing',roomId,data)
  }

  const handleMouseUp = useCallback((e) =>{
    saveDrawingOnMainCanvas()
    saveDrawingInLocalStorage(e.clientX, e.clientY , tools, pallete)
    
    // socket.emit('saveDrawing',roomId)
   
  },[canvasCtx,tempCanvasCtx,undoState,tools,pallete,coordinates])

  useEffect(()=>{
    tempRef.current.addEventListener('mousedown',handleMouseDown)
    tempRef.current.addEventListener('mouseup',handleMouseUp)
    return () => {
      tempRef.current.removeEventListener('mousedown',handleMouseDown)
      tempRef.current.removeEventListener('mouseup',handleMouseUp)
    }
  },[canvasCtx,text,undoState,tempRef,tempCanvasCtx,roughCanvas,handleMouseDown,handleMouseUp])






 
  const inputBlur = (e) =>{
    // e.preventDefault()
    let myFont = new FontFace("virgil", "url(fonts/Virgil.woff2)");
    const data = inputRef.current.value
    const text = inputRef.current.value.split('\n')
    console.log(inputRef.current)

    myFont.load().then((font) => {
    const option = {
      stroke:pallete.color.hex,
      strokeWidth:pallete.strokeWidth,
      roughness:pallete.roughness,
      // bowing:4
    }
    console.log(canvasCtx)
     document.fonts.add(font)
     canvasCtx.font = `${pallete.fontSize}px ${myFont.family}`
     const measureText = canvasCtx.measureText(text)
     var lineHeight = 5 
     for(var i =0;i<text.length;i++){
      canvasCtx.fillText(text[i], textStartCoordinates.current.x , textStartCoordinates.current.y+(measureText.actualBoundingBoxAscent*(i+1))+lineHeight)
      
     }
    if(localStorage.getItem('roomUuid')){
      
    let roomId =  localStorage.getItem('roomUuid').split('/').pop().replace('"', '')

    socket.emit('drawText', roomId, data, textStartCoordinates.current.x, textStartCoordinates.current.y, lineHeight, option)
    }
    //  canvasCtx.textBaseline = 'bottom'
    });
        

    setInputValue('')
    setIsInput(false)
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

const inputChange = (e) =>{
  setInputValue(e.target.value)
}


  return (
    <div className="App">
      <Cursor/>
        {isInput && 
          <textarea 
          className='input-container'
          rows={1}
          value={inputValue}
          onChange={inputChange}
          style={{left:`${coordinates.x}px`,top:`${coordinates.y}px`,fontSize:`${pallete.fontSize}px` }}
          ref={inputRef}
          onBlur={inputBlur}
            />
           }
     

      <Toolbar 
      undo={undo}
      redo={redo}/>
   
      <canvas className='temp-canvas' ref={tempRef} style={{position:'absolute'}}></canvas>
    
      <canvas ref={canvasRef} style={{display:'block'}}></canvas>
     
    </div>
  );
}

export default memo(App);
