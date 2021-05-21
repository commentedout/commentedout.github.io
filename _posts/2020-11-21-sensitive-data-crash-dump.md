---
layout: post 
title: Sensitive data showing up in Crash Dump 
subtitle: 'How to prevent memory leak and secure your application' 
tags: 'Application Security, OWASP'

---

Before a software is released commercially it undergoes several security scans and tests usually by the Application Security Team or as a part of the DevSecOps process. One such step in this process is the *Crash Dump Analysis* also called *Memory Dump Analysis*. To perform this analysis we first record the state of the application when a crash occurs and then analyze that state at a later point in time to ascertain the cause of the crash. You can read more about this [here](https://www.concurrency.com/blog/march-2018/crash-dump-analysis).

  

Occasionally I come across people telling me that sensitive data like passwords are showing up in the memory dump of their applications. In this post, I would like to describe this security vulnerability in detail and how we can try to mitigate it.

  

Let us assume, you get this vulnerability in the security assessment report of your application. The kind of attack the security team (or tool) has performed on your application is called Memory Dump Attack or Memory Sniffing or Memory Leak. By definition: A memory leak is an unintentional form of memory consumption whereby the developer fails to free an allocated block of memory when no longer needed. Source: [OWASP - Memory Leak](https://owasp.org/www-community/vulnerabilities/Memory_leak)

  

Let me try to explain how this attack happens and how we can try to prevent minimize the risk.

While an application is running on a machine it uses the machine's memory (RAM /page files) to store its variables for calculations. The variable could be the user credentials or any dataset used in your application. If you forcefully power off your machine at this instant either manually (cold boot) or programmatically, these variables continue to remain in the memory of your machine. You can plug out the RAM/hard disk and using special programs you can read the content of the memory at this state. This usually requires physical access to the machine. If you want to carry out this remotely then you will have to be an administrator on that machine to take the memory dump. But if you are an administrator, why would you take all this pain when you can perform various other simple attacks :)

  

Let us see how we can try to minimize the risk-

1.  Prevent unauthorized physical access to the machine.
2.  Give only the required minimum privilege to users/applications on your machines. Make sure your OS and applications are patched regularly to prevent [privilege escalation](https://en.wikipedia.org/wiki/Privilege_escalation) attacks.
3.  Couple of secure coding practices that developers should adopt -

	3.1 Use character arrays for storing passwords in memory, as they reside on the stack and can be overwritten immediately once you use them.

	3.2 Limit the scope of variables holding sensitive data in your code as much as possible. Remember it’s not only the password that should be safeguarded. Any dataset holding sensitive data must be protected. However, it is not possible to store all your sensitive data on stack variables like char[]. You mostly have to use objects which you cannot forcefully wipe out immediately (ref Java, C#).

4. Use disk encryption tools like Bitlocker to encrypt your drives. Content from RAM is transferred to page files on discs by the OS.

  

Let me tell you here that even if you implement the suggestion given in point # 3.1 you will be just _reducing the time window for an attacker_ to read the data from your memory. A ‘determined’ attacker can cause your application to crash and collect the dump at any stage of application execution. I will not go into detail about how it is done. But keep in mind that even before you overwrite the password char array, the attacker can cause your application to forcefully crash and extract the dump. But to do all these, the attacker will need admin access on your machine. And as discussed earlier, if he has admin access, the memory dump attack will not be on his TODO list.

  

To Summarize,

-   Ask your customers to prevent unauthorized physical access to the machines where your applications are running.
-   Patch the OS and your application regularly to prevent privilege escalation attacks. The system that is safe today, may not be safe tomorrow.
-   Follow secure coding practices (point# 3.1, 3.2) as much as possible.

