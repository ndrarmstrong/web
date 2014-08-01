---
layout: post
published: true
title: EXIF Quick Reference
excerpt: Over the past few years, I've used the EXIF data stored by modern digital
  cameras in a couple of programs I've worked on.  Having access to the date the photo
  was taken -- or which way the camera was rotated when it was -- is useful information
  to have.  Even though it's relatively easy to do, finding the right identifier for
  the information you want is much harder than it should be.  This page fills that
  niche -- the most useful/popular EXIF properties in an easy-to-find format.
---

Over the past few years, I've used the EXIF data stored by modern digital cameras in a couple of programs I've worked
on.  Having access to the date the photo was taken -- or which way the camera was rotated when it was -- is useful
information to have. Even though it's relatively easy to do, finding the right identifier for the information you want
is much harder than it should be. This page fills that niche -- the most useful/popular EXIF properties in an
easy-to-find format.

## EXIF in .NET

The .NET framework provides two ways of accessing EXIF data; functions in the
[System.Drawing](http://msdn.microsoft.com/en-us/library/system.drawing.aspx) namespace, and functions in the
[System.Windows.Media.Imaging](http://msdn.microsoft.com/en-us/library/system.windows.media.imaging.aspx) namespace.
There are also a number of libraries available to read EXIF data in .NET -- which are generally easier to use than the
built-in classes -- but I've found that costs associated with loading and deploying an extra library are not worth it for
the simpler programming interface. Most of the time I'm only reading a couple properties, so doing it directly isn't
that difficult.

Given those two namespaces each provide a way of reading EXIF data, which one is better? In my view,
**neither**. Each provides the same functionality, and though the System.Windows.Media.Imaging namespace
does provide properties to allow reading some values directly -- like the camera's manufacturer or the date the photo was
taken -- they are limited enough in practice that you'll end up using the tag values anyway.

So which one should we choose? It's actually quite simple; if you are using **Windows Forms**, use the
**System.Drawing** version, since you've already loaded the appropriate DLL. Likewise, if you are using
**WPF**, use the **System.Windows.Media.Imaging** version. And if your application doesn't
have a UI (or is using an alternate framework), then the choice is up to you -- though I'd suggest using the
**System.Drawing** version. The System.Drawing namespace resides in System.Drawing.dll, which weighs in at
612 KB on my system, while System.Windows.Media.Imaging resides in PresentationCore.dll, which weighs in at 4112 KB
(PresentationCore contains the majority of WPF). The increased size of the latter DLL results in a slightly slower
first-image processing time, as the framework loads the DLL into memory.

### Accessing EXIF data with C#

Using the System.Drawing/Windows Forms version of accessing EXIF data is relatively straight forward: load the image,
request a property by number, and then parse the property bytes into the desired format (string or integer).  Let's have
a look:

{% highlight csharp %}
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;

class EXIF
{
    static void Main()
    {
        // Create an Image object
        using (Image photo = Image.FromFile(filename))
        {
            // Read out the date taken property (string)
            PropertyItem dateProperty = photo.GetPropertyItem(0x9003);
            string dateTaken = (new UTF8Encoding()).GetString(dateProperty.Value);
            // And the ISO (unsigned short integer)
            PropertyItem isoProperty = photo.GetPropertyItem(0x8827);
            ushort iso = BitConverter.ToUInt16(isoProperty.Value, 0);
            // other properties can be read using similar methods...
        }
    }
}
{% endhighlight %}

Like the previous version, accessing the EXIF data with System.Windows.Media.Imaging/WPF is relatively easy and follows
a similar pattern.  However, in this case the BitmapMetadata class exposes some of the EXIF values through properties on
the
[BitmapMetadata](http://msdn.microsoft.com/en-us/library/system.windows.media.imaging.bitmapmetadata_properties.aspx)
object.  The rest must be accessed using the
[GetQuery](http://msdn.microsoft.com/en-us/library/system.windows.media.imaging.bitmapmetadata.getquery.aspx) method,
using the WIC [Metadata Query Language](http://msdn.microsoft.com/en-us/library/ee719796%28VS.85%29.aspx).  This query
language unifies the types of embedded information that can be accessed (EXIF, XMP, IPTC, ID3, etc.) into a
general-purpose syntax.  We're only concerned with the EXIF ones here, which have the form `/app1/ifd/exif:{uint=999}`
or `/app1/ifd/exif/subifd:{uint=99999}`, depending on the tag you're accessing.  In general, tags less than 1000
(decimal) are accessed using the former syntax, those greater using the latter syntax.

{% highlight csharp %}
using System;
using System.IO;
using System.Windows.Media.Imaging;

class EXIF
{
    static void Main()
    {
        // Load and decode the photo
        using (FileStream stream = new FileStream(filename, FileMode.Open))
        {
            JpegBitmapDecoder decoder = new JpegBitmapDecoder(stream,
                                        BitmapCreateOptions.PreservePixelFormat,
                                        BitmapCacheOption.None);
            // Extract the photo's metadata
            BitmapMetadata metadata = (BitmapMetadata)decoder.Frames[0].Metadata;
            // Read out the date taken property...
            // ...  via the built-in property (as a System.DateTime)
            DateTime dateTaken1 = DateTime.Parse(metadata.DateTaken);
            // ... or via a query (as a string)
            string dateTaken2 = (string)metadata.GetQuery("/app1/ifd/exif/subifd:{uint=36867}");
            // And the ISO (unsigned short integer)
            ushort iso = (ushort)metadata.GetQuery("/app1/ifd/exif/subifd:{uint=34855}");
            // other properties can be read using similar methods...
        }
    }
}
{% endhighlight %}

### Accessing EXIF data with Powershell

Since PowerShell has easy access to the .NET framework, grabbing metadata from a photo using PowerShell is just as easy
as doing it in C#, which makes it great for scripting photo tasks. First up is the System.Drawing/Windows Forms
version:

{% highlight powershell %}
# Load the System.Drawing DLL before doing any operations
[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") > $null
# And System.Text if reading any of the string fields
[System.Reflection.Assembly]::LoadWithPartialName("System.Text") > $null
# Create an Image object
$photo = [System.Drawing.Image]::FromFile($filename)
# Read out the date taken property (string)
$dateProperty = $photo.GetPropertyItem(0x9003)
$dateTaken = (new-object System.Text.UTF8Encoding).GetString($dateProperty.Value)
# And the ISO (unsigned short integer)
$isoProperty = $photo.GetPropertyItem(0x8827)
$iso = [System.BitConverter]::ToUInt16($isoProperty.Value, 0)
# other properties can be read using similar methods...
# Dispose of the Image once we're done using it
$photo.Dispose()
{% endhighlight %}

We can also use the System.Windows.Media.Imaging/WPF version from PowerShell. Like the C# version, some values are
exposed through properties on the
[BitmapMetadata](http://msdn.microsoft.com/en-us/library/system.windows.media.imaging.bitmapmetadata_properties.aspx)
object directly; the rest must be accessed using the
[GetQuery](http://msdn.microsoft.com/en-us/library/system.windows.media.imaging.bitmapmetadata.getquery.aspx) method.
Queries take the form `/app1/ifd/exif:{uint=999}` or `/app1/ifd/exif/subifd:{uint=99999}`, depending on the tag you're
accessing. In general, tags less than 1000 (decimal) are accessed using the former syntax, those greater using the
latter syntax.

{% highlight powershell %}
# Load the System.Windows.Media.Imaging DLL before doing any operations
[System.Reflection.Assembly]::LoadWithPartialName("PresentationCore") > $null
# Load and decode the photo
$stream = new-object System.IO.FileStream($filename, [System.IO.FileMode]::Open)
$decoder = new-object System.Windows.Media.Imaging.JpegBitmapDecoder($stream,
           [System.Windows.Media.Imaging.BitmapCreateOptions]::PreservePixelFormat,
           [System.Windows.Media.Imaging.BitmapCacheOption]::None)
# Extract the photo's metadata
$metadata = $decoder.Frames[0].Metadata
# Read out the date taken property...
# ...  via the built-in property (as a System.DateTime)
$dateTaken1 = $metadata.DateTaken
# ... or via a query (as a string)
$dateTaken2 = $metadata.GetQuery("/app1/ifd/exif/subifd:{uint=36867}")
# And the ISO (unsigned short integer)
$iso = $metadata.GetQuery("/app1/ifd/exif/subifd:{uint=34855}")
# other properties can be read using similar methods...
# Dispose of the FileStream once we're done using it
$stream.Dispose()
{% endhighlight %}

## EXIF Tag Reference

The numbers used in the examples above can be found in the table below. This table is not intended to be
comprehensive -- there is *far* too much complexity in the EXIF format for that. Most
manufacturers add their own information in proprietary formats (you can usually decode this, but you need to support
each manufacturer separately -- Canon camera's don't write the Nikon fields), and not all cameras write all fields, and
there are non-EXIF storage formats that are used as well (XMP, IPTC, ID3, and more). If you  are looking
for comprehensive, I'd recommend [this page](http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/EXIF.html) on Phil
Harvey's ExifTool site; otherwise, here's a list of the most common, relatively standard ones.  All integers are 32 bits
in length, except those with the notation 'short'; they are 16 bits in length.  Integer rationals are stored XY, where
the value is equal to X/Y; most are 64 bits in length (two 32 bit integers back-to-back).

<div class="table-responsive">
    <table class="table table-striped table-hover" style="font-size: 80%">
        <thead>
            <tr>
                <th>Decimal Value</th>
                <th>Hex Value</th>
                <th style="min-width:123px;">Data Type</th>
                <th>Tag Name</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>271</td>
                <td>0x010f</td>
                <td>ASCII string</td>
                <td>Equipment Maker</td>
                <td>‘Canon’, ‘Nikon’, etc.</td>
            </tr>
            <tr class="odd">
                <td>272</td>
                <td>0×0110</td>
                <td>ASCII string</td>
                <td>Equipment Model</td>
                <td>‘Canon PowerShot S5 IS’, etc.</td>
            </tr>
            <tr>
                <td>274</td>
                <td>0×0112</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Orientation</td>
                <td>1 = Horizontal<br/>
                    3 = Rotate 180 degrees<br/>
                    6 = Rotate 90 degrees clockwise<br/>
                    8 = Rotate 270 degrees clockwise</td>
            </tr>
            <tr class="odd">
                <td>282</td>
                <td>0x011a</td>
                <td>integer<br/>(unsigned short)</td>
                <td>X Resolution</td>
                <td>Unit in Resolution Unit field (for pixels, see Pixel X Dimension field)</td>
            </tr>
            <tr>
                <td>283</td>
                <td>0x011b</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Y Resolution</td>
                <td>Unit in Resolution Unit field (for pixels, see Pixel Y Dimension field)</td>
            </tr>
            <tr class="odd">
                <td>296</td>
                <td>0×0128</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Resolution Unit</td>
                <td>1 = None<br/>
                    2 = Inches<br/>
                    3 = Centimetres</td>
            </tr>
            <tr>
                <td>306</td>
                <td>0×0132</td>
                <td>ASCII string</td>
                <td>Modified Date Time</td>
                <td>YYYY:MM:DD HH:MM:SS</td>
            </tr>
            <tr class="odd">
                <td>33434</td>
                <td>0x829a</td>
                <td>integer rational<br/>(unsigned)</td>
                <td>Exposure Time</td>
                <td>First integer divided by the second integer produces the exposure time in seconds; for example, a value of ’1′ followed by a value of ’50′ is an exposure time of 1/50th of a second.</td>
            </tr>
            <tr>
                <td>33437</td>
                <td>0x829d</td>
                <td>integer rational<br/>(unsigned)</td>
                <td>F Number</td>
                <td>First integer divided by the second integer produces the F number; for example, a value of ’35′ followed by a value of ’10′ is F/3.5.</td>
            </tr>
            <tr class="odd">
                <td>34855</td>
                <td>0×8827</td>
                <td>integer<br/>(unsigned short)</td>
                <td>ISO Speed</td>
                <td>100, 200, 400, etc.</td>
            </tr>
            <tr>
                <td>36867</td>
                <td>0×9003</td>
                <td>ASCII string</td>
                <td>Date Taken</td>
                <td>YYYY:MM:DD HH:MM:SS</td>
            </tr>
            <tr class="odd">
                <td>36868</td>
                <td>0×9004</td>
                <td>ASCII string</td>
                <td>Date Created</td>
                <td>YYYY:MM:DD HH:MM:SS</td>
            </tr>
            <tr>
                <td>37377</td>
                <td>0×9201</td>
                <td>integer rational (signed)</td>
                <td>Shutter Speed</td>
                <td></td>
            </tr>
            <tr class="odd">
                <td>37378</td>
                <td>0×9202</td>
                <td>integer rational (unsigned)</td>
                <td>Aperture</td>
                <td></td>
            </tr>
            <tr>
                <td>37380</td>
                <td>0×9204</td>
                <td>integer rational (signed)</td>
                <td>Exposure Compensation</td>
                <td>First integer divided by the second integer produces the exposure compensation; for example, a value of ’2′ followed by a value of ’3′ is +2/3</td>
            </tr>
            <tr class="odd">
                <td>37381</td>
                <td>0×9205</td>
                <td>integer rational (unsigned)</td>
                <td>Maximum Aperature</td>
                <td></td>
            </tr>
            <tr>
                <td>37383</td>
                <td>0×9207</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Metering Mode</td>
                <td>0 = Unknown<br/>
                    1 = Average<br/>
                    2 = Center-weighted average<br/>
                    3 = Spot4 = Multi-spot<br/>
                    5 = Multi-segment<br/>
                    6 = Partial<br/>
                    255 = Unknown</td>
            </tr>
            <tr class="odd">
                <td>37385</td>
                <td>0×9209</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Flash</td>
                <td>0 = No Flash<br/>
                    LSB (8th bit) set = Flash Fired<br/>
                    bits 4&5, L-R:<br/>
                    10 = Flash off<br/>
                    01 = Flash on<br/>
                    11 = Flash auto</td>
            </tr>
            <tr>
                <td>37386</td>
                <td>0x920a</td>
                <td>integer rational<br/>(unsigned)</td>
                <td>Focal Length</td>
                <td></td>
            </tr>
            <tr class="odd">
                <td>37500</td>
                <td>0x927c</td>
                <td>N/A</td>
                <td>Equipment Maker Note</td>
                <td>Camera Maker specific information</td>
            </tr>
            <tr>
                <td>37510</td>
                <td>0×9286</td>
                <td>integer<br/>(signed)</td>
                <td>User Comment</td>
                <td></td>
            </tr>
            <tr class="odd">
                <td>40961</td>
                <td>0xa001</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Color Space</td>
                <td>1 = sRGB</td>
            </tr>
            <tr>
                <td>40962</td>
                <td>0xa002</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Pixel X Dimension</td>
                <td>In pixels</td>
            </tr>
            <tr class="odd">
                <td>40963</td>
                <td>0xa003</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Pixel Y Dimension</td>
                <td>In pixels</td>
            </tr>
            <tr>
                <td>41486</td>
                <td>0xa20e</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Focal Plane X Resolution</td>
                <td></td>
            </tr>
            <tr class="odd">
                <td>41487</td>
                <td>0xa20f</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Focal Plane Y Resolution</td>
                <td></td>
            </tr>
            <tr>
                <td>41488</td>
                <td>0xa210</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Focal Plane Resolution Unit</td>
                <td>1 = None<br/>
                    2 = Inches<br/>
                    3 = Centimetres<br/>
                    4 = Millimetres<br/>
                    5 = Micrometres</td>
            </tr>
            <tr class="odd">
                <td>41495</td>
                <td>0xa217</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Sensing Method</td>
                <td>1 = Not defined<br/>
                    2 = One-chip colour area<br/>
                    3 = Two-chip colour area<br/>
                    4 = Three-chip colour area<br/>
                    5 = Colour sequential area<br/>
                    7 = Trilinear<br/>
                    8 = Colour sequential linear</td>
            </tr>
            <tr>
                <td>41728</td>
                <td>0xa300</td>
                <td>integer<br/>(signed)</td>
                <td>File Source</td>
                <td>1 = Film scanner<br/>
                    2 = Reflection print scanner<br/>
                    3 = Digital camera</td>
            </tr>
            <tr class="odd">
                <td>41985</td>
                <td>0xa401</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Custom Rendered</td>
                <td>0 = Normal<br/>
                    1 = Custom</td>
            </tr>
            <tr>
                <td>41986</td>
                <td>0xa402</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Exposure Mode</td>
                <td>0 = Auto<br/>
                    1 = Manual<br/>
                    2 = Auto Bracket</td>
            </tr>
            <tr class="odd">
                <td>41987</td>
                <td>0xa403</td>
                <td>integer<br/>(unsigned short)</td>
                <td>White Balance</td>
                <td>0 = Auto<br/>
                1 = Manual</td>
            </tr>
            <tr>
                <td>41988</td>
                <td>0xa404</td>
                <td>integer rational<br/>(unsigned)</td>
                <td>Digital Zoom Ratio</td>
                <td></td>
            </tr>
            <tr class="odd">
                <td>41989</td>
                <td>0xa405</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Focal Length in 35 mm Format</td>
                <td></td>
            </tr>
            <tr>
                <td>41990</td>
                <td>0xa406</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Scene Capture Type</td>
                <td>0 = Standard<br/>
                    1 = Landscape<br/>
                    2 = Portrait<br/>
                    3 = Night</td>
            </tr>
            <tr class="odd">
                <td>41991</td>
                <td>0xa407</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Gain Control</td>
                <td>0 = None<br/>
                    1 =Low gain up<br/>
                    2 = High gain up<br/>
                    3 = Low gain down<br/>
                    4 = High gain down</td>
            </tr>
            <tr>
                <td>41992</td>
                <td>0xa408</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Contrast</td>
                <td>0 = Normal<br/>
                    1 = Low<br/>
                    2 = High</td>
            </tr>
            <tr class="odd">
                <td>41993</td>
                <td>0xa409</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Saturation</td>
                <td>0 = Normal<br/>
                    1 = Low<br/>
                    2 = High</td>
            </tr>
            <tr>
                <td>41994</td>
                <td>0xa40a</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Sharpness</td>
                <td>0 = Normal<br/>
                    1 = Soft<br/>
                    2 = Hard</td>
            </tr>
            <tr class="odd">
                <td>41996</td>
                <td>0xa40c</td>
                <td>integer<br/>(unsigned short)</td>
                <td>Subject Distance Range</td>
                <td>0 = Unknown<br/>
                    1 = Macro<br/>
                    2 = Close<br/>
                    3 = Distant</td>
            </tr>
        </tbody>
    </table>
</div>
