---
layout: post
title: Why Fiddler's Process Picker tool doesn't work with Chrome anymore
tags: [Fundamentals, Chrome, Fiddler, Architecture]

---

Almost every web developer uses or has used [Fiddler](https://www.telerik.com/fiddler) for inspecting network traffic. It's a common scenario where multiple applications/browsers are running on a developer’s machine and he/she wants to monitor the network traffic only for a specific application. Fiddler provides a couple of ways to do this. One of the ways is to use the ‘***Any Process***’ picker present in the main toolbar.  
  
![Process Picker in Fiddler](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/fidchr-any-process-picker.png)
  
  By clicking and dragging the '*Any Process*' picker on the application of your choice you can tell Fiddler to capture network requests originating from that particular application only. But a few months ago I observed that this picker is unable to filter the network requests of **Chrome** web browser. Last week one of my colleagues faced the same thing. In this article, I would try to explain the reason behind this.    

Chrome, or any other major browser, runs multiple processes while executing. Every process handles a dedicated task. In Chrome, the main process is called **Browser** process. This is the first process that gets created when you launch Chrome. It hosts Chrome's UI like address bar, bookmarks, refresh, forward and back buttons. But it doesn't handle any website's UI. Website's UI is handled by a separate process called the **Renderer** process. Another important task of the Browser process is to coordinate with other processes like **Renderer** process, **GPU** process, **Plugin** process, **Utility** process and several others. In fact, in the recent versions of Chrome, each tab is handled by a separate process whenever possible (depends on available memory). This [multi-process architecture](https://www.chromium.org/developers/design-documents/multi-process-architecture) ensures better security and optimum performance. To view the processes currently running in your Chrome, click the three dots icon (&vellip;) at the top right corner >> *More Tools* >> *Task Manager*.      

With every release, software applications aim to be more performant, safer and user friendly. Chrome is no different. During the past few years, the Chrome team has been refactoring their code base and features into distinct services. This is being done to improve maintainability and extensibility. One of the outcomes of this is the **Network Service**. This service is responsible for handling all network activities inside Chrome such as HTTP, sockets, web sockets etc. This has improved the stability and security of the Chrome browser as a whole.  
  
    
Here is a screen shot of the *Chrome Task Manager* (Chrome version 84) on my Windows machine:    
  
 ![Chrome Task Manager](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/fidchr-chrome-task-manager.png)
  
In the above image you can see the main *Browser* process, the *GPU* process and the *Utility* processes. Chrome uses the Utility process to run services like Network Service and Audio Service. If you are hungry to know more about the Network Service do read this [official Chromium document](https://chromium.googlesource.com/chromium%20/src/+/master/services/network/#Network-Service). 

With this architecture of Chrome in mind lets go back to Fiddler. Using Fiddler when you point the '*Any Process*' picker tool on Chrome's window/tab, you are pointing to the Chrome's UI which is actually the *Browser* process and not the *Utility* Process which handles the network requests. This is the reason why Fiddler is unable to intercept Chrome's network requests.  
  
Fiddler provides few other ways too using which you can specifically filter only Chrome's requests. But for some reasons, if you really need to use the '*Any Process*' picker tool, there is a way, though not recommended. You have to tell Chrome- "Do not use a separate service for network requests, instead use the main Browser process for handling network requests". And how do you tell this to Chrome? Here are the steps:  

 1. Navigate to `chrome://flags/#network-service-in-process` in your Chrome browser. You would see `Runs network service in-process` and its value would be set to **Default**.  Except Android, for most platforms **Default** means : Network Service will run outside the Browser process.
 2. Change the value from **Default** to **Enabled**. By doing this you are telling Chrome to run the Network Service inside the browser process (_in-process_).
 3. Restart Chrome.

**NOTE:** At the point of writing this I was using version 84 of Chrome.  
 
 As I mentioned earlier, in Fiddler you can specifically filter Chrome's or any other application's requests without using the *Any Process* picker tool too. To do this, in Fiddler right click on any request and select '*Filter Now*' and then '*Show Only Process=xxxxx*'   
 
 ![Filter a process in Fiddler](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/fidchr-filter-req-process.png)
  
Once you do this you will see your filter's description at the bottom part of Fiddler's window something like this: `Hide Process != 14312`. It simply means - hide all the requests not originating from this Process ID. To remove this filter, simple right-click on `Hide Process != 14312`.   
 
You can see in the above screenshot of Fiddler, I have right-clicked on an HTTPS request. This request originated from my Chrome web browser. Notice that its Process ID is 14312. In this article, we discussed how Chrome uses a separate service called the Network Service for handling web requests. Let's go to Chrome's Task Manager and check the process ID of the Network Service. Its should be the same as what we see in Fiddler.    
  
 Yes it is.    
  
![Chrome Task Manager](https://raw.githubusercontent.com/commentedout/commentedout.github.io/master/assets/img/fidchr-fidl-chr-task-mgr.png)

  I hope this clarified things somewhat. Please let me know your thoughts, comments or suggestions.

