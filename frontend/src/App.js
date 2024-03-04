import React, { useState } from "react";
import "./App.css";
import useCursor from "./hooks/useCursor";
import Cursor from "./components/cursor/Cursor";
import Drawing from "./components/Drawing/Drawing";
import Chat from "./components/chat/Chat";
const App = () => {
  const { cursors } = useCursor();
  const [toggle, setToggle] = useState(false);
  return (
    <div className="main">
      {toggle && (
        <div className="chat-main">
          <Chat toggle={toggle} setToggle={setToggle} />
        </div>
      )}

      {cursors.length > 0 &&
        cursors.map((cursor) => {
          return <Cursor key={cursor} cursor={cursor} />;
        })}
      <Drawing setToggle={setToggle} />
    </div>
  );
};

export default App;
