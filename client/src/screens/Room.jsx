import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider'

const Room = () => {
  const socket = useSocket()
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState(null)
  
  const handleUserJoined = useCallback(({email,id})=>{
    console.log(`Email ${email} joined room`)
    setRemoteSocketId(id)
  },[])

  const handleCalllUser = useCallback(async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true,video:true})
    const offer = await peer.getOffer()
    socket.emit("user:call", {to: remoteSocketId, offer})
    setMyStream(stream)
  },[])

  useEffect(()=>{
    socket.on('user:joined', handleUserJoined)
    socket.on('incoming:call', handleCalllUser)
    
    return()=>{
      socket.off('user:joined', handleUserJoined)
      socket.off('incoming:call', handleCalllUser)
    }
  },[socket,handleUserJoined])
  return (
    <div>
        <h1>Room</h1>
        <h4>{remoteSocketId ? 'Connected':'No one in the room'}</h4>
        {remoteSocketId && <button onClick={handleCalllUser}>Call</button>}
    </div>
  )
}

export default Room