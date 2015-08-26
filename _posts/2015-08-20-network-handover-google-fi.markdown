---
layout: post
published: true
title: Network handover in Google Fi
excerpt: Google's Project Fi represents a major shift for the cellular industry. I explore how Google's Project Fi
         switches between Sprint, T-Mobile, and Wi-Fi.
---

Google's Project Fi represents a major shift for the cellular industry on a number of fronts.
Fi is not "just another MVNO" that resells service from a traditional MNO; rather, it combines service
from both T-Mobile and Sprint -- along with Wi-Fi -- to make a high-quality, low-cost network.  In theory.

The media in particular has focused on the handover between the networks, extolling the virtues of switching
between Wi-Fi and cellular (see
[here](https://www.washingtonpost.com/news/the-switch/wp/2015/07/08/the-most-remarkable-feature-of-googles-new-cell-service/),
[here](http://www.androidcentral.com/what-its-switching-between-networks-and-wifi-project-fi), or
[here](http://www.fiercewireless.com/tech/story/googles-project-fi-handoffs-it-magic/2015-07-16) for examples).  This quote from
[The Wall Street Journal's Project Fi review](http://www.wsj.com/articles/project-fi-review-google-masters-wi-fi-calling-but-needs-better-phones-1436285959)
is one notable example:

> Google’s real secret is in the handoff from Wi-Fi to cellular or vice versa. When I made a call on my home
> Wi-Fi, then kept talking as I walked out into the streets of San Francisco, the transition was seamless.
> But Google also allows for a seamless handoff between the T-Mobile and Sprint networks without you noticing.
> That’s magic.

Magic, indeed.

I have some experience in this area so I immediately wanted to understand how they were able to
pull this off.  Could Project Fi really be this awesome?

## Testing Google Fi

I had the opportunity to use a Project Fi phone this week, and so I set out to see how Project Fi actually works.
Here is the short version (details follow):

  1. The Google Fi SIM has two profiles
  2. The active profile switches between networks
  3. Switching networks is fast, but not instantaneous
  4. Calls do handover from Wi-Fi to cellular...
  5. ...but not seamlessly...
  6. ...and don't transfer back
  7. Calls do not handover between cellular networks
  8. Data does not handover between networks
  9. The Google Fi SIM does work in other phones
  10. Global roaming is done only through T-Mobile


### Testing notes

All testing was done in Austin and Dallas, Texas during the week of 2015-08-17 with a Nexus 6 ordered through the Fi program; roaming
was tested in Waterloo, Ontario.  Fi is still invite-only, so these results will certainly change over time.

Since the algorithms used by Project Fi are proprietary and undocumented, I've been using the dialer codes discovered by [maejrep on XDA Developers](http://forum.xda-developers.com/nexus-6/general/project-fi-fi-dialer-codes-to-force-t3132393)
to put the device on to specific networks for testing.

<div class="table-responsive">
    <table class="table table-striped table-hover" style="font-size: 80%">
        <thead>
            <tr>
                <th>Dialer code</th>
                <th>Dialer code (numeric)</th>
                <th>Function</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>FI SPR</strong></td>
                <td><kbd>*#*#34777#*#*</kbd></td>
                <td>Use Sprint</td>
            </tr>
            <tr>
                <td><strong>FI TMO</strong></td>
                <td><kbd>*#*#34866#*#*</kbd></td>
                <td>Use T-Mobile</td>
            </tr>
            <tr>
                <td><strong>FI NEXT</strong></td>
                <td><kbd>*#*#346398#*#*</kbd></td>
                <td>Next carrier</td>
            </tr>
            <tr>
                <td><strong>FI AUTO</strong></td>
                <td><kbd>*#*#342886#*#*</kbd></td>
                <td>Automatic carrier</td>
            </tr>
            <tr>
                <td><strong>FI INFO</strong></td>
                <td><kbd>*#*#344636#*#*</kbd></td>
                <td>SIM/network info</td>
            </tr>
        </tbody>
    </table>
</div>

In addition to the dialer codes, I used [Network Info II](https://play.google.com/store/apps/details?id=aws.apps.networkInfoIi&hl=en)
to verify the current mobile network.  I also used a network usage reporter tool
developed in-house at [Pravala Networks](http://pravala.com) to view data transmissions in real-time during handover tests.


## 1. The Google Fi SIM has two profiles

SIM cards encode identity information necessary to attach to a GSM or LTE mobile network, which allows users to switch devices
simply by switching the SIM card to a new device.  CDMA (a competing technology) hardcodes this information into the device
itself, making it much more difficult to switch between devices.  T-Mobile runs a GSM network and Sprint a CDMA one,
but with LTE both companies are using SIM cards -- and for Project Fi, you get a Fi-branded SIM.

The identity information contained on the SIM includes a list of preferred networks, encryption keys, and other information tied
to an IMSI -- International Mobile Subscriber Identifier.  When connecting to a network, this profile is used to locate the subscriber's
record -- either locally within the operator's network, or remotely in the home network of the subscriber when roaming -- telling
the network whether to provide service, how data/texts/calls are to be billed, and the corresponding decryption keys.

The `FI INFO` dialer code can be used to display the current IMSI.  Running this code when on Sprint and T-Mobile gives different
IMSI numbers:

![Google Fi SIM profiles]({{ site.baseurl }}/assets/posts/2015-08-20/fi-profiles.png)

The fact that two IMSIs are used is quite interesting on a number of fronts:

  * Technically, this is similar to a dual-SIM device -- except the two profiles cannot be used at the same time
  * It's *likely* that Sprint issues a Sprint profile, and T-Mobile issues a T-Mobile profile; the two
    companies don't have to work together.  It's also *likely* that Google puts both on the Fi SIM card.
  * Taken together, you can look at the phone as being either a Sprint phone *or* a T-Mobile phone -- which
    means that Google will need to be arbitrating calls between networks (and Wi-Fi) with their own system
    * This differs from roaming, where the subscriber is the same regardless of network -- when a call comes in, the
      home network checks whether it local or roaming based on the subscriber record
  * I *suspect* this will make it easier for Google to add more operators going forward, as it just means adding more
    profiles to the Fi SIM

The popup also contains tantalizing hints at capabilities and optimizations Google has built with
Cached, UICC, and Platform IMSIs displayed -- but I don't have a good guess at what they mean.  All 3 have been
identical in my testing.


## 2. The active profile switches between networks

Given that two different profiles exist on the Fi SIM, the Fi software must have the capability to switch between them.
SIM cards are actually little computers, so by developing an application that runs on the SIM card Google could trigger
a switch based on any of the information the SIM has access to -- the network it is registered on, the receipt of
a trigger SMS, or something else.

My *guess* is that the SIM card contains a small application that can activate a specific profile in response to a command
from the Fi software.  This profile then remains active until another such command is received.  Logically, this makes sense
-- the algorithms Google will want to use as part of the system are much easier coded as part of an app that can be updated
through the Play Store and access any number of data sources; once it decides, it simply instructs the SIM to activate
the desired profile.

Regardless of the precise mechanism, changing the active profile disconnects the current cellular network and starts a
registration to the next network with the new profile information, as if you had physically switched SIM cards.


## 3. Switching networks is fast, but not instantaneous

Using the Fi dialer codes, I was able to gather some results on how long it took to switch between networks:

<div class="table-responsive">
    <table class="table table-striped table-hover" style="font-size: 80%">
        <thead>
            <tr>
                <th>Direction</th>
                <th>Average switch time (5 runs)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Sprint to T-Mobile</strong></td>
                <td>9 seconds</td>
            </tr>
            <tr>
                <td><strong>T-Mobile to Sprint</strong></td>
                <td>14 seconds</td>
            </tr>
        </tbody>
    </table>
</div>

Though not instantaneous, this is still very fast.  In my previous experience, switching networks typically takes on the
order of 2 minutes, as the device needs to perform a scan to find the destination network before registering
and connecting.  Older devices typically scan a bit faster, as they have less bands and technologies to check --
but operate on less networks as a result.

Since you can use an off-the-shelf Nexus 6 with Fi (though I'm using one ordered with the service), I *suspect*
that the Fi software is cutting down this scan to only Sprint/T-Mobile frequencies and technologies (CDMA/LTE
for Sprint, 3G/LTE for T-Mobile).  I'm not sure if that is sufficient for their fast switch speed, or whether
additional optimizations are used.  Whatever mechanism is used is significantly faster that a naïve search.


## 4. Calls do handover from Wi-Fi to cellular...

[If enabled](https://support.google.com/fi/answer/6157793?hl=en), Google Fi will make calls over Wi-Fi in addition to cellular.
This can be a huge benefit, as it allows
you to place calls even in places with poor cellular coverage (your basement) or while travelling abroad (without
paying roaming fees).  Google Fi provides unlimited domestic calling as part of the basic package, so cutting down
voice minutes is not a huge priority for Fi subscribers -- but for other operators with limited minutes, called placed
over Wi-Fi help to reduce the number of voice minutes as well.

Wi-Fi calling only works as well as the Wi-Fi, and one of the major areas this appears is when starting a call on Wi-Fi and
then leaving the Wi-Fi coverage area -- for instance, starting a call at home and then leaving the house.  Solving this
requires handing over the call between the Wi-Fi and cellular networks. The call can be handed over to cellular as a
traditional cellular voice call, or as a continuation of the VoIP/VoWiFi call over cellular data (VoLTE).

In my testing, Fi preferred cellular calls over Wi-Fi calls, even when both networks were available.  However,
it is possible to start calls on Wi-Fi by enabling airplane mode when dialing; this forces Google Fi to start the call on Wi-Fi.
You'll see this in the dialer app when the Wi-Fi icon appears beside the network name.

Fi transfers the call to cellular when it decides Wi-Fi is of poor quality or loses Wi-Fi entirely; both cases
show up in the dialer UI.  When a quality problem is encountered, a "Reconnecting" message appears; if the Wi-Fi is
lost completely, it displays "Calling" instead.

![Call handover with Google Fi]({{ site.baseurl }}/assets/posts/2015-08-20/fi-handover.png)

Once the transfer is complete, the UI updates to show the call running over the Fi Network accompanied with the cellular icon.
The handed-over call uses cellular voice; no mobile data is used, so handover works even when mobile data is disabled.
Handover from Wi-Fi to cellular worked identically across Sprint and T-Mobile.

## 5. ...but not seamlessly...

Though Google Fi will continue a Wi-Fi call over cellular, the transition is decidedly not seamless.  I saw gaps of 2-5 seconds
on average, depending on the conditions during the handover.  The sudden loss of the Wi-Fi network was on the 5 second side of
the scale; if a temporary Wi-Fi quality problem triggered the handover then the handover took as little as 2 seconds.  This latter case
is faster than the former, as dialer client can keep the Wi-Fi call active while it sets up the voice call, and then cutover to the
voice call once connected.

Because of this gap, it is apparent to both parties on the call that a handover has occurred.  Though a handover with a gap
is much better than a call loss, I expect this is one area Google will be looking to improve. Strangely, I also noticed a significant audio
volume increase once the call was reconnected over cellular voice; I don't have any way to quantify how much, but it was
repeatable across tests and networks.

## 6. ...and don't transfer back

Another interesting finding is that calls that begin on cellular -- or calls that start on Wi-Fi and are handed over to cellular --
are never handed (back) over to Wi-Fi.  No amount of waiting would move a call from cellular to Wi-Fi, and any attempt to drop
mobile network immediately resulted in a call drop despite the availability of Wi-Fi.

Similarly, whenever a network problem was detected on a Wi-Fi call the call would always hand over to cellular -- even if the
Wi-Fi network recovered.  As soon as it decides to hand over it *will* hand over -- even if this is some seconds later once
the cellular voice call is ready and the Wi-Fi network is good at that time.

Given Fi's pricing model for calls this preference for cellular is not surprising; it does mean however that you'll still
experience dropped calls in office buildings and basements where Wi-Fi quality is good and cellular coverage is poor.

## 7. Calls do not handover between cellular networks

The combination of a long switch and separate profiles is a very good indicator that cross-cellular call handover
isn't supported -- and it's not.  In fact, any attempt to use the dialer codes during a phone call simply
queues these commands until the call is finished, despite the Fi UI appearing and indicating a network switch
is in progress.  Once the call is completed, the network switch occurs, taking the same amount of time as seen in #3.

## 8. Data does not handover between networks

Unlike calls, no handover between data networks is provided for applications.  The device receives different IP addresses based on the
networks it uses (Sprint, T-Mobile, and Wi-Fi), and traceroutes over these networks show routes similar to those seen on other
non-Fi devices.  As a result, switches between networks break active applications data connections; it is up to the app to reconnect
after a switch occurs.

## 9. The Google Fi SIM does work in other phones

Though devices other than the Nexus 6 are not officially compatible with the Fi service, you can in fact use the Fi SIM card successfully
in other cellular devices.  Using the Fi SIM in another device results in it using the same network as last used on the Fi Nexus 6.  Setting the active profile on the Fi device and then swapping it in allows use of either T-Mobile or Sprint on the non-Fi device.

I haven't found a way of using a non-Fi device to switch profiles, as the Fi dialer codes are not present on other devices.  I *suspect* based
on #2 that it would be possible to send the same message to the SIM to activate the desired profile.  I'm
not sure why Google chose to only support the Nexus 6 at this time; my *guess* would be that whatever optimizations are done to
switch quickly are not compatible with -- or not as effective on -- other devices.

## 10. Global roaming is done only through T-Mobile

Given T-Mobile's pre-exising [unlimited data roaming plans](http://www.t-mobile.com/optional-services/roaming.html), it's not surprising
that Google chose to include similar capabilities in Google Fi.  As you would expect, roaming on Google Fi only works when the T-Mobile
profile is active; if you manually switch to Sprint, the device won't register on the roaming network.

When roaming, the network remained as 'Fi Network', hiding the roaming carrier.  I expected the `FI INFO` code to show the roaming network
operator in addition to the SIM operator (T-Mobile); it displayed 'Unknown Carrier' instead, correctly identifying that it was
roaming, but not indicating which network it was roaming on. Network Info II revealed it was using Rogers when tested in Canada (302:720),
and I was able to get a full LTE connection.

## Wrapping up

Overall, I'm pretty impressed with Google Fi and how well it works.  Some of the more spectacular claims about Fi's capabilities
are incorrect, but that doesn't change the fact that Google has produced a service that works, is easy to use, switches quickly
between networks, and offers Wi-Fi calling for the times when cellular isn't available.  How well the automatic switching
chooses networks is not something I've had time to evaluate, but it's an area that Google is well positioned to innovate in.

Project Fi is certainly the first in a wave of products to disrupt the traditional operator business models, and I will be watching
closely over the years to come to see how it changes and improves over time.

(Thanks to David for reading a draft of this)
