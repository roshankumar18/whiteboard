const updateElement = (selectedElement, x, y, x1, y1, existingDataArray,pallete) => {
  const offSetX = x - x1;
  const offSetY = y - y1;
  if(selectedElement.type==='text')return
  if (selectedElement.type === "pencil") {
    selectedElement.points = selectedElement.points.map((point) => [
      point[0] + offSetX,
      point[1] + offSetY,
    ]);
  } else {
    const [oldCord1, oldCord2] = selectedElement.points;
    // selectedElement.pallete = {...selectedElement.pallete,...pallete}
    selectedElement.points = [
      [oldCord1[0] + offSetX, oldCord1[1] + offSetY],
      [oldCord2[0] + offSetX, oldCord2[1] + offSetY],
    ];
  }

  existingDataArray.push(selectedElement);
  localStorage.setItem("whiteboard", JSON.stringify(existingDataArray));
  return selectedElement;
};

export default updateElement;
