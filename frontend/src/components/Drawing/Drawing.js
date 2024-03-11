import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./drawing.css";
import Toolbar from "../toolbar/Toolbar";
import useTool from "../../hooks/tools";
import usePallete from "../../hooks/usePalette";
import { RoughCanvas } from "roughjs/bin/canvas";
import draw from "../../helpers/draw";
import useSocket from "../../hooks/useSocket";
import drawFromLocalStrorage from "../../helpers/drawFromLocalStorage";
import getElementIndex from "../../helpers/getElement";
import updateElement from "../../helpers/updateElement";

function Drawing({ setToggle }) {
  const canvasRef = useRef();
  const tempRef = useRef();
  const inputRef = useRef(null);
  const textStartCoordinates = useRef({ x: 0, y: 0 });

  const [inputValue, setInputValue] = useState();
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [mouseDown, setMouseDown] = useState(false);
  const [canvasCtx, setCanvasCtx] = useState(null);
  const [roughCanvas, setRoughCanvas] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [undoState, setUndoState] = useState(localStorage.getItem('whiteboard')? JSON.parse(localStorage.getItem('whiteboard')) :[]);
  const [redoState, setRedoState] = useState([]);
  const [tempCanvasCtx, setTempCanvasCtx] = useState(null);
  const [isInput, setIsInput] = useState(false);

  const { tools, reset } = useTool();
  const { pencil, square, line, text, ellipse } = tools;
  const { pallete, changePallete } = usePallete();
  const { color,   strokeWidth,
    roughness,
    fontSize,} = pallete
  const { socket } = useSocket();

  let seedValue = Math.floor(Math.random() * Math.pow(2, 31)) + 1

  useEffect(() => {
    let timeout;

    const focusInput = () => {
      if (inputRef.current && isInput) {
        console.log(inputRef);
        inputRef.current.focus();
        textStartCoordinates.current.x = inputRef.current.offsetLeft;
        textStartCoordinates.current.y = inputRef.current.offsetTop;
        console.log(textStartCoordinates.current.x);
      }
    };

    timeout = setTimeout(focusInput, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputRef, isInput]);

  useEffect(() => {
    if (canvasRef) {
      const canvas = canvasRef.current;
      const tempCanvas = tempRef.current;
      const roughCanvas = new RoughCanvas(tempCanvas);
      setRoughCanvas(roughCanvas);
      const ctx = canvas.getContext("2d");
      const tempCtx = tempCanvas.getContext("2d");
      // ctx.imageSmoothingEnabled = true

      setCanvasCtx(ctx);
      setTempCanvasCtx(tempCtx);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      tempCanvas.width = window.innerWidth;
      tempCanvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "0px";
      const { scrollHeight, scrollWidth, clientWidth } = inputRef.current;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      inputRef.current.style.height = scrollHeight + "px";
      const newWidth = scrollWidth > clientWidth ? scrollWidth : clientWidth;
      inputRef.current.style.width = `${newWidth}px`;
      console.log(scrollWidth, clientWidth);
    }
  }, [inputRef, inputValue]);

  useEffect(() => {
    if (!tempCanvasCtx || !tempRef) return;
    const storage = JSON.parse(localStorage.getItem('whiteboard'))
    drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef,storage);
  }, [tempCanvasCtx, tempRef]);

  useEffect(() => {
    const scaleFactor = window.devicePixelRatio;
    const canvas = canvasRef.current;
    const tempCanvas = tempRef.current;
    const handleResize = () => {
      canvas.width = window.innerWidth * scaleFactor;
      canvas.height = window.innerHeight * scaleFactor;
      tempCanvas.width = window.innerWidth * scaleFactor;
      tempCanvas.height = window.innerHeight * scaleFactor;
      if (!tempCanvas || !canvasCtx) return;
      const storage = JSON.parse(localStorage.getItem('whiteboard'))
      drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef, storage);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [tempCanvasCtx, canvasCtx, tempRef]);

  useEffect(() => {
    if (!socket || !tempCanvasCtx) return;

    if (localStorage.getItem("roomUuid")) {
      let roomId = JSON.parse(localStorage
        .getItem("roomUuid")
      )
        .id
        .split("/")
        .pop()
        .replace('"', "");
      socket.emit("join", roomId);
    }

    const drawClientHandler = (
      tools,
      x1,
      y1,
      x2,
      y2,
      width,
      height,
      option,
    ) => {
      draw(
        tools,
        x1,
        y1,
        x2,
        y2,
        tempCanvasCtx,
        roughCanvas,
        width,
        height,
        option,
      );
      console.log("draw client called");
    };

    const saveDrawingHandler = (element) => {
      const existingDataString = localStorage.getItem("whiteboard");
      const existingDataArray = existingDataString
        ? JSON.parse(existingDataString)
        : [];
      existingDataArray.push(element);
      localStorage.setItem("whiteboard", JSON.stringify(existingDataArray));
      saveDrawingOnMainCanvas();
      tempCanvasCtx.beginPath();
    };

    const mouseDownHandler = (x1, y1, tools, option) => {
      console.log("mouse down");
      tempCanvasCtx.beginPath();
      tempCanvasCtx.moveTo(x1, y1);
      if (tools["pencil"]) {
        draw(
          tools,
          x1,
          y1,
          x1,
          y1,
          tempCanvasCtx,
          roughCanvas,
          tempRef.current.width,
          tempRef.current.height,
          option,
        );
      }
    };

    const drawTextHandler = (data, x, y, lineHeight, option) => {
      let myFont = new FontFace("virgil", "url(fonts/Virgil.woff2)");
      console.log(data, x, y, line, option);
      let text = data.split("\n");

      myFont.load().then((font) => {
        document.fonts.add(font);
        canvasCtx.font = `${option.fontSize}px ${myFont.family}`;
        const measureText = canvasCtx.measureText(text);
        var lineHeight = 5;
        for (var i = 0; i < text.length; i++) {
          canvasCtx.fillText(
            text[i],
            x,
            y + measureText.actualBoundingBoxAscent * (i + 1) + lineHeight,
          );
        }
      });
    };

    const updateElementHandler = (element) => {
      const existingDataString = localStorage.getItem("whiteboard");
      const existingDataArray = existingDataString
        ? JSON.parse(existingDataString)
        : [];
      const index = existingDataArray.findIndex(
        (value) => element.id === value.id,
      );
      existingDataArray[index] = element;
      localStorage.setItem("whiteboard", JSON.stringify(existingDataArray));
      drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef,existingDataArray);
    };

    const initialDataHandler = (data) => {
      localStorage.setItem("whiteboard", JSON.stringify(data.data));
      drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef, data.data);
    };

    socket.on("drawClient", drawClientHandler);
    socket.on("saveDrawing", saveDrawingHandler);
    socket.on("mouseDown", mouseDownHandler);
    socket.on("drawText", drawTextHandler);
    socket.on("updateElement", updateElementHandler);
    socket.on("initialData", initialDataHandler);

    return () => {
      socket.off("drawClient", drawClientHandler);
      socket.off("saveDrawing", saveDrawingHandler);
      socket.off("mouseDown", mouseDownHandler);
      socket.off("drawText", drawTextHandler);
      socket.off("updateElement", updateElementHandler);
      socket.off("initialData", initialDataHandler);
    };
  }, [socket, tempCanvasCtx]);


  // useEffect(()=>{
  //   if(!selectedElement) return
  //   console.log('1')
  //   const element = selectedElement
  //   const {type,points} = element
  //   element.pallete = {...selectedElement.pallete,...pallete}
  //   element.pallete.stroke = element.pallete.color.hex
  //   console.log(element)
  //   draw(
  //     { [type]: true },
  //     points[0][0] ,
  //     points[0][1] ,
  //     points[1][0] ,
  //     points[1][1] ,
  //     tempCanvasCtx,
  //     roughCanvas,
  //     tempRef.current.width,
  //     tempRef.current.height,
  //     selectedElement.pallete,
  //   )
  //   setSelectedElement(element)
  // },[pallete,selectedElement])

  useEffect(() => {
    if (!tempCanvasCtx) return;
    // if(tools['text']) return;
    tempCanvasCtx.beginPath();

    let data;
    const existingDataString = localStorage.getItem("whiteboard");
    let existingDataArray = existingDataString
      ? JSON.parse(existingDataString)
      : [];

    if (pencil) {
      data = {
        id: Date.now().toString(),
        type: Object.keys(tools).find((key) => tools[key]),
        points: [[coordinates.x, coordinates.y]],
        pallete: pallete,
      };
      existingDataArray.push(data);
      // localStorage.setItem('whiteboard',JSON.stringify(existingDataArray))
    }
    const option = {
      stroke: pallete.color.hex,
      strokeWidth: pallete.strokeWidth,
      roughness: pallete.roughness,
      seed:seedValue
    };
    
    const _selectedElement = selectedElement
    console.log(_selectedElement)
    
    const mouseMove = (e) => {
      if (tools.select) {
        if (getElementIndex(e.clientX, e.clientY) !== -1) {
          tempRef.current.style.cursor = "pointer";
        } else {
          tempRef.current.style.cursor = "crosshair";
        }
      }
      if (!mouseDown) return;
      const canvasHeight = tempRef.current.height;
      const canvasWidth = tempRef.current.width;

      if (tools.select && _selectedElement) {
        const element = _selectedElement;
        console.log(element)
        const { type, points, pallete } = element;
        console.log(pallete)
        pallete.stroke = pallete.color.hex;
        const offSetX = e.clientX - coordinates.x;
        const offSetY = e.clientY - coordinates.y;

        if (type === "pencil") {
          
          const newPoints = points.map((point) => [
            point[0] + offSetX,
            point[1] + offSetY,
          ]);
          
          tempCanvasCtx.beginPath();
          if (newPoints.length === 1) {
            const [x1, y1] = newPoints[0];
            draw(
              { [type]: true },
              x1,
              y1,
              x1,
              y1,
              tempCanvasCtx,
              roughCanvas,
              tempRef.current.width,
              tempRef.current.height,
              pallete,
            );
          } else {
            for (let i = 1; i < newPoints.length - 1; i++) {
              const [x1, y1] = newPoints[i - 1];
              const [x2, y2] = newPoints[i];
              draw(
                { [type]: true },
                x1,
                y1,
                x2,
                y2,
                tempCanvasCtx,
                roughCanvas,
                tempRef.current.width,
                tempRef.current.height,
                pallete,
              );
            }
          }
          return;
        }

        // draw(
        //   { [type]: true },
        //   points[0][0] + offSetX,
        //   points[0][1] + offSetY,
        //   points[1][0] + offSetX,
        //   points[1][1] + offSetY,
        //   tempCanvasCtx,
        //   roughCanvas,
        //   canvasWidth,
        //   canvasHeight,
        //   pallete,
        // );
        draw(
          { [type]: true },
          points[0][0] + offSetX,
          points[0][1] + offSetY,
          points[1][0] + offSetX,
          points[1][1] + offSetY,
          tempCanvasCtx,
          roughCanvas,
          canvasWidth,
          canvasHeight,
          pallete,
        );
        return;
      }


      draw(
        tools,
        coordinates.x,
        coordinates.y,
        e.clientX,
        e.clientY,
        tempCanvasCtx,
        roughCanvas,
        canvasWidth,
        canvasHeight,
        option,
      );
      if (pencil) {
        data.points.push([e.clientX, e.clientY]);
        existingDataArray.splice(-1,1,data)
        localStorage.setItem("whiteboard", JSON.stringify(existingDataArray))
      }

      if (localStorage.getItem("roomUuid")) {
        let roomId = JSON.parse(localStorage
          .getItem("roomUuid")
        )
          .id
          .split("/")
          .pop()
          .replace('"', "");

        socket.emit(
          "drawImage",
          roomId,
          tools,
          coordinates.x,
          coordinates.y,
          e.clientX,
          e.clientY,
          canvasWidth,
          canvasHeight,
          option,
        );
      }
    };
    tempRef.current.addEventListener("mousemove", mouseMove);
    return () => {
        
      tempRef.current.removeEventListener("mousemove", mouseMove);
    };
  }, [mouseDown, tempRef, tools, selectedElement]);

  const handleMouseDown = useCallback(
    (e) => {
      if (!tempRef.current && !tempCanvasCtx) return;
      setSelectedElement(null)
      setMouseDown(true);
      setCoordinates({
        x: e.clientX,
        y: e.clientY,
      });
      if (tools.select === true) {
        const elementIndex = getElementIndex(e.clientX, e.clientY);
        const existingDataString = localStorage.getItem("whiteboard");
        let existingDataArray = existingDataString
          ? JSON.parse(existingDataString)
          : [];
        if (elementIndex !== -1) {
          setSelectedElement(existingDataArray[elementIndex]);
          console.log(elementIndex);
          const element = existingDataArray.splice(elementIndex, 1);
          const { type, points, pallete, seed } = element[0];
          pallete.stroke = pallete.color.hex;
          pallete.seed = seed
          localStorage.setItem("whiteboard", JSON.stringify(existingDataArray));
          canvasCtx.clearRect(
            0,
            0,
            tempRef.current.width,
            tempRef.current.height,
          );
          drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef,existingDataArray);
          
          if(type==='pencil'){
            
            tempCanvasCtx.beginPath();
            for (let i = 0; i < points.length - 1; i++) {
              let x1, y1, x2, y2
              if(i===0){
                [x1, y1] = points[0];
                [x2, y2] = points[0];
              }else{
                [x1, y1] = points[i - 1];
                [x2, y2] = points[i];
              }

              draw(
                { [type]: true },
                x1,
                y1,
                x2,
                y2,
                tempCanvasCtx,
                roughCanvas,
                tempRef.current.width,
                tempRef.current.height,
                pallete,
              );
            }

            return
          }
          draw(
            { [type]: true },
            points[0][0],
            points[0][1],
            points[1][0],
            points[1][1],
            tempCanvasCtx,
            roughCanvas,
            tempRef.current.width,
            tempRef.current.height,
            pallete,
          );
          return;
        } else setSelectedElement(null);

        return;
      }
      const option = {
        stroke: pallete.color.hex,
        strokeWidth: pallete.strokeWidth,
        roughness: pallete.roughness,
        // bowing:4
      };
      let roomId;
      if (localStorage.getItem("roomUuid")) {
        roomId = JSON.parse(localStorage
          .getItem("roomUuid"))
          .id
          .split("/")
          .pop()
          .replace('"', "");
      }

      if (text) {
        setIsInput(true);
      }

      if (!socket) return;
      socket.emit("mouseDown", roomId, e.clientX, e.clientY, tools, option);
    },
    [
      text,
      pencil,
      tempCanvasCtx,
      mouseDown,
      socket,
      pallete,
      tools,
      coordinates,
      tempRef.current,
    ],
  );

  const saveDrawingOnMainCanvas = () => {
    setMouseDown(false);
    canvasCtx.drawImage(tempRef.current, 0, 0);
    tempCanvasCtx.clearRect(
      0,
      0,
      tempRef.current.width,
      tempRef.current.height,
    );
  };

  const saveDrawingInLocalStorage = (x, y, tools, pallete) => {
    if (tools["select"] && selectedElement === null || tools['text']) return;

    const existingDataString = localStorage.getItem("whiteboard");
    const existingDataArray = existingDataString
      ? JSON.parse(existingDataString)
      : [];
      let roomId = JSON.parse(localStorage
        .getItem("roomUuid")
      )
      .id
      .split("/")
      .pop()
      .replace('"', "");

    if (tools["select"] && selectedElement !== null) {
      const updatedElement = updateElement(
        selectedElement,
        x,
        y,
        coordinates.x,
        coordinates.y,
        existingDataArray,
        
      );
      socket.emit("updateElement", roomId, updatedElement);
      return;
    }
    if(tools['pencil']) {
      let existingDataArray = JSON.parse(localStorage.getItem('whiteboard'))
      let pencilData = existingDataArray[existingDataArray.length-1]
      setUndoState(undo=>[...undo,pencilData])
      socket.emit('saveDrawing',roomId,pencilData)
      return
    }

    if(coordinates.x===x && coordinates.y===y)
      return
    const data = {
      id: Date.now().toString(),
      type: Object.keys(tools).find((key) => tools[key]),
      points: [
        [coordinates.x, coordinates.y],
        [x, y],
      ],
      pallete: pallete,
      seed:seedValue
    };
    if (!data.type) {
      return;
    }
    
    existingDataArray.push(data);
    setUndoState(undo=>[...undo,data])
    setRedoState([])
    localStorage.setItem("whiteboard", JSON.stringify(existingDataArray));

    socket.emit("saveDrawing", roomId, data);
  };

  const handleMouseUp = useCallback(
    (e) => {
      saveDrawingOnMainCanvas();
      saveDrawingInLocalStorage(e.clientX, e.clientY, tools, pallete);

      // socket.emit('saveDrawing',roomId)
    },
    [canvasCtx, tempCanvasCtx, undoState, tools, pallete, coordinates],
  );

  useEffect(() => {
    tempRef.current.addEventListener("mousedown", handleMouseDown);
    tempRef.current.addEventListener("mouseup", handleMouseUp);
    return () => {
      tempRef.current.removeEventListener("mousedown", handleMouseDown);
      tempRef.current.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    canvasCtx,
    text,
    undoState,
    tempRef,
    tempCanvasCtx,
    roughCanvas,
    handleMouseDown,
    handleMouseUp,
  ]);

  const inputBlur = (e) => {
    if(inputRef.current.value==''){
      setIsInput(false);
      reset();
    }
    // e.preventDefault()
    let myFont = new FontFace("virgil", "url(fonts/Virgil.woff2)");
    const textValue = inputRef.current.value;
    const text = inputRef.current.value.split("\n");
    console.log(inputRef.current);

    myFont.load().then((font) => {
      const option = {
        color: pallete.color,
        strokeWidth: pallete.strokeWidth,
        roughness: pallete.roughness,
        fontSize: pallete.fontSize,
      };
      document.fonts.add(font);
      canvasCtx.font = `${pallete.fontSize}px ${myFont.family}`;
      const measureText = canvasCtx.measureText(text);
      console.log(measureText)
      var lineHeight = 5;
      for (var i = 0; i < text.length; i++) {
        canvasCtx.fillText(
          text[i],
          textStartCoordinates.current.x,
          textStartCoordinates.current.y +
            measureText.actualBoundingBoxAscent * (i + 1) +
            lineHeight,
        );
      }
      const existingDataString = localStorage.getItem("whiteboard");
      const existingDataArray = existingDataString
        ? JSON.parse(existingDataString)
        : [];
      const data = {
        type: "text",
        points: [
          [textStartCoordinates.current.x, textStartCoordinates.current.y],
        ],
        pallete: option,
        text: textValue,
        measureText:measureText.width
      };
      existingDataArray.push(data);
      console.log(existingDataArray)
      localStorage.setItem("whiteboard", JSON.stringify(existingDataArray));

      if (localStorage.getItem("roomUuid")) {
        let roomId = JSON.parse(localStorage
          .getItem("roomUuid")
        ).id
          .split("/")
          .pop()
          .replace('"', "");

        socket.emit(
          "drawText",
          roomId,
          textValue,
          textStartCoordinates.current.x,
          textStartCoordinates.current.y,
          lineHeight,
          option,
        );
        socket.emit("saveDrawing", roomId, data);
      }
      //  canvasCtx.textBaseline = 'bottom'
    });

    setInputValue("");
    setIsInput(false);
    reset();
  };

  const undo = (e) => {
    e.stopPropagation();
    if (undoState.length > 0) {
      setRedoState([...redoState, undoState[undoState.length - 1]]);
      const state = undoState.slice(0, -1);
      setUndoState(state);
      drawFromLocalStrorage(tempCanvasCtx,roughCanvas,canvasCtx,tempRef,state)
      // redrawCanvas(state);
    }
  };

  const redrawCanvas = (state) => {
    tempCanvasCtx.clearRect(
      0,
      0,
      tempRef.current.width,
      tempRef.current.height,
    );
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height,
    );
    const img = new Image();
    img.src = state[state.length - 1];
    img.onload = () => {
      canvasCtx.drawImage(img, 0, 0);
    };
  };

  const redo = (e) => {
    e.stopPropagation();
    if (redoState.length > 0) {
      const nextUndoState = [...undoState, redoState[redoState.length - 1]];
      const nextRedoState = redoState.slice(0, -1);

      setUndoState(nextUndoState);
      setRedoState(nextRedoState);
      drawFromLocalStrorage(tempCanvasCtx,roughCanvas,canvasCtx,tempRef,nextUndoState)
      
    }
  };

  const inputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="App">
      {isInput && (
        <textarea
          className="input-container"
          rows={1}
          value={inputValue}
          onChange={inputChange}
          style={{
            left: `${coordinates.x}px`,
            top: `${coordinates.y}px`,
            fontSize: `${pallete.fontSize}px`,
          }}
          ref={inputRef}
          onBlur={inputBlur}
        />
      )}

      <Toolbar undo={undo} redo={redo} setToggle={setToggle} />

      <canvas
        className="temp-canvas"
        ref={tempRef}
        style={{ position: "absolute" }}
      ></canvas>

      <canvas ref={canvasRef} style={{ display: "block" }}></canvas>
    </div>
  );
}

export default memo(Drawing);
