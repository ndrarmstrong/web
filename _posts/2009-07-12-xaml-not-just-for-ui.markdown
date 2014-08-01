---
layout: post
published: true
title: ! 'XAML: Not Just for UI'
excerpt: ! 'XAML is somewhat of a niche language: developers outside of the .NET world
  rarely have heard of it, and those that have heard about it -- .NET developers or
  not -- often treat it as a language used exclusively for UI design.  So it''s mostly
  those of us in the XAML niche -- those that write user interfaces for a living -
  that know its secret: XAML itself has nothing to do with UI.  And it can be rather
  useful in other scenarios if you know to use it.'
---

XAML is somewhat of a niche language: developers outside of the .NET world rarely have heard of it, and those that have
heard about it -- .NET developers or not -- often treat it as a language used exclusively for UI design. So it's mostly
those of us in the XAML niche -- those that write user interfaces for a living -- that know its secret: XAML itself has
nothing to do with UI. And it can be rather useful in other scenarios if you know to use it.

Why? XAML is a declarative, strongly-typed .NET language; its simple definition contains no mention of UI whatsoever.
XAML's key feature is that it makes it easy to declare large numbers of objects rapidly, and allows the composition of
these elements into tree-shaped object graphs. Granted, XAML was built alongside and for WPF -- which itself was built on
the assumption that you could build complex user interfaces by creating a graph of objects -- and so it is a natural fit
for WPF, but there are other scenarios that also need to describe large object graphs, and XAML works just as well in
those cases as it does with WPF.

Today, Workflow Foundation (WF), a part of .NET 3, already uses XAML to serialize its workflows. Why? A quick glance at
Rob Relyea's <a title="The 8 Benefits of XAML for UI and Beyond -- Rob Relyea"
href="http://blogs.windowsclient.net/rob_relyea/archive/2008/11/06/the-8-benefits-of-xaml-for-ui-and-beyond.aspx">article
on the benefits of XAML</a> provides some clues -- XAML describes data in a concise, but human readable way; it is useful
for many different types of data; and it's toolable. I'd add that it's also incredibly easy to work with -- a call to
`XamlWriter.Save()` is all that's necessary to serialize an object graph in many cases, and the reverse is the same with
`XamlReader.Read()`. And it's these very same things that makes it useful for non-UI .NET developers, too.

## A Concrete Example

I worked on a project recently which required testing against a reasonable amount of data. The application would
traditionally create, save, and load this data through a variety of methods, but for testing we wanted to be able to
fill up the application's data model quickly without manually creating test data each time. It was also important to us
to have a couple different sets of test data, so that we could test a variety of different scenarios (many items, few
items, big items, blank items, etc.), and being able to store these tests in source control -- and merge them
intelligently -- was also high on our list.

Their are a couple different approaches that we could have taken:

  * Type out all of the data model objects in C# and conditionally compile them into the application
  * Serialize the data model at some point in time, and then load it back in

Of course, each of those had their own problems:

  * C# is quite verbose for typing out large number of objects, we can't easily grab a snapshot of an existing data
    model, and conditional compilation with multiple test sets could get tricky
  * Serialization doesn't handle nested objects well, is incredibly verbose, and requires an infrastructure to
    serialize and de-serialize everything

Or, I thought, we could use XAML:

  * The data model could be automatically saved at any point in time
  * It's strongly typed and already tooled, so when we edited a file in Visual Studio, Intellisense would list the
    legal values for each parameter
  * Everything has a default value unless manually overridden, making editing the test sets easy
  * Multiple test sets just meant multiple XAML files for us to choose from when loading
  * The loading and storing infrastructure is trivial

## Making it Happen

There are many ways to write a test data loader; the way described here is just one of them. It comes in two parts:

  1. A C# class containing the XAML loader, which describes what data is stored in the XAML file, and
  2. A set of XAML files containing our objects

### The C# Loader

