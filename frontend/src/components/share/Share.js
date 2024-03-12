import React, { useEffect, useState } from "react";
import { json, useLocation, useNavigate, useParams } from "react-router-dom";
import useSocket from "../../hooks/useSocket";
import "./style.css";
const Share = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [disabled, setDisabled] = useState(true);

  const inputHandler = (e) => {
    if (e.target.value === "") {
      setName(e.target.value);
      setDisabled(true);
    } else {
      setName(e.target.value);
      setDisabled(false);
    }
  };

  const onClick = (e) => {
    if (!socket) {
      throw new Error("Socket not initialised");
    } else {
      socket.emit("join", id, name);
      const room = {
        id: "http://localhost:3000" + location.pathname,
        name,
      };
      console.log(room);
      localStorage.setItem("roomUuid", JSON.stringify(room));
      socket.emit("getInitialData", id);

      navigate("/");
    }
  };
  return (
    <div className="share-container">
      <div className="header">
        <div>
          <input
            placeholder="Enter name"
            value={name}
            onChange={inputHandler}
          />
        </div>

        <button disabled={disabled} onClick={onClick}>
          Save
        </button>
      </div>
    </div>
  );
};

export default Share;
