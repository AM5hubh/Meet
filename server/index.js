import { Server } from "socket.io";

const io = new Server(8000,{
    cors: true,
})

const emailtoSocketIdMap = new Map()
const socketIdtoEmailMap = new Map()

io.on('connection', (socket) => {
    console.log('socket connected',socket.id);
    socket.on('room:join', (data) => {
        const {email,room} = data;
        emailtoSocketIdMap.set(email,socket.id);
        socketIdtoEmailMap.set(socket.id,email);
        io.to(socket.id).emit("room:join", data)
    });
});