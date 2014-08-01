---
layout: post
published: true
title: HP Mini 110 with Windows 7
excerpt: After my previous laptop (an HP tablet) decided to pack it in for good after
  only 18 months of use, I decided to pick up a cheap netbook to tide me over until
  I finished my masters.  The netbook I got was an HP Mini 110-1030CA; this post
  details installing Windows 7 on it and my initial thoughts on using the netbook.
---

<div class="post-img-left top-p hidden-xs"><a href="{{ site.baseurl }}/assets/posts/2009-09-03/hpmini.jpg">
    <img src="{{ site.baseurl }}/assets/posts/2009-09-03/hpmini_thumb.jpg"/>
</a></div>

After my previous laptop (an HP tablet) decided to pack it in for good after only 18 months of use, I decided to pick up
a cheap netbook to tide me over until I'm finished my masters (I've got a desktop PC that fills my day-to-day computing
needs, but I can't take it with me to class). After a lot of research, my choice came down to an <a title="ASUSTek
Computer Inc." href="http://www.asus.com/Notebooks_Ultrabooks/Eee_PC_1005HA_Seashell/">Asus EEE PC 1005HA</a> or a <a
title="Product Specifications HP Mini 110-1030CA PC -- HP Customer Care"
href="http://h10025.www1.hp.com/ewfrf/wc/document?docname=c01762199&lc=en&dlc=en&cc=ca&lang=en&product=3979284">HP Mini
110-1030CA</a>. Due to licensing restrictions on cheap versions of Windows XP, every (cheap) netbook you encounter has
nearly identical specs -- 1 GB RAM and an Atom N270/280 CPU -- which means there isn't much to differentiate between
models. Initially, I leaned toward the Asus -- it's 10 hour battery life (versus the Mini's 3) and slightly taller (by 24
pixels) screen make it a better machine, but also result in a higher cost (not to mention that finding a retailer with
it in Canada was nearly impossible). Both computers had above-average keyboards for netbooks -- the Mini's is often
recognized as the best available on a 10" netbook -- my only real constraint. After some well-timed sales and a bit of
price matching, I was able to track down the HP for $90 cheaper than I could find the Asus for, making it a much better
bargain. I'm crossing my fingers that it will last longer than my previous HP laptop -- which had 3 major failures
requiring service over its short lifetime, the last of which fell outside its warranty -- but at only $300, it's worth
the risk.

Having used Windows 7 off and on since last October -- and using Vista for the year prior to that -- going back to the
version of Windows XP that came with the Mini just wasn't an option for me. Windows 7 has thoroughly impressed me so far
on all the machines I've used it on, not only on a newer Intel quad-core but also on my 7-year-old Athlon XP desktop
machine. So I decided to grab the RTM version of Windows 7 off of MSDN and install it on the Mini; a quick guide to the
install process and my initial thoughts on the Mini with Windows 7 follow.

## Installing Windows 7 on a HP Mini 110-1030CA

#### Step 1: Choosing an Install Method

Like Vista before it, Windows 7 comes on a DVD -- an awkward proposition for netbooks, which usually don't come with an
optical drive. There are three general ways of getting Windows 7 on to these machines; via external DVD drive, via USB
key, or via a DVD drive on a networked computer. Since I don't have an external DVD drive and my largest USB key is less
than the required 4 GBs, I decided to take the third option -- doing a network install via a DVD drive on another
computer -- and that's the process I'm describing here. A quick Google/Bing search for 'windows 7 install netbook' or
similar should yield you a ton of results on how to do it with a USB key if you're interested in that route, though it
seems much more complicated than doing it over a network.

#### Step 2: Share out your DVD Drive

