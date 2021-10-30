const express = require("express");
const path = require("path");
var app = express();
var server = app.listen(3000,function(){
    console.log("Listening on port 3000")
});

const io = require("socket.io")(server,{
    allowEIO3:true
});
app.use(express.static(path.join(__dirname,"")));

var userConnections = [];

io.on("connection",(socket)=>{
    console.log("Socket id is ",socket.id);
    socket.on("userconnect",(data)=>{
        console.log("userconnect",data.displayName,data.meetingid);

        var other_users = userConnections.filter((p)=> p.meeting_id == data.meetingid)

        userConnections.push({
            connectionId : socket.id,
            user_id : data.displayName,
            meeting_id : data.meetingid
        });

        other_users.forEach((v)=>{
            socket.to(v.connectionId).emit("inform_others_about_me",{
                other_user_id : data.displayName,
                connId : socket.id 
            })
        })

        socket.emit("inform_me_about_other_users",other_users);
    });

    socket.on("SDPProcess",(data)=>{
        socket.to(data.to_connId).emit("SDPProcess",{
            message : data.message,
            from_connId : socket.id
        });
    })
})