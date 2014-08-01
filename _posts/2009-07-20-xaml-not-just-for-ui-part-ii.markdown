---
layout: post
published: true
title: ! 'XAML: Not Just for UI (part II)'
---

Continuing from [part 1]({% post_url 2009-07-12-xaml-not-just-for-ui %}) in the series, this post describes some of the
tricky bits for implementing your own XAML-based test data loading infrastructure.

For those that haven't read part I, the story to this point is that XAML can be used to do some things that are
completely unrelated to user interfaces -- like loading test data -- and that some of the benefits that XAML provides to
WPF it also provides in other scenarios as well. I'd suggest
[heading on over]({% post_url 2009-07-12-xaml-not-just-for-ui %}) and giving it a quick scan if you haven't done so yet.

## The Situation

The sample presented here was derived from my fourth year design project, a WPF-based interface to 'smart' home devices.
The simplified environment presented here contains Locations (rooms in a house), and Devices (things you can manipulate,
like lights and radios). Devices have Attributes, which are individual features of the Device that can be controlled
(e.g. each of a lamp's two light bulbs is mapped to a separate attribute). In the actual project, each Attribute (there
were multiple types) had its own DataTemplate defined, so that when an Attribute was displayed on screen the
accompanying control was displayed so that users could change the value of the attribute (turn the light bulb on or
off).

To test all of this, we needed a way to load many locations and many devices containing many attributes. And we needed
multiple sets -- or 'houses' -- of test data so that we could ensure that everything was working properly, that all of the
types of attributes were displayed, etc. To load all of this data, I put together a test data loader that loads a set of
locations, devices, and attributes from a XAML file.

The rest of this article describes some of the tricks you'll need to know in order to get this working for your
projects.

## The Tricks

#### ContentProperty Attribute

Though not strictly necessary, putting a <a title="ContentPropertyAttribute Class (System.Windows.Markup)"
href="http://msdn.microsoft.com/en-us/library/system.windows.markup.contentpropertyattribute.aspx">ContentProperty</a>
attribute on your classes will allow you -- and the XAML writer -- to be less verbose when writing your test data XAML.

For instance, on our Device class, we have the attribute

{% highlight csharp %}
[ContentProperty("Attributes")]
{% endhighlight %}

So that the corresponding XAML goes from

{% highlight xml %}
<Device Name="Lamp" LocationId="4">
    <Device.Attributes>
        <Attribute Name="Bulb" Power="150W"/>
        <Attribute Name="Bulb" Power="60W" Position="2"/>
    </Device.Attributes>
</Device>
{% endhighlight %}

to

{% highlight xml %}
<Device Name="Lamp" LocationId="4">
    <Attribute Name="Bulb" Power="150W"/>
    <Attribute Name="Bulb" Power="60W" Position="2"/>
</Device>
{% endhighlight %}

Basically, the ContentProperty attribute sets some property of your class as the 'default' one as far as XAML is
concerned; that way, anything you put inside the class' definition in XAML without specifying which property it belongs
to will have it generated into the property specified by this attribute. If I had to hazard a guess, I'd say that the
name 'content property' was used instead of 'default property' since it's the *content* of an XML element you're talking
about, and XAML is based on XML. Alternatively, it might have picked up the name from WPF, where controls like
ContentPresenter, Button, StackPanel, etc. all have properties actually named 'Content' -- and the ContentProperty
attribute is used to set these 'Content' properties as *the* 'Content' property for each of their respective classes.

#### No Generics support before .NET 4

Loading in test data is usually a straightforward affair: create a list to hold the data we're expecting, then load it
into that list. And in C#, the easiest way of declaring such a list is to use generics:

{% highlight csharp %}
List<Device> devices = new List<Device>();
{% endhighlight %}

Unfortunately, XAML prior to .NET 4 does not support generics, so writing the above code won't serialize that property.
It's relatively simply to fix, however: we just have to trick XAML into thinking that our List<Device> class is a real
class by inheriting from the generic class:

