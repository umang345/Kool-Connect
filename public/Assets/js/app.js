var AppProcess = (function(){

    var peers_connection_ids = [];
    var peers_connection = [];
    var serverProcess;
    function _init(SDP_function,my_connId)
    {
         serverProcess = SDP_function;
         my_connection_id = my_connId;
    }

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

        connection.onnegotiationneeded = async function(event){
            await setOffer(connId);
        }

        connection.onicecandidate = function(event){
            if(event.candidate)
            {
                 serverProcess(JSON.stringify({icecandidate : event.candidate}),connId);
            }
        }

        connection.ontrack - function(event){

        }

        peers_connection_ids[connId] = connId;
        peers_connection[connId] = connection;
    }

    function setOffer(connId)
    {
         var connection = peers_connection[connId];
         var offer = await connection.createOffer();
         await connection.setLocalDescription(offer);
         serverProcess(JSON.stringify({
             offer : connection.localDescription
         }),connId);
    }

    return {
        setNewConnection : async function(connId){
            await setConnection(connId);
        },
        init: async function(SDP_function,my_connId)
        {
             await _init(SDP_function,my_connId );
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


         var SDP_function = function(data,to_connId)
         {
              socket.emit("SDPProcess",{
                    message: data,
                    to_connId : to_connId
              });
         }
         socket.on("connect",()=>{
             if(socket.connected)
             {
                  AppProcess.init(SDP_function,socket.id);
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