---
layout: post
published: true
title: WPF Title Animator
excerpt: The title animator is a simple WPF application for displaying movie-credits style text using WPF animations.
---

<div class="post-img-left top-p hidden-xs">
    <img src="{{ site.baseurl }}/assets/posts/2007-09-27/titleanimator.gif"/>
</div>

Let me just say, for the record, that WPF is awesome. It manages to blend the best web design strategies with the power
and flexibility of desktop (so-called "smart client") applications, and then go above and beyond to provide a visual
framework that can visually stunning, yet flexible enough to meet the demands of data-driven applications. The only
problem is that... well, it's pretty easy to get carried away. I could spend days getting every little detail perfect,
from kerning the fonts and setting a baseline to control templating every control with a non-standard look and
animation.

Over the course of my last work term with Systemgroup, we built a wealth management application using WPF to see what it
was all about. And while I had an absolutely amazing time creating the patterns and practices for such an application in
WPF, there wasn't much time (nor budget) to get carried away, so one weekend I decided to check out WPF animation on my
own. This is the result of that experimentation.

## Title Animator Details

The title animator is a simple WPF application, and can be run standalone on any computer with .NET 3.0 installed (the
executable is in the /bin/debug/ folder of the zip file below). For the developers out there, the full source code (a
Visual Studio 2005 project) is available for you to modify to your heart's content -- the text displayed is generated
from an array of strings established in the window's constructor. Systemgroup and I ended up using the code to build a
neat about screen into our application; simply compile the project as a class library and include in your project,
launching the window to display the full animation. The application can be closed by pressing a key on the keyboard or
clicking the mouse.

[WPF Title Animator source code]({{ site.baseurl }}/assets/posts/2007-09-27/TitleAnimator.zip) [zip]
