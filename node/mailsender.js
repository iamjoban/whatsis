var mailsender = function(){
 var nodemailer = require('nodemailer');
 var ret={};
var senderOptions={
  name:'Anonymous Chat',
  user:'testing25051992@gmail.com',
  pass:'Suicide@1992'
}
var transporter = nodemailer.createTransport({
   service : 'gmail',
   auth:{
     user:senderOptions.user,
	 pass:senderOptions.pass
   }
});
var mailOptions = {
  from:'"'+senderOptions.name+'" <'+senderOptions.user+'>',
  to:'jjjjjpreet@gmail.com',
  subject:'Hello',
  text:'Hello World',
  html:'<b>Hello World</b>'
};
ret.sendMail = function(to, subject, text, html){
  mailOptions.to = to;
  mailOptions.subject = subject;
  mailOptions.text = text;
  mailOptions.html = html;
  transporter.sendMail(mailOptions, function(err,info){
   if(err){
      console.log('Something went wrong while mail sending');
     return;
   }
   console.log(info);
});
}

return ret;
}();
module.exports = mailsender;