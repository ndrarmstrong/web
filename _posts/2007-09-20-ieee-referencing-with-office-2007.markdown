---
layout: post
published: true
title: IEEE Referencing with Office 2007
---

Almost every work term, I have to write a large technical report for the Electrical and Computer Engineering department
at the University of Waterloo investigating a problem I encountered on that work term.  I won't go in to the details,
but needless to say, it's always a lot of hassle and quite a bit of work to write a report that meets all of the
predefined requirements, all of which are pretty strict and most of which are usually part of the so-called "fine points
department".

After upgrading to Microsoft Office 2007, I discovered the awesome <a
href="http://blogs.msdn.com/joe_friend/archive/2006/07/13/664960.aspx">new bibliography tools</a> for writing reports
and essays with Office '07.  It'll do APA, MLA, Chicago, and a bunch of other referencing styles for you, without any
fuss or remembering whether a title is italicized or quoted.  For everything but the IEEE referencing styles, that is.

Since that clearly wouldn't do, I decided to modify one of the built in styles to do IEEE referencing for me.  A bunch
of XSL transforms later, and Office 2007 was put to work managing references for me.  As it was such a time saver for me
this past term, I'm providing the modified file for everyone to use as they see fit.

[IEEE.XSL: Office 2007 Stylesheet for IEEE Referencing](https://github.com/ndrarmstrong/blog/blob/master/IEEE/ieee.XSL)

**NB:** I only implemented the parts of the IEEE standard I was using, so the file only works for the office types
*Book*, *Book Section*, *Journal Article*, and *Web Site*.

**NB 2:** Office 2007 doesn't allow you to change the name displayed in the drop-down menu (at least, as far as I can
tell), so this one shows up as 'ISO 690: Numerical Reference' .  If you haven't deleted the original ISO Numerical
style, you'll see this entry in the menu twice, the* first of which* is the IEEE style.

Installation is pretty easy -- simply copy the IEEE.xsl file into the
`C:\Program Files\Microsoft Office\Office12\Bibliography\Style` directory and restart Office!
