import React from "react";
import "./style.css";
const Cursor = (cursor) => {
  const userId = Object.keys(cursor)[0];
  let cursorPosition = cursor[userId];
  const id = Object.keys(cursorPosition)[0];
  const { color, cursor: position } = cursorPosition[id];
  return (
    <div
      style={{
        left: `${position.clientX}px`,
        top: `${position.clientY}px`,
        backgroundColor: color,
      }}
      className="cursor"
    ></div>
  );
};

export default Cursor;