If you've shared a folder on your computer before, then sharing your DVD drive should be pretty easy. Go to the computer
you wish to share the drive from, and insert your Windows 7 disc. If you're on Windows 7, open 'Computer' by pressing
Windows-E on the keyboard (or choose 'Computer' from the start menu) and locate the DVD drive in which you placed your
Windows 7 install disc. Right click on the drive and choose 'Properties' from the menu that appears; then, click the
'Sharing' tab. Then, share the drive ('Advanced Sharing' -> 'Share this folder'). Finally, check to make sure that your
computer is set up to share files by opening the Network and Sharing Center (Start -> 'Control Panel' -> 'Network and
Sharing Center' -> 'Advanced Sharing Settings') and checking to make sure that 'File and printer sharing' is set to
'Turn on file and printer sharing'. You might also want to make sure 'Password protected sharing' is set as well. Then,
make a quick note of your computer's name by hitting the Back button to go back to the Network and Sharing Center, and
write down whatever the name of the computer is in the network map at the top of the screen (it will be labelled 'this
computer'). If you are on Vista instead, the above instructions should work, though some of the items may have slightly
different names. And if you're on Windows XP, then the steps are completely different -- follow <a
href="http://www.microsoft.com/windowsxp/using/networking/maintain/share.mspx">this support article</a> instead, except
you'll be sharing out a drive instead of a folder.

#### Step 3: Configure your hard drive

If you only want to have Windows 7 on your machine, this step isn't necessary. However, if you want to dual boot Windows
XP and Windows 7, or want to keep your XP partition around for restore purposes (my HP Mini 110-1030CA didn't come with
restore discs or a restore partition), then you'll want to partition the hard drive in order to create a separate
partition for Windows XP. I used the free version of <a
href="http://download.cnet.com/Easeus-Partition-Master-Home-Edition/3000-2248_4-10863346.html">Easeus Partition
Master</a> to do this, but there are other options (Partition Magic, GParted, etc.). Using your partition tool,
resize/shrink the Windows XP partition so that there is enough room leftover to install Windows 7 (<a
href="http://windows.microsoft.com/systemrequirements">at least 16 GB</a>, though that won't leave much room for
applications -- Win7 takes around 10 GB on its own). Then, create a new partition in the empty space, formatted as NTFS.
Hit apply, wait for the changes to take place (a reboot is probably required), and once it finishes you'll have two hard
disk drives that show up, one (C:) your previous Windows XP drive, now smaller, and another one (D:, unless you've
selected a different mount point) that's completely empty and waiting for your Windows 7 install.

#### Step 4: Start the install process

Now it's time to start the install. Connect your Mini to the same network as the computer you are sharing the Windows 7
install disc from. You may have to mark this network as a 'Home' or 'Work' network for the computer hosting the install
disc, since by default Vista and Windows 7 don't allow file sharing over public networks. Then, on your Mini, open the
'Run' box by pressing Windows-R on the keyboard (or choose 'Run' from the start menu) and type two back-slashes followed
by the name of the computer hosting the install disc (you wrote this down in step 2). For instance, if your machine name
was 'dvd-pc', you want to type '\\dvd-pc' in the run box. Then, press OK; after a few seconds, an explorer window should
appear containing all of the shares on the host computer. Double click on the share you created in step 2 corresponding
to the computer's DVD drive (by default, it's a single letter matching the driver letter of the DVD device on the host
computer). The DVD should spin up on the host computer, and you should see a number of folders appear along with an
executable named 'setup.exe'. Double click 'setup.exe', and wait as the Windows 7 autorun starts (it could take 30
seconds to a minute, depending on your network speed). Once it starts, select the 'Install Now' option, and wait as the
installer loads (another minute or two). Follow the prompts that appear, selecting 'Clean' install and the drive you
created in step 3 when asked, and then sit back and wait as the installer copies all of the necessary files off of the
disc via the Mini's network connection, reboots to perform the installation, and reboots once more to prepare everything
for use. Once it's done, it'll ask you to configure the time zone, license key, and password, then it'll drop you into
the Windows 7 desktop with everything installed.

#### Step 5: Windows Update

The first thing you should do after installing a new operating system is to update it to the newest version, in our case
by running Windows Update. Simply type 'Windows Update' in the start menu, open the program that appears, and press
'Check for updates'. Once it comes back with a list of things to be installed, ensure there is a checkbox beside all
'Recommended' items and any important 'Optional' items (there was a network driver waiting for me under 'Optional', but
I didn't need any additional languages), and then press update to download and apply the updates.

#### Step 6: Install Missing Drivers

Once Windows 7 has finished update, you'll have to install any drivers it wasn't able to install during the install or
update process. On my HP Mini 110-1030CA, Windows 7 was able to find *all* of the drivers it needed, but there is one
driver it doesn't get perfectly right: the touch pad. Don't worry -- the touch pad still works, but the scrolling
functionality doesn't work. To fix it, head on over to the touch pad manufacturer's <a
href="http://www.synaptics.com/support/drivers">driver site</a> and download the drivers for Windows Vista 32-bit
Edition (or Windows 7 32 bit, if they are there -- they weren't when I tried it). Once the drivers are finished
downloading, double click to start the install, follow the prompts, and reboot. If you're not using the same Mini I am,
head on over to the Device Manager (type 'Device Manager' in the start menu) and locate the drivers for any device with
an exclamation point beside it. Windows will expand any item that has devices with missing drivers, to if all of the
top-level categories are collapsed, you're good to go.

#### Step 7: You're Done!

Yep, that's it -- you've managed to install Windows 7 on your HP Mini! Before you finish up, consider un-sharing your DVD
drive by reversing the things you did in step 1; however, if you have more CD/DVD based software to install, do that
first.

## Windows 7 on a HP Mini 110-1030CA: The Results

I'm pretty impressed with how well the machine runs. I've upped it to 2 GB of RAM over the stock 1 GB since I had a
spare 2 GB stick -- and 2G RAM sticks are cheap enough now to make it worthwhile in any case -- which allows Windows 7 to
use it to speed up program launches. It's not perfect, of course -- the screen often feels small, and I have encountered
the occasional slow down, but outside of that it's surprisingly usable for just poking around the Internet.

#### The Keyboard

<div class="post-img-left top-p hidden-xs"><a href="{{ site.baseurl }}/assets/posts/2009-09-03/hpmini_kbd.jpg">
    <img src="{{ site.baseurl }}/assets/posts/2009-09-03/hpmini_kbd_thumb.jpg"/>
</a></div>

The keyboard's pretty good (most places regard the Mini as having the best keyboard on a netbook, and I tend to agree),
though my model has an odd copy of the '|\' key where the rest of the left shift key should be which I keep pressing by
accident when I try to type a capital. It might be because I have a Canadian model (the keyboard has the French-Canadian
keyboard markings too), though it's something I'm sure I will eventually get used to (or I'll learn to use the right
shift key, which is full size). In the meantime, I've used <a title="SharpKeys -- Home"
href="http://www.codeplex.com/sharpkeys">SharpKeys</a> to remap the extra key to left shift so that it doesn't interfere
when hit by accident. Incidentally, the other annoying key is the traditional '|\' key; it is located on the middle row
of the keyboard right before the two-row enter key, rather than above a single-row enter key. Both my desktop keyboards
have single-row enter keys, so this placement results in many accidental keypresses -- and it's not something SharpKeys
can fix. Outside of that, however, the keyboard has been great -- a little smaller than I'm used to, but not enough to
impact my typing. The keys have a nice feel and travel, the arrow keys are arranged in an inverted T shape, both
backspace and the spacebar are large, and the keys which have been removed from the keyboard to save space (home/page
up/page down/end) have been function-mapped to easily memorable/accessible keys. Surprisingly, HP didn't function-map
the number pad over the right half of the keyboard, but since I rarely use this feature I haven't missed it.

#### The Screen

The screen is -- as one would expect -- quite small. For web use, it hasn't been a huge hassle; there's just more
scrolling than usual. For regular application use, I've found it absolutely terrible at multiple windows. At this point,
I've basically given up using windows that aren't maximized to the full screen size, and using more than one window at
once is an exercise in alt-tabbing. Even when using a single application, the small screen sometimes makes it difficult;
there are a lot of applications that assume that vertical space is abundant, and fill it with 100+pixels of toolbars.
Careful selection and configuration can minimize this problem -- I've found <a title="Google Chrome -- Download a new
browser" href="http://www.google.com/chrome">Google Chrome</a> to be the fastest and leanest browser; <a
title="Thunderbird -- Reclaim your inbox" href="http://www.mozillamessaging.com/thunderbird/">Thunderbird</a> (and <a
title="Firefox web browser | Faster, more secure, & customizable" href="http://www.mozilla.com/firefox/">Firefox</a>)
work better when using small toolbar icons, no toolbar text, no status bar, and <a title="Compact Menu 2 :: Add-ons for
Thunderbird" href="https://addons.mozilla.org/en-US/thunderbird/addon/4550">this extension</a> to get rid of the menu
bar; <a title="Office Online Home Page -- Microsoft Office Online" href="http://office.microsoft.com/">Office</a>'s
ribbon can be minimized by double-clicking one of its tabs; and Windows 7 runs great with an auto-hide taskbar that's
mounted vertically along the side of the screen -- but there are a few applications that perform poorly (I'm looking at
you, <a title="Essentials -- Windows Live" href="http://download.live.com/?sku=messenger">Windows Live
Messenger</a>). Since more and more applications are on the web these days, the use of multiple windows is less
and less of a concern.

#### The Horsepower

While I feared that the Mini would be underpowered, it has not turned out to be the case. It's not something I'd use for
all my computing tasks, but for something small to tote around to check one's email with and have something to do during
otherwise wasted time, it can't be beat. The Mini has no trouble with regular-quality YouTube, even full-screen, though
HD YouTube is too choppy to watch. Microsoft Office runs great -- heck, it's even been handling Visual Studio admirably
well. With a Windows Experience Index of 2.0 (Processor: 2.2, Memory: 4.5, Graphics: 2.0, Gaming Graphics: 3.0, Hard
Disk: 5.6), the HP Mini 110-1030CA is able to handle Windows Aero without trouble, too. And it uses hyperthreading to
present two 'virtual' processors to the operating system, which improves the interactivity of the system to the point
where I haven't noticed a foreground task being blocked by a heavy background one. All in all, for the things I'm using
the netbook for I can't tell that this machine has significantly less power than the other machines I've used.

#### The Operating System

Windows 7 works great, no ifs, ands, or buts. It's modern, fast, and easy to use, and installing it (as the instructions
above show) is a hassle-free experience. And it's certainly suited for netbooks -- I'm running the Ultimate edition, and
so far it has been consistently faster than the version of Windows XP that came with the Mini. It responds
instantaneously to keyboard and mouse input, and resuming from sleep or hibernate happens quickly. With all of my
commonly-used applications installed, it boots to the desktop in about 45 seconds, and it's ready to go as soon as you
see the desktop. I haven't experienced any stability problems, either with Windows itself or with the drivers it has
loaded. All in all, I've got no complaints whatsoever about Windows 7, and highly recommend that other netbook users out
there install it as soon as they can get their hands on a copy.

## Final Thoughts

Overall, I'm incredibly impressed with this little computer -- and the emphasis there goes on both *little* **and**
*computer*. It's sure easy to carry this thing around -- it weighs just over a kilogram and measures 10.5" by 7.5",
making it smaller and lighter than most of my textbooks -- and the battery life so far has been sufficient in every
scenario I've used it. And it's an actual computer, not a glorified cell phone; I don't feel myself avoiding typing on
it or considering whether or not it supports something (Flash, Java, etc.), I just go ahead and do it. The screen is
large enough to read comfortably, and the speakers, while very definitely "laptop" sounding speakers, are clear and
full. Granted, there are some compromises one has to make -- it's certainly not a 'desktop replacement' laptop -- but for
me, those compromises are rare enough that I can work around them easily and still get a significant amount of utility
from the Mini.

**Final Vertdict:** The HP Mini 110-1030CA is an excellent second (or third) computer for students and other
people on the go, and works wonderfully with Windows 7.
