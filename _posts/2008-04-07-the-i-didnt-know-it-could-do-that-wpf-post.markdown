---
layout: post
published: true
title: The "I didn't know it could do that" WPF Post
excerpt: A collection of techniques I'd have never guessed about WPF, but that together make it way easier to work
         on WPF projects.
---

<div class="post-img-left top-p hidden-xs">
    <img src="{{ site.baseurl }}/assets/posts/2008-04-07/microsoftflower.jpg"/>
</div>


At the end of my last co-op term, I was in a good position. I was a pro at WPF -- I'd spent 4 solid months working on a
WPF application in the financial sector, and was probably the best WPF developer on the team -- even though the others
on the team had been working at it longer. And with WPF being such a new framework, me having such a great amount of
experience with the framework meant more interviews for me! One thing led to another, and I eventually found myself on
the WPF team at Microsoft. And looking back on it now, boy was I ever wrong.

I've [mentioned before]({% post_url 2008-02-24-the-trouble-with-wpf %}) that WPF makes
it easy to do things once, but that if you don't do it right, scaling things up will kill you in the end. And the more I
learn about WPF, the more I find that's the case -- but I covered all of that already. Rather, I want to want to briefly
sketch out some of the things I've discovered recently that make a big difference in the grand scheme of things, and
that, without actually seeing others do them, I never would have realized WPF could do.

Before I start, I just have to give a big shout out to the guys & gals who wrote all of this stuff in the first place.
Almost daily I find out about new ways of doing things (or ways of using old techniques in a new way), and every time I
do it seems as though someone, somewhere has anticipated some esoteric situation that I happen to find myself in, and a
few lines of code makes the problem go away. It never ceases to amaze me -- and this has been going on ever since I
started fiddling with WPF, so as you can imagine there is a significant number of these scenarios.

## Navigating to an Object

After seeing this one in practice in the <a href="http://windowsclient.net/wpf/starter-kits/sce.aspx">Syndicated Client
Experiences Starter Kit</a>, I've fallen immediately in love with its simplicity. On my first project with WPF, I got
really good at wiring up pages to specific sections of our data model and writing code to switch the page in view and
thereby have a different look at the data -- a very ASP.NET way of doing things. In the SCE kit, however, they've taken
a simpler approach: bind an object -- *any* object -- to a container on the screen, and switch the object around as
necessary. WPF's default templates take care of the styling and updating, making that object as complicated or as simple
as is desired. And there's no passing values back and forth -- this *is* the object, so you can always do anything you
could to the original object. While it doesn't seem to be much of an improvement at face value, it actually makes a huge
difference -- you can, at any point, throw a different object into the UI container, and poof! the correct UI appears.
There's no parsing the object to figure out where to go next, and if you're smart about things, you can throw everything
into a NavigationWindow or Frame and get journalling (back/forward history) for (almost) free as well! Neat!

## Commands

Users switching to WPF from WinForms or ASP.NET will be forgiven for this mistake (I made it too), but if you're still
using event handlers to implement your UI logic, you've got to read this now. While there's a bit more code to write a
command instead of a Click() handler, the benefits far outweigh the extra code. Using commands, you can completely --
yes, *completely* -- divorce the UI styles from the logic behind the UI. It's a pretty neat thing to see when you
radically alter the UI for an application and *everything* still works, as I had the opportunity to do a couple of times
recently. I remember the days when a minor change could cause massive damage because of Click() handlers; and yet, I
don't think I've ever broken a UI due to a bad command. Moreover, using commands has other benefits as well. Want a
keyboard shortcut or tablet gesture for that button? No problem -- just call the *same* command. Want to automatically
disable all keyboard shortcuts, tablet gestures, and UI bound to a command when it can't be executed? A breeze -- write
a one-line CanExecute() handler for the command, WPF does the rest.

## Decorators

My upcoming fourth year design project includes a UI component, and (surprise, surprise) I'm the group member writing
it. I had prepared a mockup of a particular UI screen in Photoshop, and with the combination of effects I had applied to
get the perfect look for the UI containers, redoing the work in XAML for WPF wasn't looking too thrilling -- and was
potentially slow performing as well, or at least it would be until hardware accelerated bitmap effects are available in
WPF (<a href="http://weblogs.asp.net/scottgu/archive/2008/02/19/net-3-5-client-product-roadmap.aspx">which is on the
way</a>). I decided to slice up the Photoshop image and use that instead, but it would have meant a lot of repetitive
code just to add a fancy border. But WPF's got it covered -- a custom Decorator is surprisingly easy to write, and it
also drops the number of UIElements in the visual tree so it's faster, too. Watch for code here in the future!

## CompositionTarget.Rendering

I'm not going to go into much detail here, but if you were ever wondering how some controls create their own physics
engines for animation? The answer is CompositionTarget.Rendering, which is an event called by WPF every time it has the
chance to render a frame. Simply compute how much time has passed since the last frame (so that animations don't slow
down on slow machines), transform your objects as necessary, and call the problem solved. It's faster (performance-wise)
than WPF animations, and can do some pretty spiffy effects. Not useful very often, but it's a pretty neat trick when
you've got an opportunity to use it.

## Custom Panels

I'll admit: custom panels are hard. I had avoided writing them as long as I could, but eventually came across a
situation where I didn't have a choice. But with Dan Crevier's <a
href="http://blogs.msdn.com/dancre/archive/tags/VirtualizingTilePanel/default.aspx">excellent coverage of the topic</a>
(he pulls some IScrollInfo material from <a href="http://blogs.msdn.com/bencon/archive/2006/01/05/509991.aspx">Ben
Constable</a>), it's actually not all that difficult -- long, but not difficult. Not something you'd do regularly, but
every so often, customizing a panel can really give your application that extra bit of polish -- or performance, in the
case of virtualizing panels. And it's pretty trivial once you've got the panel running to add animation and other fancy
effects to really push things over the edge.

## Attached Properties

If there's one thing I don't know how to use yet, it's attached properties. Well, sure, I use them -- I just haven't
figured out how they can save me time or produce a cleaner solution yet. But looking at <a
href="http://dotnet.org.za/rudi/archive/2008/03/27/keeping-track-of-open-windows-in-wpf.aspx">some of the posts</a> on
them... it appears they are pretty exciting! They're next on my list of things to attack, so I encourage you to have a
look too and see how they can help in your projects.

## More to come...

I'm going to end this post here, but there are many, many more neat features that I'll try to write up in more detail in
the future. In the meantime, I encourage you to check out the <a
href="http://windowsclient.net/wpf/starter-kits/sce.aspx">Syndicated Client Experiences Starter Kit</a> to see some of
the neat features they've built into the application that make it really easy to work with. There's object navigation
(as well as a neat solution to journalling in keep-alive mode using weak references), plenty of commands, quite a number
of custom controls, a View-ViewModel-Model architecture (more on that in the future, but needless to say, it's the best
way to write high-performing, maintainable WPF applications), and an interesting multi-template layout. In short, tons
of good stuff. Have a look!
