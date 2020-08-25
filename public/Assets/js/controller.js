var FILE_RECEIVER_EMAIL='';
var FILE_PLACEHOLDER_INDEX='';
var FILE_SANDER_EMAIL='';
app
  .run(['$window', '$document', '$rootScope', 'Notifications', function($window, $document, $rootScope, Notifications){
      
	  $window.onfocus = function(){
	   // console.log('aa gya');
		Notifications.setShowNotiFlag(false);
		var textArea = document.getElementById('texxt');
		if(textArea){
		  document.getElementById('texxt').focus();
		}
     }
	 
	 $window.onblur = function(){
	    Notifications.setShowNotiFlag(true);
	   // console.log('going')
     }
  }])
  .controller('mainCntrl',['$rootScope', '$scope', 'Notifications', function($rootScope, $scope, Notifications){
    //console.log("main cntrl");
	$scope.dynoTitle="App";
	//$rootScope.globalData = {preventExecution: false};
	$scope.globalData= {preventExecution: false};
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState){
	     $scope.globalData.preventExecution = false;
	    // console.log(toState, fromState);
		 if(toState.name=='home' && fromState.name==''){
		    $scope.globalData.preventExecution = true;
		 }
	  })
	 Notifications.setScope($scope);
	 Notifications.setup();
    
    
    $scope.requestPermission = function() {
		Notifications.requestPermission();
    }
    
    $scope.showNotification = function() {
        Notifications.showNotification();
    }
	$scope.requestPermission();
  }])
  
  .controller('loginCntrl',['$scope', '$state', '$socketservice', '$window' , function($scope, $state, $socketservice, $window){
   $scope.$parent.dynoTitle="Login";
    //=console.log("loginCntrl");
    $scope.init= function(){
	  $scope.loginData = {
	    username:null,
		email:null
	  }
	}
	
	$scope.doLogin = function(){
	  //console.log('Login', $scope.loginData);
	  //console.log($filter('date')(new Date(),'y-m');
	  var userdata = {name:$scope.loginData.username, email:$scope.loginData.email, logintime:new Date().getTime()}
	  var data = {userdata:userdata};
	  localStorage.setItem('chatBox',angular.toJson(data));
	  $state.go('home');
	}
	
	$scope.uploadFile = function(){
		console.log('in ctrl');
		var fileEl = document.getElementById('file');
		$socketservice.uploadFile(fileEl);
		//var uploadIds = uploader.upload(fileEl);
	}
	
    $scope.init();	
  }])
  
  .controller('homeCntrl',['$scope', '$state', '$socketservice', '$timeout', '$compile', '$filter', 'Notifications', '$sce', function($scope, $state, $socketservice, $timeout, $compile, $filter, Notifications, $sce){
    if($scope.globalData.preventExecution){
	 // console.log('prevented');
	  localStorage.removeItem('chatBox');
	  $state.go('login');
	  return;
	}
	var supportedFleTypes = [
	  'mpeg', 'mp3', 'html', 'png'
	]
	$scope.$parent.dynoTitle="Home";	
   //console.log("homeCntrl");
   //File uploader
   $scope.uploadFile = function(fileEl){
	//	console.log('in ctrl');
		var fileNameAndExt = $(fileEl).val().substr($(fileEl).val().lastIndexOf('\\')+1);
		var ext =fileNameAndExt.substr(fileNameAndExt.lastIndexOf('.')+1);
		if(supportedFleTypes.indexOf(ext)>-1){
			$socketservice.uploadFile(fileEl);
			$scope.usermessage="file:"+fileNameAndExt;
			//$scope.usermessage='<i class="fa fa-file-pdf-o" aria-hidden="true"></i>';
			//console.log('in ctrl', $scope.usermessage,  $(fileEl).val());
			$scope.sendChatMessage('sendpressed');
			//var uploadIds = uploader.upload(fileEl);
		}else{
			$scope.notification = {
	         username:'',
		     message:'File type not supported.',
		     showHide:true
	       }
		   $timeout(function(){$scope.notification.showHide=false;},3000)		
		}
	}
   var $wysiwyg_value_editor;
    $scope.init= function(){
		//console.log($.emojiarea.colonBasedIcons);
	   $scope.emojiImgPath = $.emojiarea.path||'';
	   $scope.serachUser = {
	     name:'',
		 email:''
	   }
	   $scope.chatBoxOpened = false;
	   $scope.receiver = null;
	   $scope.notification = {
	      username:'',
		  message:'',
		  showHide:false
	   }
	   if(localStorage.getItem('chatBox')!=null){
	     $scope.userdetails = angular.fromJson(localStorage.getItem('chatBox')).userdata;
	     $socketservice.setupforUser(angular.fromJson(localStorage.getItem('chatBox')).userdata);
	     // General name of the room from where you want to get online users
	     // in future rooms can increase
	     $socketservice.getOnlineUsers('General');
	   }else{
	     $state.go('login');
	   }
	   var keycode;
	   $(document).keydown(function(e){
          keycode = e.keyCode || e.charCode;
		  if(keycode==13){
		    e.preventDefault();
		  }
		  //console.log(keycode, 'keyCode');
	 
     });
	 $scope.browseFile=function(){
		// console.log('opeing')
		 $('#file').trigger('click');
	}
	 $scope.to_trusted = function(html_code) {
      return $sce.trustAsHtml(html_code);
	 }
	 $('input[type=file]').change(function(){
		// console.log('ddd')
		 var fileEl = document.getElementById('file');
		 $scope.$apply(function(){
		   $scope.uploadFile(fileEl);	 
		 })
	 })
	   
	$('.emojis-plain').emojiarea({wysiwyg: false});
	var $wysiwyg = $('.emojis-wysiwyg').emojiarea({wysiwyg: true});
	$wysiwyg_value_editor = $('.emoji-wysiwyg-editor');
	$wysiwyg.on('change', function(event) {
		$scope.usermessage = $(this).val();
		if(keycode==13){
		    keycode=undefined;
			$scope.$apply(function(){
			   $scope.sendMessage('sendpressed');
			})
		}
	});
	$wysiwyg.trigger('change');
	  $scope.resetModel();
	}
	
	$scope.sendMessage = function(e){
	   $wysiwyg_value_editor[0].innerHTML="";
	   $scope.sendChatMessage(e);
	}
	
	$scope.$on('onmessage', function(event, data){
	  //console.log('$scope.onmessage');
	 // console.log(data)
	   //new user joined
	  if(data.flag==1){
	    //console.log('new user joined');
		if(data.email != $scope.userdetails.email){
		   $scope.notification = {
	         username:data.name,
		     message:'has joined',
		     showHide:true
	       }
		   $timeout(function(){$scope.notification.showHide=false;},3000)
		 }
		
	  }
	  if(data.flag==2){
	    //console.log('get online user');
		//console.log(data.onlineusers)
		$scope.$apply(function(){
		  if(!$scope.onlineUsers){
		    $scope.onlineUsers = data.onlineusers;
		  }else{
		    for(var keys in data.onlineusers){
			  if(!$scope.onlineUsers.hasOwnProperty(keys)){
			    //console.log(keys+' is new');
			    $scope.onlineUsers[keys] = data.onlineusers[keys];
			  }else{
			    //console.log(keys+' is thr');
			  }
			}
		  }
		  //console.log($scope.onlineUsers);
		})
	  }
	  if(data.flag==3){
	    //console.log('delete user');
		if(data.userDisconnected.emaill != $scope.userdetails.email){
		   $scope.notification = {
	         username:data.userDisconnected.name,
		     message:'has disconnected',
		     showHide:true
	       }
		  
		 }
		
		 //console.log($scope.onlineUsers[data.userDisconnected.email], 'if any');

		if($scope.onlineUsers[data.userDisconnected.email]){
		   if($scope.onlineUsers[data.userDisconnected.email].msg){
		     var currentUser = JSON.parse(localStorage.getItem('chatBox')).userdata;
			 var deleteUserJson ={
				flag:5,
				email:data.userDisconnected.email,
				name:data.userDisconnected.name,
				currentUserEmail:currentUser.email,
				currentUserName:currentUser.name,
				msg : $scope.onlineUsers[data.userDisconnected.email].msg
			 }
			 $socketservice.sendMessages(deleteUserJson);
		   }
		}
	   
		for(var key in $scope.onlineUsers){
		   //console.log($scope.onlineUsers[key].email +"=="+ data.userDisconnected.email)
		  if($scope.onlineUsers[key].email == data.userDisconnected.email){
		    //console.log('removing user:: '+data.userDisconnected.email)
			//console.log($scope.onlineUsers, key);
			$scope.$apply(function(){
		      delete $scope.onlineUsers[key];//$scope.onlineUsers.splice(i,1); 
			})
		  }
		}
		//console.log(data.userDisconnected.email +"----");
		//console.log($scope.receiver.email);
		if($scope.receiver && (data.userDisconnected.email == $scope.receiver.email)){
		  $scope.chatBoxOpened = false;
		}
		 $timeout(function(){$scope.notification.showHide=false;},3000)
	  }
	  
	  if(data.flag==4){
	    //$scope.$parent.dynoTitle="New message";
		//console.log(data);
		//console.log($scope.onlineUsers);
		var userObj = $scope.onlineUsers[data.sender.email];
		//console.log(userObj);
        if(data.type && data.type==="group"){
		   //group chat
           	//userObj['senderInGroup'] = 	data.sender;
			Notifications.showNotification({title:'Message', body:data.message.sender.name+' has sent a new message in '+data.sender.name});
		}else{
		  //one to one
	      Notifications.showNotification({title:'Message', body:data.sender.name+' has sent a new message'});
		}
		//logged in after group creation
        if(!userObj){
		  userObj = {
             active:true,
			 msg:[],
			 email:data.receiver.email,
			 name:data.receiver.name,
			 newmsgWhileInactive:false,
			 type:"group"		  
		  }
		  $scope.onlineUsers[data.sender.email] = userObj;
		}		
			  if(!userObj.msg){
		  $scope.$apply(function(){
		    userObj.msg = [data.message];
		  });
		}else{
		  $scope.$apply(function(){
		    userObj.msg.push(data.message);
		  })
		}
		
		
		if($scope.receiver && $scope.receiver.email == data.sender.email){
		  //console.log('Message from current active user');
		}else{
		  //console.log('Other user meesage');
		  userObj.active = false;
		  userObj.newmsgWhileInactive = true;
		 $scope.$apply(function(){
		    $scope.onlineUsers[data.sender.email] = userObj;
		 })
		  
		  //console.log($scope.onlineUsers);
		}

				
		var objDiv = document.getElementById("chatMessages");
		//console.log(objDiv.scrollHeight);
        objDiv.scrollTop = objDiv.scrollHeight;
	  }
	  //Getting Group invitations
	  if(data.flag==6){
	    //console.log('new group', data);
		$scope.notification = {
	         username:data.owner.name,
		     message:'has added you in a group '+data.name,
		     showHide:true
	    }
		$timeout(function(){$scope.notification.showHide=false;},3000)
		//console.log($scope.onlineUsers);
		var obj = {active:false,email:data.groupId,name:data.name,newmsgWhileInactive:false, type:data.type};
		 $scope.$apply(function(){
		   $scope.onlineUsers[data.groupId] = obj;
		 })
		//console.log($scope.onlineUsers)
	  }
	  //Getting attachment updated
	  if(data.flag==7){
	  //  console.log('attachment', data);
		var fileInfo = data.attachment;
		setTimeout(function(){
		  $socketservice.changeProgressStatusInUI(fileInfo.progress, fileInfo);	
		})
	  }
	  //attachment progress completed (100%). Now update the perticular message in $scope.onlineUsers[receiverEmailId].msg[index] = newmsg
	  if(data.flag==8){
	   // console.log('fileInfo', data.fileInfo);
		var temp = $scope.onlineUsers[data.fileInfo.receiverEmail].msg[data.fileInfo.filePlaceHolderIndex];
		//console.log(temp);
		$scope.onlineUsers[data.fileInfo.receiverEmail].msg[data.fileInfo.filePlaceHolderIndex].msg = data.data;
		//console.log($scope.onlineUsers);
	  }
	});
	
	$scope.startChat = function(event, user){
	  //console.log(angular.element(event));
	  $scope.chatBoxOpened = true;
	  $scope.createGroupFlag = false;
	  //console.log('Starting chat with :: ',user);
	  for(var key in $scope.onlineUsers){   
		$scope.onlineUsers[key].active = false;	  
	  } 
	  user.active = true;
	  user.newmsgWhileInactive = false;
	  if(!user.msg){
	    user['msg'] = [];
	  }
	  $scope.onlineUsers[user.email] = user;
	  $scope.receiver = user;
	  
	}
	
	$scope.sendChatMessage = function(e){
	    var flag = false;
	   if(e && e.keyCode==13){
	    flag = true;
		e.preventDefault();
	  }else if(e==="sendpressed"){
	    flag = true;
	  }
	  //console.log('aa gya ', flag)
	  if(flag){
	
		   //console.log($scope.usermessage ,'$scope.usermessage');
		   var aryOfEmoji = $scope.usermessage.match(/:[a-zA-Z0-9#*+)-_({}[;_]+/gi);
		  // console.log(aryOfEmoji)
		   var nesMsg=$scope.usermessage;
		    var attachment = false;
		   if(aryOfEmoji){
		    //console.log('if');
		   for(var i=0;i<aryOfEmoji.length;i++){
			   for(var j=0;j<$.emojiarea.icons.length;j++){
				   var temp  =aryOfEmoji[i].toLowerCase();
				  // console.log(temp)
				   if($.emojiarea.icons[j].icons.hasOwnProperty(temp)){
					   nesMsg=nesMsg.replace(aryOfEmoji[i],'<img class="emoji-msg-img" src="' + $scope.emojiImgPath +'/'+$.emojiarea.icons[j].icons[temp]+'">');
				   }
			   }
		      //console.log(aryOfEmoji[i], '<img src="' + $scope.emojiImgPath + aryOfEmoji[i] + '.png">');
			//console.log('<img src="' + $scope.emojiImgPath +'/'+aryOfEmoji[i].substr(1,aryOfEmoji[i].length-1)+'.png">')
		      //nesMsg=nesMsg.replace(aryOfEmoji[i],'<img class="emoji-msg-img" src="' + $scope.emojiImgPath +'/'+aryOfEmoji[i].substr(1,aryOfEmoji[i].length-1)+'.png">');
		    }
		   }
		   //colon based emokis
		   /*if(nesMsg.indexOf(':')>-1){
			   nesMsg.spli
		   }*/
			//console.log(nesMsg ,'nesMsg');
			
			if(nesMsg.indexOf('file:')>-1){
				attachment = true;
				var fileName = nesMsg.substr(nesMsg.lastIndexOf(':')+1);
				var extension =  fileName.replace(/^.*\./, '');
				//fileName = fileName.replace('.','-');
				fileName = fileName.replace(/ /g,"___");
				fileName = fileName.replace(/\./g,"-");
				//console.log(fileName, 'fileName >>')
				FILE_RECEIVER_EMAIL = $scope.receiver.email;
				FILE_PLACEHOLDER_INDEX = $scope.onlineUsers[$scope.receiver.email].msg.length;
				attachmentData = {
				   type:extension
				};
				var  progress =  '<div class="c100 p0 small '+fileName+'">'
                      +'<span>0%</span>'
                      +'<div class="slice">'
                      +'   <div class="bar"></div>'
                      +'   <div class="fill"></div>'
                      +'</div>'
                      +'</div>';
			    nesMsg = progress;
					 // console.log(progress)
				//var index = $scope.onlineUsers[$scope.receiver.email].msg.length;
				//<i class="fa fa-file-pdf-o" aria-hidden="true"></i>
				
			}
	  
	  
	    var time = $filter('date')(new Date(),'hh:mm a');
	   var data = {
	     flag:4,
		 receiver:{name:$scope.receiver.name, email:$scope.receiver.email},
		 message:{msg:nesMsg, time:time},
	   }
	   if(attachment){
		  data['attachmentData'] =  attachmentData;
	   }
	   //console.log($scope.receiver," rec");
	   //console.log($scope.onlineUsers[$scope.receiver.email])
	   
	   $scope.onlineUsers[$scope.receiver.email].msg.push({msg:nesMsg, sender:{name:$scope.userdetails.name, email:$scope.userdetails.email}, time:time})

	   $scope.usermessage="";
	   $socketservice.sendMessages(data);
	   var objDiv = document.getElementById("chatMessages");
	   //console.log(objDiv.scrollHeight);
	   setTimeout(function(){objDiv.scrollTop = objDiv.scrollHeight;},0);
        //objDiv.scrollTop = (objDiv.scrollHeight+350);
		
	  }
	}
	
	$scope.openCreateGrooupModel = function(){
	   $scope.createGroupFlag = true;
	}
	$scope.resetModel = function(){
	  $scope.createGroupModel = {
	  name:'',
	  groupId:'',
	  participant:[],
	  participantEmail:[]
	}
	}
	$scope.userDropDownFlag =false;
	$scope.$watch('searchUser',function(newV, old){
	   //console.log('watch');
	   if(newV!==old){
	     if(newV==''){
		   $scope.userDropDownFlag =false;
		 }else{
		   $scope.userDropDownFlag =true;
		 }
	     
	   }
	})
	$scope.$watch('createGroupModel.name', function(newV, old){
	   if(newV!==old){
	      if(newV===undefined){
	       $scope.createGroupModel.groupId = '';
	     }else{
		   
	       $scope.createGroupModel.groupId = newV.replace(/ /g,"_")+'@whatsis.com';
	     }
	   }
	  
	})
	
	$scope.addGroupParticipant = function(participant){
	  $scope.userDropDownFlag =false;
	  $scope.createGroupModel.participant.push(participant);
	  $scope.createGroupModel.participantEmail.push(participant.email);
	}
	$scope.deleteParticipant = function(index){
	  $scope.createGroupModel.participant.splice(index,1);
	  $scope.createGroupModel.participantEmail.splice(index,1);
	}
	
	$scope.createGroup = function(){
	  if($scope.createGroupModel.participant.length>0){
	    $scope.createGroupModel.participant.push($scope.userdetails.email);
		$scope.createGroupModel.participantEmail.push($scope.userdetails.email);
	  var data = {
	    name:$scope.createGroupModel.name,
		groupdId:$scope.createGroupModel.groupId,
		participant:$scope.createGroupModel.participantEmail,
		msgSendToParticipant:'Default message',
		type:'group',
		owner:{name:$scope.userdetails.name, email:$scope.userdetails.email}
	  }
	  var obj = {active:false,email:data.groupdId,name:data.name,newmsgWhileInactive:false, type:data.type};
	  $scope.onlineUsers[data.groupdId] = obj;
	  $socketservice.createGroup(data);
	  $scope.resetModel();
	  }else{
	    //console.log('add some participant');
		 $scope.notification = {
	         username:'',
		     message:'Please add participant to start group',
		     showHide:true
	       }
		$timeout(function(){$scope.notification.showHide=false;},3000)		   
	  }
	  
	}
	
	
    $scope.init();	
  }])
  .filter('myfilter', function(){
    return function(items, deleuseremail){
	//console.log('items', deleuseremail)
	   var filtered = [];
	   var userdetails = null;
	   if(localStorage.getItem('chatBox')!=null){
	      userdetails = angular.fromJson(localStorage.getItem('chatBox')).userdata ||{};
	   }
	   //console.log(userdetails);
	   angular.forEach(items, function(item) { 
        if(item && userdetails && item.email != userdetails.email && !(deleuseremail==='creategroup' && item.type==='group')) {
          filtered.push(item);
        }
      });
	  //console.log('filtered', filtered)
	  return filtered;
	}
  })
  
  .directive('toggleClass', function(){
    return{
	  restrict:'A',
	  link: function(scope, ele, atr, ctrl){
	    ele.bind('click', function(){
		   //console.log(ele.attr("class"))
		   //console.log(ele.parent(), ele.parent().children.length);
		   var  parent= ele.parent()[0];
		   for(var i=0;i<parent.children.length;i++){
		     parent.children[i].setAttribute("class","ng-scope");
		   }
		   if(ele.attr("class") == "ng-scope"){
		      ele.addClass('active');
		   }else{
		     ele.removeClass('active');
		   }
		})
	  }
	}
  })
  
 