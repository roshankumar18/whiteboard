// import { useEffect } from 'react';
// import draw from '../helpers/draw';
// import drawFromLocalStrorage from '../helpers/drawFromLocalStorage';

// const useWhiteboardSocket = (socket, tempCanvasCtx, roughCanvas, canvasCtx, tempRef) => {
//   useEffect(() => {
//     if (!socket || !tempCanvasCtx) return;

//     if (localStorage.getItem('roomUuid')) {
//       let roomId = localStorage.getItem('roomUuid').split('/').pop().replace('"', '');
//       socket.emit('join', roomId);
//     }

//     const drawClientHandler = (tools, x1, y1, x2, y2, width, height, option) => {
//       draw(tools, x1, y1, x2, y2, tempCanvasCtx, roughCanvas, width, height, option);
//       console.log('draw client called');
//     };

//     const saveDrawingHandler = (element) => {
//       console.log('save called');
//       saveDrawingOnMainCanvas();
//       tempCanvasCtx.beginPath();
//     };

//     const mouseDownHandler = (x1, y1, tools, option) => {
//       console.log('mouse down');
//       tempCanvasCtx.beginPath();
//       tempCanvasCtx.moveTo(x1, y1);
//       if (tools['pencil']) {
//         draw(
//           tools,
//           x1,
//           y1,
//           x1,
//           y1,
//           tempCanvasCtx,
//           roughCanvas,
//           tempRef.current.width,
//           tempRef.current.height,
//           option
//         );
//       }
//     };

//     const drawTextHandler = (data, x, y, lineHeight, option) => {
//       let myFont = new FontFace('virgil', 'url(fonts/Virgil.woff2)');
//       console.log(data, x, y, lineHeight, option);
//       let text = data.split('\n');

//       myFont.load().then((font) => {
//         document.fonts.add(font);
//         canvasCtx.font = `${pallete.fontSize}px ${myFont.family}`;
//         const measureText = canvasCtx.measureText(text);
//         var lineHeight = 5;
//         for (var i = 0; i < text.length; i++) {
//           canvasCtx.fillText(
//             text[i],
//             x,
//             y + measureText.actualBoundingBoxAscent * (i + 1) + lineHeight
//           );
//         }
//       });
//     };

//     socket.on('drawClient', drawClientHandler);
//     socket.on('saveDrawing', saveDrawingHandler);
//     socket.on('mouseDown', mouseDownHandler);
//     socket.on('drawText', drawTextHandler);
//     socket.on('initialData', (data) => {
//       localStorage.setItem('whiteboard', JSON.stringify(data.data));
//       drawFromLocalStrorage(tempCanvasCtx, roughCanvas, canvasCtx, tempRef);
//     });

//     return () => {
//       socket.off('drawClient', drawClientHandler);
//       socket.off('saveDrawing', saveDrawingHandler);
//       socket.off('mouseDown', mouseDownHandler);
//       socket.off('drawText', drawTextHandler);
//     };
//   }, [socket, tempCanvasCtx]);

 
// };

// export default useWhiteboardSocket;
