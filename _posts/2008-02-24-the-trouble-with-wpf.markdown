---
layout: post
published: true
title: The Trouble with WPF
excerpt: WPF gives you dozens of different ways to do almost everything - but often, one way is strongly preferred.
         I explore documenting the ways that are best for the long run.
---

<div class="post-img-left top-p hidden-xs">
    <img src="{{ site.baseurl }}/assets/posts/2008-02-24/microsoftsign.jpg"/>
</div>

I've been working with WPF quite a lot lately, in no small part because [I'm now on an internship with the WPF team at
Microsoft]({% post_url 2007-10-26-the-interview-stats-are-in %}). This post is not about the work, though -- it's been
great -- but rather, the one glaring flaw that I keep seeing, over and over, with WPF. Before you stop reading, realize
this: WPF is pure awesome, and I'm certainly convinced that it, along with derivative (Silverlight) and related
technologies, is the way user <strike>interfaces</strike> experiences will be designed in the years to come. WPF makes
it incredibly easy to go from nothing to product in a short amount of time -- when you know how to make it work for you,
not the other way around. Therein lies the problem.

The trouble with WPF is, in short, that there are tens of different ways to do almost everything in WPF, but only a few
of them are "right". Most sources of information on WPF -- scratch that, almost all sources -- completely ignore this
fact, and instead present to you the *shortest* snippet of code that they determined works *for their particular
scenario*. And as anyone who programs knows, you're rarely writing a program that exactly matches someone else's
scenario.

Now, that's a pretty hand-wavy point, so I'm going to try and make it a little bit more concrete. Most of the 'getting
started' type books and articles for WPF try to show off how easy it is to do 'useful' things in WPF, like creating a
simple page with a button. Then they show the code for the button:

{% highlight xml %}
<Button>Click Me!</Button>
{% endhighlight %}

And everyone is impressed. Then they go further -- let's add a tool tip and an event handler:

{% highlight xml %}
<Button ToolTip="Please Click Me" Click="ButtonWasClicked">Click Me!</Button>
{% endhighlight %}

And the people said that it was good. But it's not, not quite. Sure, on this small scale, it looks nice and simple, but
you try to build a big application and those click handlers add up quite quickly. Then add in localization for tool tips
and you've got a real mess on your hands. That's not to say that these simple properties aren't useful -- on the
contrary -- but rather, that building real applications sometimes requires a separate approach.

What if, instead of the click handler, we used a command instead:

{% highlight xml %}
<Button Command="local:MyPage.ButtonWasClickedCommand">Click Me!</Button>
{% endhighlight %}

Now we've got something with almost the same functionality, but a few major differences. One, the button knows how to
disable itself, *automatically*, when the command returns false for CanExecute(). Two, anything can execute the command --
be it a button, a keyboard shortcut, a tablet flick, you name it -- and the same handler is called. Three, when you're
writing your own controls, you can keep all of the logic in one place (the control) and know that, if you were to remove
the control, all of the associated cruft -- keyboard shortcuts, etc. -- get removed along with it. But finally, and
here's the kicker: you can easily style this however you want without having to worry that the Click() handler getting
broken. You can change the command type, put the control in a resource, whatever -- it'll find the command and execute
it. Though it may not seem that way, this is a huge deal -- you could radically (and if you've seen WPF, you know that I
really mean radically) alter the look of the UI, the structure of the UI, heck, even remove the UI and still have
everything work. And it doesn't have to be you -- your designer, with their fancy-schmancy design tools can do it to, so
that when you get it back it still works *and* it looks good. With the Click() hander? If you're lucky. And your
designer knows enough code to bind the Enabled property of the button to a dependency property in the page that changes
when the button can be pressed...

