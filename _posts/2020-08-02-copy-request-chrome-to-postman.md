---
layout: post 
title: Clone HTTP requests from Browsers in Postman 
tags: 'Development, Tools, Postman, Chrome, Firefox'

---

Quite often during web development, we need to fiddle with the outgoing web requests from our web browsers. E.g. we may want to change the content of POST requests' body or change the value of an HTTP header. If we are using **Chrome**, it is not possible to alter the web request in the Chrome's Developer Tools (at the time of writing this) and so we use tools like [Postman](https://www.postman.com/).  
  
 Although we can manually copy the contents (URI, body, headers, ...) of a request from Chrome's Developers Tool and create a new request in Postman, the process is tedious and error-prone. There is a relatively quick and ideal way to do the same thing.  
   
 To copy/clone an HTTP request from Chrome to Postman you can follow the steps below:

  

- Open Chrome's Developers Tool and right-click on the request you want to clone in Postman. Then click on *'**Copy**'* and then *'**Copy as cURL (bash)**'*.  
  
![Copy request from Chrome](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/chrome-to-postman-01.png)
- Open Postman. Click on *'**Import**'* button or you can use the shortcut (on windows): ***Ctrl + O***. Import panel will open.    
 
- Click on *'**Raw text**'* and paste the copied content. Click *'**Continue**'*. Postman will ask you to confirm your import. Click *'**Import**'*.   

![Importing cURL in Postman](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/chrome-to-postman-02.png)  

  - The web request will be cloned in Postman. Cheers!    
  
  
If you are using **Firefox**, the process is very similar. See the screenshot below.  
   
![Copy request from Firefox](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/chrome-to-postman-03.png)
  
Firefox also provides an option to *'**Edit and Resend**'* the request which can prove to be very useful in case you don't have Postman on your machine. However, Postman provides some enhanced capabilities which you may not get in Firefox.

