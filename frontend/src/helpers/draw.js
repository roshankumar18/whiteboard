const draw = ({pencil, line, square, ellipse }, x1, y1, x2, y2, tempCanvasCtx, roughCanvas, canvasWidth, canvasHeight, option) =>{
    if(pencil){
        tempCanvasCtx.lineCap = 'round'
        tempCanvasCtx.lineJoin = 'round'
        tempCanvasCtx.clearRect(0, 0, canvasWidth ,canvasHeight)
        tempCanvasCtx.lineWidth = option.strokeWidth
        tempCanvasCtx.strokeStyle = option.stroke
        tempCanvasCtx.lineTo(x2,y2)
        tempCanvasCtx.stroke()
      }

      if(line){
        tempCanvasCtx.clearRect(0, 0, canvasWidth ,canvasHeight)
        roughCanvas.line(
          x1,
          y1,
          x2,
          y2,
          option
        )
      }
      if(square){
        tempCanvasCtx.clearRect(0, 0, canvasWidth ,canvasHeight)
        roughCanvas.rectangle(
          x1,
          y1,
          x2-x1,
          y2-y1,
         option
        )
      }
      if(ellipse){
        tempCanvasCtx.clearRect(0, 0, canvasWidth ,canvasHeight)
        let width = x2-x1
        let height = y2-y1
        roughCanvas.ellipse(
          x1+width*1/2,
          y1+height*1/2,
          width,
          height,
          option
        )
      }
}

export default draw