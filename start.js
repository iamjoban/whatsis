//Joban
var express =require('express');
var base64 = require('base-64');
var utf8 = require('utf8');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
//var SocketIOFile = require('socket.io-file');
var SocketIOFile = require('./node/fileuploader');
var mailsender = require('./node/mailsender');
var url = require("url");
app.use(express.static(__dirname+'/dist'));
//app.use(express.static(__dirname+'/public'));


app.get("*", function(req, res){
    if(req.originalUrl.indexOf('/data/')>-1){
		console.log('if')
		var file = fs.createReadStream('.'+req.originalUrl);
		var stat = fs.statSync('.'+req.originalUrl);
		res.setHeader('Content-Length', stat.size);
		//res.setHeader('Content-Type', 'application/pdf');
		//res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
		file.pipe(res);
	}else{
		res.sendfile('./dist/index.html');
		//res.sendfile('./public/index.html');
	}
})

var setup = {
  rooms: ['General'],
  usersockets: {},
  defaultMessage:{},
  groups: {}
}

io.on('connection', function(socket){
	socket.on('newuser', function(data){
	   console.log('newuser');
	   data = JSON.parse(base64.decode(data));
	   var room = setup.rooms[setup.rooms.indexOf('General')];
	   data['room'] = room;
	   socket['uderData'] = data;
	   setup.usersockets[data.email] = socket;
	   socket.join(room);
	   data['flag'] = 1;
	   data['action'] = 'joined';
	   console.log(data);
	   mailsender.sendMail(data.email, 'Welcome to Anonymous Chat', 'Hi '+data.name, '<b>Hi</b><br><b>Greetings of the day</b><br><br>I am Joban. As developer of Anonymous Chat, I would like to personally welcome you.<br><br>Regards<br>Anonymous Chat');
	   io.in(room).emit('onmessage', base64.encode(JSON.stringify(data)));
	})
	
	socket.on('creategroup', function(data){
	   console.log('creategroup');
	   data = JSON.parse(base64.decode(data));
	   setup.groups[data.groupdId] = data;
	   var currentGroup = setup.groups[data.groupdId];
	    var data = {
	       flag:6, 
		   msg:setup.groups[data.groupdId].msgSendToParticipant || 'Default message',
		   name:currentGroup.name,
		   groupId:currentGroup.groupdId,
		   active:false,
		   newmsgWhileInactive:false,
		   type:currentGroup.type,
		   owner:data.owner
		 }
	   for(var i=0;i<currentGroup.participant.length;i++){
	     if(socket.uderData.email!==currentGroup.participant[i]){
	      try{
		    if(setup.usersockets[currentGroup.participant[i]]){
			  setup.usersockets[currentGroup.participant[i]].emit('onmessage',base64.encode(JSON.stringify(data)));
			}
		  }catch(e){
		  }
		}
	   }
	})
	
	socket.on('onconversation', function(data){
	   console.log('onconversation');
	   console.log(data);
	   data = JSON.parse(base64.decode(data));
	   //getting online users
	   if(data.flag==2){
	      var onlineUsers = {};
	      for(user in setup.usersockets){
			  var dummyuser = setup.usersockets[user].uderData;
			  if(data.room==dummyuser.room){
			     onlineUsers[dummyuser.email]={name:dummyuser.name, email:dummyuser.email, active:false, newmsgWhileInactive:false};
			  }
		  }
		  
		  io.in(data.room).emit('onmessage', base64.encode(JSON.stringify({flag:2, onlineusers:onlineUsers})));
	   }
	   
	   //one to one chat
	   if(data.flag==4){
	     if(data.receiver){
	       console.log('sender :: '+socket.uderData.email);
		   console.log('data.receiver :: '+data.receiver.email);
		   data.message['sender'] = {name:socket.uderData.name, email:socket.uderData.email};
		   
		 if(setup.groups[data.receiver.email]){
		    console.log('group chat');
			data['type']='group';
		    data['sender'] = {name: data.receiver.name, email:data.receiver.email};
			var currentGroup = setup.groups[data.receiver.email];
			console.log('currentGroup : '+currentGroup.groupdId);
			for(var i=0;i<currentGroup.participant.length;i++){
			  if(socket.uderData.email!==currentGroup.participant[i]){
			    console.log('receiver :: '+currentGroup.participant[i]);
				try{
				   if(setup.usersockets[currentGroup.participant[i]]){
				     setup.usersockets[currentGroup.participant[i]].emit('onmessage',base64.encode(JSON.stringify(data)));
				   }
				}catch(e){
				}
			    
			  }
	        }
		 }else{
		   console.log('one to one');
		   console.log('receiver :: '+data.receiver.email);
		   data['sender'] = {name: socket.uderData.name, email:socket.uderData.email};
	       setup.usersockets[data.receiver.email].emit('onmessage',base64.encode(JSON.stringify(data)));
		 }
		}
	   }
	   //Del
	   if(data.flag==5){
	   console.log('<<<<<<<<>>>>>>>')
	     console.log(data.msg);
		 var msgAry= data.msg;
		 var emailMsg='';
		 if(msgAry && msgAry.length>0){
		 for(var i=0;i<msgAry.length;i++){
		   emailMsg+=msgAry[i].sender.name +' -> '+msgAry[i].msg+' : '+msgAry[i].time+'<br>';
		 }
		   mailsender.sendMail(data.email, 'Your chat backup', 'Hi '+data.name, '<b>Hi</b><br>Your chat with '+data.currentUserName+' is following<br><br>'+emailMsg+'<br>Regards<br>Anonymous Chat');
		   mailsender.sendMail(data.currentUserEmail, 'Your chat backup', 'Hi '+data.currentUserName, '<b>Hi</b><br>Your chat with '+data.name+' is following<br><br>'+emailMsg+'<br>Regards<br>Anonymous Chat');
		 
	     }
	   console.log('<<<<<<<<>>>>>>>')
	   }
	})
	
	socket.on('disconnect', function(){ 
	  console.log('disconnect ');
	 if(socket.uderData){
	  console.log('disconnect :: '+socket.uderData.email);
	  delete setup.usersockets[socket.uderData.email];
	  var data = {
	       flag:3, 
		   userDisconnected: {
		        name : socket.uderData.name,
				email : socket.uderData.email
		   }
		 }
	  io.in(socket.uderData.room).emit('onmessage', base64.encode(JSON.stringify(data)));
	 }
	 
   })
  
   fileUploader(socket);
})
function fileUploader(socket){
	console.log('Connected');
	var uploader = new SocketIOFile(socket, {
        // uploadDir: {			// multiple directories 
        // 	music: 'data/music', 
        // 	document: 'data/document' 
        // }, 
        uploadDir: 'data',							// simple directory 
        accepts: ['audio/mpeg', 'audio/mp3', 'text/html', 'image/png'],		// chrome and some of browsers checking mp3 as 'audio/mp3', not 'audio/mpeg' 
        //maxFileSize: 4194304, 						// 4 MB. default is undefined(no limit) 
        chunkSize: 10240,							// default is 10240(1KB) 
        transmissionDelay: 0,						// delay of each transmission, higher value saves more cpu resources, lower upload speed. default is 0(no delay) 
        overwrite: true 							// overwrite file if exists, default is true. 
    });
	  
	
    uploader.on('start', (fileInfo, x) => {
        //console.log('Start uploading', x);
        console.log(fileInfo);
    });
    uploader.on('stream', (fileInfo) => {
		//console.log(fileInfo);
      //  console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
	  var data = {
	       flag:7, 
		   attachment: {
		        name : fileInfo.name,
				progress : Math.ceil((fileInfo.wrote/fileInfo.size)*100),
				filePlaceHolderIndex:fileInfo.filePlaceHolderIndex,
				receiverEmail:socket.uderData.email
		   }
		 }
	  setup.usersockets[fileInfo.receiverEmail].emit('onmessage',base64.encode(JSON.stringify(data)));
    });

    uploader.on('complete', (fileInfo) => {
        console.log('Upload Complete.');
      //  console.log(fileInfo);
    });
    uploader.on('error', (err) => {
        console.log('Error!', err);
    });
    uploader.on('abort', (fileInfo) => {
        console.log('Aborted: ', fileInfo);
    });
}
var port = process.env.PORT || 8090;
server.listen(port)
