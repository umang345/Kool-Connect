var AppProcess = (function(){

    var iceConfiguration = {
        iceServers : [
            {
                urls: "stun:stun.l.google.com:19302",   
            },
            {
                urls: "stun:stun1.l.google.com:19302",   
            },
        ]
    }

    function setConnection(connId){
        var connection = new RTCPeerConnection(iceConfiguration);
    }

    return {
        setNewConnection : async function(connId){
            await setConnection(connId);
        }
    }
})
var MyApp = (function(){

    var user_id="";
    var meeting_id="";
    function init(uid,mid)
    {
         user_id=uid;
         meeting_id = mid;
         event_process_for_signaling_server();
    }

    var socket = null;
    function event_process_for_signaling_server()
    {
         socket = io.connect();
         socket.on("connect",()=>{
             if(socket.connected)
             {
                  if(user_id!="" && meeting_id!="")
                  {
                       socket.connect("userconnect",{
                            displayName : user_id,
                            meetingid: meeting_id
                       });
                  }
             }
         })

         socket.on("inform_others_about_me",function(data){
             addUser(data.other_user_id,data.connId);
             AppProcess.setNewConnection(data.connId)
         })
    }

    function addUser(other_user_id,connId)
    {
         var newDivId = $("#otherTemplate").clone();
         newDivId = newDivId.attr("id".connId).addClass("other");
         newDivId.find("h2").text(other_user_id);
         newDivId.find("video").text("id","v_"+connId);
         newDivId.find("audio").text("id","a_"+connId);
         newDivId.show();
         $("divUsers").append(newDivId);
    }

    return {
        _init : function(uid,mid){
            init(uid,mid);
        }
    }
})();