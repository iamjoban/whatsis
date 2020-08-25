app
 .service('Notifications',['$rootScope', function($rootScope){
    var notifications = {};
	var ctrlScope, showNoti;
	var win = window,
        statusClass = {},
        isIE = false,
        isSupported = notify.isSupported,
        messages = {
            notPinned: 'Pin current page in the taskbar in order to receive notifications',
            notSupported: '<strong>Desktop Notifications not supported!</strong> Check supported browsers table and project\'s GitHub page.'
        };
	notifications.setScope = function(scope){
	   ctrlScope = scope;
	}
	
	notifications.setShowNotiFlag = function(flag){
	  showNoti = flag;
	}
	
	notifications.setup = function(){
	  ctrlScope.notification = {
        title: "Notification Title",
        body: "Notification Body",
        icon: "Assets/img/logo.png"
    };
    ctrlScope.permissionLevel = notify.permissionLevel();
    ctrlScope.permissionsGranted = (ctrlScope.permissionLevel === notify.PERMISSION_GRANTED);

    try {
        isIE = (win.external && win.external.msIsSiteMode() !== undefined);
    } catch (e) {}

    statusClass[notify.PERMISSION_DEFAULT] = 'alert';
    statusClass[notify.PERMISSION_GRANTED] = 'alert alert-success';
    statusClass[notify.PERMISSION_DENIED] = 'alert alert-error';

    messages[notify.PERMISSION_DEFAULT] = '<strong>Warning!</strong> Click to allow displaying desktop notifications.';
    messages[notify.PERMISSION_GRANTED] = '<strong>Success!</strong>';
    messages[notify.PERMISSION_DENIED] = '<strong>Denied!</strong>';

    ctrlScope.status = isSupported ? statusClass[ctrlScope.permissionLevel] : statusClass[notify.PERMISSION_DENIED];
    ctrlScope.message = isSupported ? (isIE ? messages.notPinned : messages[ctrlScope.permissionLevel]) : messages.notSupported;

	}
	
	notifications.requestPermission = function(){
        if (ctrlScope.permissionLevel === notify.PERMISSION_DEFAULT) {
            notify.requestPermission(function() {
                ctrlScope.$apply(ctrlScope.permissionLevel = notify.permissionLevel());
                ctrlScope.$apply(ctrlScope.permissionsGranted = (ctrlScope.permissionLevel === notify.PERMISSION_GRANTED));
                ctrlScope.$apply(ctrlScope.status = isSupported ? statusClass[ctrlScope.permissionLevel] : statusClass[notify.PERMISSION_DENIED]);
                ctrlScope.$apply(ctrlScope.message = isSupported ? (isIE ? messages.notPinned : messages[ctrlScope.permissionLevel]) : messages.notSupported);
            });
        }
	}
	
	 notifications.showNotification = function(obj) {
	   if(showNoti){
	    ctrlScope.notification.title = obj.title;
		ctrlScope.notification.body = obj.body;
        notify.createNotification(ctrlScope.notification.title, {
            body: ctrlScope.notification.body,
            icon: ctrlScope.notification.icon
          });
		}
    }
	
	return notifications;
}])