import React, { useCallback, useState } from "react";
import { useSocket } from "../context/SocketProvider";
const Lobby = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket()
  console.log(socket)
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    socket.emit('room:join', { email, room });
    console.log({ email, room });
  }, [email, room, socket]);
  return (
    <div>
      <div>Lobby</div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email Id</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="room">Room No</label>
        <input
          type="text"
          id="room"
          name="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <br />
        <button>Join</button>
      </form>
    </div>
  );
};

export default Lobby;
