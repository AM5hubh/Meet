import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer.js";

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCalllUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    console.log(offer);
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleincomingcall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("incoming:call", from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams =  useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handlecallaccepted = useCallback(
    async ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("call accepted");
    },
    []
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', {offer,to: remoteSocketId})
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded',handleNegotiationNeeded)
    return()=>{
      peer.peer.removeEventListener('negotiationneeded',handleNegotiationNeeded)
    }
  }, [handleNegotiationNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("got tracks")
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  const handleNegotiationIncoming = useCallback(async({from,offer})=>{
    const ans = await peer.getAnswer(offer)
    socket.emit('peer:nego:done',{to:from,ans})
  },[socket])

  const handleNegotiationFinal = useCallback(async({ans})=>{
    peer.setLocalDescription(ans)
  },[])

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleincomingcall);
    socket.on("call:accepted", handlecallaccepted);
    socket.on("peer:nego:needed",handleNegotiationIncoming)
    socket.on("peer:nego:final",handleNegotiationFinal)

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleincomingcall);
      socket.off("call:accepted", handlecallaccepted);
      socket.off("peer:nego:needed",handleNegotiationIncoming)
      socket.off("peer:nego:final",handleNegotiationFinal)


    };
  }, [socket, handleUserJoined, handleincomingcall, handlecallaccepted]);
  return (
    <div>
      <h1>Room</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in the room"}</h4>
      {myStream && <button onClick={sendStreams}>Join</button>}
      {remoteSocketId && <button onClick={handleCalllUser}>Call</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="300px"
            width="500px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="300px"
            width="500px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  );
};

export default Room;
