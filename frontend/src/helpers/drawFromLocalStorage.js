import draw from "./draw";

const drawFromLocalStrorage = (tempCanvasCtx, roughCanvas, canvasCtx, tempRef) =>{
    if(localStorage.getItem('whiteboard')){
      const whiteboard = JSON.parse(localStorage.getItem('whiteboard'))
      whiteboard.forEach(element => {
        const {type, pallete, points} = element
        const option = {
          stroke:pallete.color.hex,
          strokeWidth:pallete.strokeWidth,
          roughness:pallete.roughness,
        }
        tempCanvasCtx.beginPath()
        if(type==='pencil'){
          if(element.points.length===1){
            const [x1,y1] = element.points[0]
            draw({[type]:true},x1, y1, x1, y1, tempCanvasCtx, roughCanvas, tempRef.current.width, tempRef.current.height, option)
          }else{
            for(let i  =1 ;i<element.points.length-1 ;i++){
              const [x1,y1] = element.points[i-1]
              const [x2,y2] = element.points[i]
              draw({[type]:true},x1, y1, x2, y2, tempCanvasCtx, roughCanvas, tempRef.current.width, tempRef.current.height, option)
            }
          }

        }
        else
          draw({[type]:true},points[0][0], points[0][1], points[1][0], points[1][1], tempCanvasCtx, roughCanvas, tempRef.current.width, tempRef.current.height, option);
        canvasCtx.drawImage(tempRef.current,0,0)
      });

    }
  }

  export default drawFromLocalStrorage