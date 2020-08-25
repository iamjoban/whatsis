app
 .service('$socketservice',['$rootScope', '$timeout', function($rootScope, $timeout){
    var $socketservice = {};
	$socketservice.fileStatus = {}
	//prod
	var loc = document.location.protocol+'//'+document.location.hostname+":"+document.location.port+'/';
	//dev
	//var loc = document.location.protocol+'//'+document.location.hostname+':8090/';
	$socketservice.userSocket=io(loc);
	$socketservice.uploader = new SocketIOFileClient($socketservice.userSocket);
	
	//setup your socket service
	$socketservice.setupforUser = function(data){
	  //console.log('emit');
	  $socketservice.userSocket.emit('newuser', btoa(angular.toJson(data)));
	}
	
	$socketservice.createGroup = function(data){
	  //console.log('emit');
	  //console.log('createGroup', data);
	  $socketservice.userSocket.emit('creategroup', btoa(angular.toJson(data)));
	}
	
	$socketservice.getOnlineUsers = function(room){
	  var data = {flag:2, action:'getonlineuser', room:room};
	  $socketservice.sendMessages(data);
	}
	
	//common conversation
	$socketservice.sendMessages = function(data){
	  $socketservice.userSocket.emit('onconversation', btoa(angular.toJson(data)));
	}

	$socketservice.userSocket.on('onmessage', function(data){
		try{
		  $rootScope.$broadcast('onmessage', angular.fromJson(atob(data)));
		}catch(e){
		 // console.log('handled');
		}
		
	});
	
	$socketservice.uploader.on('start', function(fileInfo) {
		//console.log('Start uploading', fileInfo);
		//document.getElementById('status').innerHTML="Uploading";
	});
	$socketservice.uploader.on('stream', function(fileInfo) {
		//document.getElementById('status').innerHTML="Uploading...";
		var progress = Math.ceil((fileInfo.sent/fileInfo.size)*100);
		//console.log('Streaming...', fileInfo);
		$socketservice.fileStatus[fileInfo.name]= progress;
		$socketservice.changeProgressStatusInUI(progress, fileInfo);
		//document.getElementById('progress').style.width = Math.ceil((fileInfo.sent/fileInfo.size)*100)+'%';
	});
	$socketservice.uploader.on('complete', function(fileInfo) {
	    //document.getElementById('status').innerHTML="Completed";
		//console.log('Upload Complete', fileInfo);
		$socketservice.changeProgressStatusInUI(100, fileInfo);
	});
	$socketservice.uploader.on('error', function(err) {
	    //document.getElementById('status').innerHTML="Something went wrong";
		//console.log('Error!', err);
		$socketservice.fileUploadingError(err.name)
	});
	$socketservice.uploader.on('abort', function(fileInfo) {
	    //document.getElementById('status').innerHTML="Aborted";
		//console.log('Aborted: ', fileInfo);
	});
	
    $socketservice.uploadFile = function(fileEl){
		//console.log('in service');
		$socketservice.uploader.upload(fileEl, 'xxxxx');
	}
	
	$socketservice.changeProgressStatusInUI= function(progress, fileInfo){
		//console.log(progress)
		var name = fileInfo.name;
		name = name.replace(/ /g,"___");
		  name = name.replace(/\./g,"-");

	//	console.log(name, 'name', $('.'+name))
		if($('.'+name).length){
		var classes = $('.'+name).attr("class").split(' ');
		$.each(classes, function(i, c) {
			if (c.indexOf("p") == 0) {
				$('.'+name).removeClass(c);
			}
		});
		$('.'+name).addClass('p'+progress);
		$('.'+name+' span').html(progress+'%');
	}
		if(progress==100){
			var parentDiv = $('.'+name).parent().eq(0);
			//if(parentDiv.length){
		//	 console.log($(parentDiv).parent().eq(0))
			// console.log($(parentDiv).parent().eq(0).index())
			//console.log($(parentDiv).parent().eq(0))
			// console.log($('ul.messages li').index($(parentDiv).parent().eq(0)))
			var icon = getIconName(name);
			var nameTem = name;
			name = name.replace(/___/g," ");
		      name = name.replace(/-/g,".");
			var html = '<a href="'+loc+'data/'+name+'" download><i class="fa fa-cloud-download download" aria-hidden="true"></i><i class="fa '+icon+' image" aria-hidden="true" style="font-size:20px;color:#fff;"></i></a>';
			$(parentDiv).html(html);
			$('.'+nameTem).remove();
			
			
		//}
		var data = {
				flag:8,
				fileInfo:fileInfo,
				data:html
			}
		$rootScope.$broadcast('onmessage', data);
	}
	//	console.log($('.'+name))
	}
	$socketservice.fileUploadingError = function(name){
		//console.log('sdasdasd asdsa dasd')
		  name = name.replace(/ /g,"___");
		  name = name.replace(/\./g,"-");
		console.log(name)
		  var parentDiv = $('.'+name).parent().eq(0);
		  $('.'+name).remove();
		  var icon = getIconName(name);
		  $(parentDiv).html('<a><i class="fa fa-exclamation-triangle del" aria-hidden="true"></i><i class="fa '+icon+' image" aria-hidden="true" style="font-size:20px;color:#fff;"></i></a>');
		  console.log($(parentDiv).parent().eq(1))
	}
	function getIconName(name){
		//console.log(name, '//////////////////')
		var ext = name.substr(name.lastIndexOf('-')+1);
		switch(ext){
			case 'pdf':
			  return 'fa-file-pdf-o'
			break;
			case 'html':
			  return 'fa-html5'
			break;
			case 'png':
			  return 'fa-file-image-o'
			break;
			case 'txt':
			  return 'fa-file-text'
			break;
		}
	}
	
	
	
    return $socketservice;
 }])