The C# loader class has two purposes; one, describe the structure of the data stored in a XAML file, and two, perform
the actual loading of a XAML file. While the first part isn't strictly necessary -- a XAML file can represent any data
type and doesn't require a new definition -- none of our existing classes fit what we wanted to do. Our data model root
had multiple functions, and was only going to be partly rehydrated with the test data; the rest it would derive from the
loaded data and actions taken by the tester. The test data we wanted to load in our case was a set of devices and set of
locations; so we added fields and properties for these items in our loader class:

{% highlight csharp %}
/// <summary>
/// Class used to load test objects from a XAML file on disk; also, a nominal schema for a XAML test file.
/// </summary>
[Serializable]
public class TestLoader
{
    private DeviceList devices = new DeviceList();
    private LocationList locations = new LocationList();

    public DeviceList Devices { get; }
    public LocationList Locations { get; }
}
{% endhighlight %}

An important thing to note here is that by assigning an empty list to each of the fields, I'm setting the default values
of these items if they don't get set from XAML. In XAML, all properties are "optional"; your data model needs to handle
this condition (there are some things you can do to ensure certain values are set, but it's a discussion for another
time -- note also that the XAML loader can set properties in any order). Also, we've got a public property for each of
the fields we want to load; the XAML loader will need this later.

The final portion of this class is a static method that, when passed a XAML file, loads the file and returns an instance
of itself to the caller (exception handling excluded for brevity):

{% highlight csharp %}
/// <summary>
/// Loads a XAML file from disk and returns an instance of this class.
/// </summary>
/// <param name="location">The location to read the XAML file from.</param>
/// <returns>An instance of the TestLoader class, containing the objects described in the XAML file.</returns>
public static TestLoader Load(string location)
{
    return (TestLoader)XamlReader.Load(new XmlTextReader(location));
}
{% endhighlight %}

And that's it! If we pass the location of a correctly formed XAML document to TestLoader.Load, it will return an
instance of the TestLoader class with TestLoader.Devices and TestLoader.Locations filled from the XAML file. Neat!

### The XAML Test File

The XAML test file is even easier: just type out (or save out) the objects you want in the test set (xmlns definitions
removed for brevity):

{% highlight xml %}
<TestLoader>
    <TestLoader.Devices>
        <Device Name="Lamp" LocationId="4">
            <Attribute Name="Bulb" Power="150W"/>
            <Attribute Name="Bulb" Power="60W" Position="2"/>
        </Device>
        <Device Name="Clock" LocationId="4"/>
    </TestLoader.Devices>
    <TestLoader.Locations>
        <Location Id="4" Name="Den"/>
    </TestLoader.Locations>
</TestLoader>
{% endhighlight %}

And that's it! As you can see, all we're doing is creating an instance of the TestLoader file by describing it
declaratively in XAML. Loading that file will load in two devices into our TestLoader instance's Devices property, one
of which has attributes (even though we didn't explicitly tell it we were saving/loading attributes, the XAML loader
just does it on its own -- since it is statically typed, it knows how to interpret nested types). For values we didn't
specify, the default values will be used. I highly recommend editing the XAML files you create in Visual Studio; the
XAML editor in VS will provide you will Intellisense for the XAML files you create automatically, so you can pick your
enum values from a list, see what object types are expected at various points, etc. -- all of the things you expect from
Intellisense!

## Some Final Notes

I hope you can get a good appreciation of how easy XAML makes it to load data from the discussion above. If you're
interested in doing this in a project of your own, examine
[part II]({% post_url 2009-07-20-xaml-not-just-for-ui-part-ii %}) of this article for some of the
tricky details that you need to know to get this working right, and how to build your XAML files automatically from
existing in-memory objects. And there's also full sample code with part II, so
[head on over]({% post_url 2009-07-20-xaml-not-just-for-ui-part-ii %}) and check it out.

And above all, keep this technique in mind the next time you need to load or save data; using XAML allows you to
structure data, load and store it easily, and allows third parties (like Visual Studio) to support your file format!

**UPDATE (18/07/09):** Thanks to Rob for his help minifying and clarifying my XAML.
