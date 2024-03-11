const getElementIndex = (x, y) => {
  const existingDataString = localStorage.getItem("whiteboard");
  const existingDataArray = existingDataString
    ? JSON.parse(existingDataString)
    : [];

  return existingDataArray.findIndex((element) => {
    const { type, points } = element;
    switch (type) {
      case "square":
        if (
          points[0][0] <= x &&
          points[1][0] >= x &&
          points[0][1] <= y &&
          points[1][1] >= y
        ) {
          return true;
        }
        break;

      case "ellipse":
        const width = points[1][0] - points[0][0];
        const height = points[1][1] - points[0][1];
        const centerX = points[0][0] + width / 2;
        const centerY = points[0][1] + height / 2;
        const semiMajorAxis = width / 2;
        const semiMinorAxis = height / 2;
        const normalizedX = (x - centerX) / semiMajorAxis;
        const normalizedY = (y - centerY) / semiMinorAxis;
        if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
          return true;
        }

        break;
      case "line":
        const a = { x: points[0][0], y: points[0][1] };
        const b = { x: points[1][0], y: points[1][1] };
        const c = { x, y };
        const totalDistance =
          distance(a, b) - (distance(a, c) + distance(b, c));

        if (totalDistance <= 1 && totalDistance >= -1) return true;
        break;

      case "pencil":
        const betweenAnyPoint = points.some((point, index) => {
          const nextPoint = points[index + 1];
          if (!nextPoint) return false;
          const a = { x: point[0], y: point[1] };
          const b = { x: nextPoint[0], y: nextPoint[1] };
          const c = { x, y };
          const totalDistance =
            distance(a, b) - (distance(a, c) + distance(b, c));
          if (totalDistance <= 2 && totalDistance >= -2) return true;
          return false;
        });
        return betweenAnyPoint;

        case "text":
          const x1 = points[0][0]
          const x2 = points[0][0]+element.measureText
          const y1 = points[0][1]
          if(x1>=x && x<=x2){
            return true
          }else{
            return false
          }
          break

        

      default:
        return false;
    }
    return false;
  });
};

const distance = (a, b) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
};

export default getElementIndex;