{% highlight csharp %}
public class DeviceList : List <Device> { }
{% endhighlight %}

And then we can use the DeviceList class in place of List<Device> in our original code, with the benefits of not having
to re-implement List as well as being a non-generic class so that it can be saved to XAML.

#### The classes involved have to be public

There are a number of limitations as to what sort of classes and properties can be written as XAML (since the XAML
loader needs to be able to create objects for all of the items in a XAML file), one of which is that the properties and
classes that are being written to XAML need to be public. There are a number of other limitations as well (Mike Hillberg
has a <a title="Data See, Data Do: Being written by XamlWriter"
href="http://blogs.msdn.com/mikehillberg/archive/2006/09/16/XamlWriter.aspx">good post on the subject</a>), but this
limitation is likely the only one you'll encounter when you're using XAML for test data loading.

#### Saving an existing data model

Typing out all of your data, even with Intellisense's help, is a thankless task. Luckily, there's a simple way of having
the XAML infrastructure do it for you. Simply copy the data structures of interest into your test loader class'
definition, and then, in one fell swoop, write everything out to a XAML file:

{% highlight csharp %}
using (XmlTextWriter writer = new XmlTextWriter(location, Encoding.UTF8))
{
    XamlWriter.Save(this, writer);
}
{% endhighlight %}

Perhaps an even better way of doing this is to wrap it all up into a Command on your main window, bound to a keyboard
shortcut. Then whenever you encounter an interesting scenario or some buggy behaviour, you can just hit the shortcut (in
the sample, it's Ctrl-D) and have test data for that case generated automatically!

#### DesignerSerializationVisibility Attribute

By default, XamlWriter only writes out values for the public, read-write properties of a class. The reasoning behind
this is straightforward: if the XAML loading infrastructure cannot load the data value back in (which it cannot for
private and read-only properties), then there isn't any point in writing those properties in the first place. There is
an exception for collections: the XAML loader can load values into a collection exposed by a read-only property by using
its Add() method, so these properties can (and probably should be) be read-only. The default behaviour of not writing
these properties out still applies, however, so you'll have to give the XAML writer a hint for it to save these
properties.

That hint is the <a title="DesignerSerializationVisibilityAttribute Class (System.ComponentModel)"
href="http://msdn.microsoft.com/en-us/library/system.componentmodel.designerserializationvisibilityattribute%28VS.80%29.aspx">DesignerSerializationVisibility</a>
attribute, which, when set to 'Content', indicates that the XAML generator should produce XAML for the *contents* of the
object -- precisely what we're looking for. So we tack the following definition on our read-only collections in
TestDataLoader (Locations and Devices):

{% highlight csharp %}
[DesignerSerializationVisibility(DesignerSerializationVisibility.Content)]
{% endhighlight %}

and everything works as we were expecting, with all of our read-only collection properties saved to XAML.

#### Using Intellisense on your test data XAML files

One of the neat things about this approach is that you'll be able to use Intellisense when editing your test data files
in Visual Studio. Just as if you were editing a WPF XAML file, it will prompt with the right elements at the right
spots, auto-complete tags, and list out all of the values for any enumerations you use!

To get this to work, you'll need to add the XAML file to your current project (Visual Studio doesn't provide
Intellisense for files that aren't part of the current project). Then, change the build type for the file from 'Page' to
'None'; otherwise, it will try to compile the test data XAML into your application as code generated classes. And that's
it -- as long as your namespaces are declared correctly in the XAML test files (and they will be if you exported it from
the application in the first place), you should see full Intellisense support!

## The Code

Now that I've discussed the tricks you need to do it on your own, it's time to share some source code so that you can
have a look at an end-to-end example. Grab the source, then try loading some of the
sample data files into the application. Or mock up some data by using the add buttons to add locations and devices, and
then watch what happens as the data model is saved out to XAML. Enjoy!

[XAML test data loader](https://github.com/ndrarmstrong/blog/tree/master/TestDataLoader) [source code]