This is just one scenario, but there are many, many others. In fact, once you get good at WPF, you realize that
*everything you write* means sorting out these scenarios and choosing the "right" thing. If you've got a good idea of
what's going on, then it's trivial -- setting more than a few properties? Put it in a resource. Using the same style on
more than one item? Put it in a resource. Can this functionality be written in XAML? Do so. Is there something on screen
(another control, for instance) or in the data model that already has the information you need? Use data binding (and a
converter, if needed) to bind it, don't use C#. Writing a data model? Make sure everything implements
INotifyPropertyChanged, and call PropertyChanged religiously. Is there a control that does what you want but doesn't
look that way? ControlTemplate it. Don't remember all of the parts of a ControlTemplate for the control you're working
on? Load it up in Expression Blend, right click, edit template, create a copy. After a while, these things become more
and more automatic -- though you'll still occasionally come across books and blogs with even better ways; the better you
get, the more you'll go looking for these "right" things, as it can save you mountains of time in the long run (and be
easier to figure out when you have to maintain/fix it in two months).

For experienced WPF coders and designers, this is a non-issue, but for those just starting out, it's a huge barrier to
entry. Existing books and resources make it apparent how easy it is to build simple things, but as soon as you start
scaling up you run into spaghetti codebases with numerous issues that become unmaintainable extremely quickly. But it
doesn't have to be that way -- WPF is hugely powerful, and when you're doing things the right way, everything just
works, is easy to maintain, and can be adapted, prototyped, even built in a fraction of the time of a traditional app.
But for developers new to WPF, this information isn't easily available -- and when it is, you have to know enough about
WPF to know how it is relevant to your project. And that's a big problem.

I think what we need for WPF is another book -- but this time, not on programming WPF itself (there are <a
href="http://www.amazon.com/Windows-Presentation-Foundation-Unleashed-WPF/dp/0672328917">plenty</a> <a
href="http://www.amazon.com/Programming-WPF-Chris-Sells/dp/0596510373/ref=sr_1_1?ie=UTF8&s=books&qid=1203883792&sr=1-1">of</a>
<a
href="http://www.amazon.com/Applications-Code-Markup-Presentation-Foundation/dp/0735619573/ref=sr_1_2?ie=UTF8&s=books&qid=1203883821&sr=1-2">those</a>),
but rather, specific 'recipes' for solving a particular scenario. Each recipe could describe the desired ingredients
(size of project, how many times this particular behaviour is required, maintainability, etc.) and then lay out the
approach (with plentiful code examples) one would use to solve the problem. New developers could simply flip through the
book to find something in their problem domain, read the recipe, and then implement, knowing that the approach they've
taken will yield them good results in the long run. Here's a (very rough) sample:

> ### Animating a WPF element
>
> #### Single Animation
>
> Use XAML animations directly in the style of the object you're animating. [code example]
>
> #### Multiple Objects, Same Animation
>
> Declare the animation storyboard as a resource in XAML; bind the animation to the animated object's style.
> [code example]
>
> #### Animate a group of objects in a list
>
> C# animations in a custom panel if you're going to use it a lot, otherwise, a limited set of animations can be done
> in XAML. [code examples]
>
> #### If you're animating OnMouseOver...
>
> Only use the 'To' property of your animation; otherwise, the animation will jerk to the end position if the mouse
> leaves the object before the Enter animation completes. [code example]
>
> #### If you're doing a transition...
>
> You can store the old Visual before animating and then animate your (now new) object back in; this will workregardless
> of the objects in use and can be refactored out into a class that just does > transitions (even random transitions)
> on whatever you wish to apply it to. [code example]


With recipes for all of the many different aspects of WPF -- the "right" way to do data models, navigation, animation,
styling, theming, structuring projects -- everything, we'd be able to provide the crutch that gets a newly enthralled
developer up past the "I can do simple things" stage into the "I think in XAML" stage without all of the journeys into
the wrong way of doing things. Yes, I know this is a long winded article just to present my 'WPF Recipes' concept, but
one that I think is important. There's a whole segment of the market that isn't being catered to, and that will, in all
likelihood, end up with a poorly designed, slow, and unmaintainable WPF application. But as I hope I've shown, it
doesn't have to be that way -- someone just needs to show new developers the way. With all the choice and flexibility
that WPF gives developers, the least we can do is provide a map!
