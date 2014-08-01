---
layout: post
published: true
title: Debugging Windows 8 Wake Issues
excerpt: Windows 8 seemed to have an inability to stay asleep on my machine.  What
  was going on?  Here are a couple tools that helped me debug the problem.
---

**CULPRIT:** Samsung Magician with Samsung 840 Pro (128 GB) SSD

Just before the promotional pricing for Windows 8 upgrades expired, I decided it was time to update my desktop machine
to Windows 8. I was not expecting any problems -- the machine was built in the Windows 7era, and I had managed to find -
and save! -- the drivers for the few older components that did not have Windows 7 native drivers. However, once the
machine was up and running I started noticing a few oddities with Win8's wake behaviour -- in particular, an inability to
stay asleep.

As I was searching the Internet for solutions, I came across a number of tools built in to Windows that made identifying
the culprit easy.


## Who woke me up?

Windows helpfully logs all wakeup events to the event log, which can be accessed via the Event Viewer. Windows 8 sorts
this under 'Settings' rather than 'Applications', so you won't find it directly from the start screen. Searching for
'Event Viewer' and clicking the settings filter will find the 'View Event Logs' task, but I found it faster to use the
power user menu (`Win-X`) and selected 'Event Viewer' directly.

In the Event Viewer, open the 'Windows Logs' collection and select 'System'. From there, look for events from the
'Power-Troubleshooter' source:

![Event Viewer: Power-Troubleshooter event]({{ site.baseurl }}/assets/posts/2013-02-10/eventviewer.png)

In the general event details for the Power-Troubleshooter events, you will find a description of what caused the system
to wake up. Here, we see 'Timer -- Samsung Magician.exe' -- the Samsung Magician SSD tool. Here, the system slept for less
than a minute before being woken by Samsung Magician, explaining why I observed the system not staying asleep.

## Digging deeper

There is a bit more information available from the command line tool `powercfg` than is given in the event logs. Open an
administrative command prompt (`Win-X` again, and then select 'Command Prompt (Admin)'), and type:

{% highlight bat %}
    powercfg /lastwake
{% endhighlight %}

to see the source of the last wake, without having to search through event viewer.

![PowerCfg: Last Wake]({{ site.baseurl }}/assets/posts/2013-02-10/lastwake.png)

In addition, you can type:

{% highlight bat %}
    powercfg /waketimers
{% endhighlight %}

to see a list of all timers that will wake the system from sleep. This list should normally be empty -- or have a single
entry if Windows Update has downloaded updates and is waiting to apply them overnight. In this case, it's not Windows -
but Samsung Magician has registered **5 timers** to wake the system from sleep. Yikes!

![PowerCfg: Wake Timers]({{ site.baseurl }}/assets/posts/2013-02-10/waketimers.png)

## Preventing Samsung Magician from waking the computer

There is probably a way to prevent a program from registering a wake timer, but I was more concerned that Samsung
Magician was running in the background at all -- the hard drive will operate just fine without it. I can close it once by
right-clicking its system tray icon, but as it starts on boot, I'd have to do this every time the computer was
restarted.

One of the new features in Windows 8 is a handy startup manager that allows you to disable applications from starting
with the computer. It resides in the Task Manager, so we pull that up (`Win-X` or right-click the taskbar) and select
the 'Startup' tab. Then, locate 'Samsung Magician Application', click 'Disable', and we are done!

![Task Manager: Startup Tab]({{ site.baseurl }}/assets/posts/2013-02-10/taskmanager.png)

## Debugging wake issues: surprisingly easy

There you have it -- a couple quick ways of debugging wake issues on Windows 8. `powercfg` with the `lastwake` and
`waketimers` options is also available on Windows 7 and Windows Vista, so you can use it to debug wake issues on those
operating systems as well. Full documentation -- along with a couple other handy flags -- is [available on Microsoft's
site](http://technet.microsoft.com/en-us/library/hh875530%28WS.10%29.aspx)
