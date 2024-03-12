import React, { useEffect, useState } from "react";
import "./style.css";
import { Copy, X } from "lucide-react";
import shortid from "shortid";
import useSocket from "../../hooks/useSocket";

const ShareModal = ({ setModal }) => {
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (!localStorage.getItem("roomUuid")) return;
    const _user = JSON.parse(localStorage.getItem("roomUuid"));
    setUser(_user);
    setName(_user.name);
    setShowLink(true);
  }, []);

  useEffect(() => {
    if (socket && user.id !== undefined) {
      console.log(user.id);
      const id = user.id.split("/").slice(-1)[0];
      const initialData = localStorage.getItem("whiteboard")
        ? JSON.parse(localStorage.getItem("whiteboard"))
        : [];
      socket.emit("join", id, name);
      socket.emit("initialData", id, initialData);
    }
  }, [user.name, user.id, socket]);

  const getId = () => {
    return window.location.href + "share/" + shortid.generate();
  };

  const copy = () => {
    navigator.clipboard.writeText(user.id);
  };

  const changeHandler = (e) => {
    if (e.target.value === "") {
      setName("");
      setDisabled(true);
    } else {
      setName(e.target.value);
      setDisabled(false);
    }
  };

  const getLink = () => {
    setShowLink(true);
    if (!localStorage.getItem("roomUuid")) {
      const id = getId();
      const _user = { name, id };
      setUser(_user);
      localStorage.setItem("roomUuid", JSON.stringify(_user));
    } else {
      const _user = JSON.parse(localStorage.getItem("roomUuid"));
      setUser(_user);
    }
  };
  return (
    <div className="share-modal-container">
      <div className="share-modal">
        <div className="header">
          <div>Share Whiteboard</div>
          <button className="button" onClick={() => setModal(false)}>
            <X />
          </button>
        </div>
        <div className="content">
          <div className="name">
            <input
              className="input"
              value={name}
              onChange={changeHandler}
              placeholder="Enter Name"
            />
            <button
              disabled={disabled}
              onClick={getLink}
              className="link-button"
            >
              {showLink ? "Change Name" : "Get Link"}
            </button>
          </div>
          {showLink && (
            <div className="link">
              <div>{user.id}</div>
              <button className="button" onClick={copy}>
                <Copy />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
