---
layout: post
published: true
title: ! 'Better Printed Photos: Naming with Date Taken'
excerpt:  Labelling printed photos is a hassle -- I show how to use PowerShell to rename photo files before printing
          so that the date is printed on the back.
---
Whenever I've needed to print digital photos, I've found that [Photolab](http://photolab.ca/) -- the photo processing arm
of the Canadian grocery chain Loblaws -- has always done a great job. Photos are typically printed in a day or less, are
easy to pick up -- just stop by your local supermarket! -- and have always turned out excellently. And they are reasonably
inexpensive, too.

For as long as I can remember, my parents have been labelling the back of the photos in their photo albums with the
month they were taken. That way, when browsing an album years in the future it is easy to see exactly when something
happened and how old I was at the time (they sometimes label the people and the places as well, depending on how
non-obvious these attributes are in the photo itself). Though it takes a bit of work to make all these annotations, the
outcome is well worth it in the end.

With traditional film, there are few alternatives to manually annotating photos; 'burning' the date into the photo
itself is one technique, but obscures some of the image as a result. But with digital photos, this information -- and
much more -- is stored alongside the photo by the digital camera. And on the back of the prints we get back from
Photolab/Zehrs, they conveniently print the photo filename on the back of the photos. Wouldn't it be nice if we could
put the date into the filename to make annotating our photos easier?

## Naming photos for printing with PowerShell

With my [new-found-interest]({% post_url 2009-12-13-sending-email-with-powershell-implicit-and-explicit-ssl%}) in
scripting with PowerShell, I figured that there must be a way to automatically name files based on the date they were
taken. Sure enough, there was -- the [Image](http://msdn.microsoft.com/en-us/library/system.drawing.image.aspx) class,
part of the System.Drawing namespace, allows reading of the EXIF data stored by the camera in the photo.

{% highlight powershell %}
# Load image and get EXIF date
[System.Reflection.Assembly]::LoadWithPartialName("System.Drawing") > $null
$photo = [System.Drawing.Image]::FromFile($file)
try
{
    $dateProp = $photo.GetPropertyItem(36867)
}
catch
{
    try
    {
        $dateProp = $photo.GetPropertyItem(306)
    }
    catch
    {
        continue
    }
}
$photo.Dispose()
{% endhighlight %}

While it is rather straightforward to get EXIF metadata in general from a photo, it takes a bit more work to get the
precise data you want. EXIF data is stored as key:value pairs in the image, with the keys being standardized numerical
identifiers. Here, we first try to access the 'Date Taken' value with key 36867, and should that fail, the 'Date Time'
value with key 306. These numbers are completely unintuitive, but can be found at various places on the web; an
extensive list (if you already know what you are looking for) is in enumeration format
[here](http://weblogs.asp.net/justin_rogers/pages/108237.aspx). If neither can be accessed, we skip renaming the file;
this is likely the result editing the photo with a program that does not preserve this data.

Once we've retrieved the date the photo was taken from the EXIF metadata, we still have to parse it into a string that
we can use for our filename. The data is stored using UTF8 encoding, so we first transform the raw bytes into a string,
and then pull the useful parts of the date out into separate variables.

{% highlight powershell %}
# Convert date taken metadata to appropriate fields
[System.Reflection.Assembly]::LoadWithPartialName("System.Text") > $null
$encoding = New-Object System.Text.UTF8Encoding
$date = $encoding.GetString($dateProp.Value).Trim()
$year = $date.Substring(0,4)
$month = $date.Substring(5,2)
$day = $date.Substring(8,2)
{% endhighlight %}

With that data (and a simple regex), I finished the script by renaming the file into the form 'YYYY.MM.DD.iNNNN.jpg',
where NNNN is the four-digit image number of the original file (my parent's camera, a Canon, names files IMG_NNNN.jpg;
other manufactures use similar formats). Now when we print our photos, we don't need to add the date by hand -- the
script ensures that a string like '2010.01.05.i1234.jpg' is printed on the back of our photo, which tells us the date
(January 5th, 2010) as well as what to search for if we need to print another copy ('1234', which finds the original
image 'IMG_1234.jpg' (again, this example is for Canon cameras)).

## Renaming Files with Date Taken: The Full Script

The next time you need to send photos for printing, give the script a try. Running the script is easy; simply make a
copy of all the photos you want to print into a new folder, and save the following PowerShell script into the directory
with the photos for printing. Then, right-click on the script and select 'Run with PowerShell'. The script scans the
directory, finds all of the images, and then renames them based on the 'Date Taken' EXIF field.

[PowerShell Date Taken Naming Script](https://github.com/ndrarmstrong/blog/blob/master/NameForPrinting/NameForPrinting.ps1) [ps1]
