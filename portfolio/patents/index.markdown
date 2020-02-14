---
layout: page
published: true
title: Patents
nav: portfolio
---

I have been fortunate to work on technologies that are new and innovative enough to qualify for patent protection, and
for companies that have be willing to invest in them.  To date, I have been an inventor on 5 patents.

## Method and system for monitoring physical assets

_United States Patent #10212494 – Issued 2019 – Struhsaker, Posner, Landers, Armstrong_<br/>
_[Google Patents](https://patents.google.com/patent/US10212494B1/) |
[USPTO](http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&p=1&u=/netahtml/PTO/srchnum.html&r=1&f=G&l=50&d=PALL&s1=10212494.PN.)
| [CIPO](http://brevets-patents.ic.gc.ca/opic-cipo/cpd/eng/patent/3043924/summary.html)_

**ABSTRACT**: A system for monitoring physical assets in a monitored environment. The system includes monitoring devices
attached to monitored assets, and configured to collect monitoring data from the monitored assets, a first access point,
configured to receive the collected monitoring data from the monitoring devices and to process the collected monitoring
data, an Internet of Things (IoT) link established between each of the monitoring devices and the access point, and an
IoT communication protocol overlay that enables synchronized uplinks from the monitoring devices to the first access
point via the IoT links. The IoT communication protocol overlay governs transmissions of monitoring data by the
monitoring devices to the access point. The system further includes a hub/cloud platform configured to receive the
processed monitoring data from the first access point, perform data analytics on the processed monitoring data; and
provide a user interface that enables a user to monitor the physical assets.

**LAYMAN'S**: This patent described a system that could monitor the physical location of "things" over an IoT wireless
network in a battery-efficient manner, without requiring continuous connectivity to the internet.

## Method and system for monitoring livestock

_United States Patent #10242547 – Issued 2019 – Struhsaker, Posner, Landers, Armstrong_<br/>
_[Google Patents](https://patents.google.com/patent/US10242547B1/) |
[USPTO](http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&p=1&u=/netahtml/PTO/srchnum.html&r=1&f=G&l=50&d=PALL&s1=10242547.PN.)
| [CIPO](http://brevets-patents.ic.gc.ca/opic-cipo/cpd/eng/patent/3043927/summary.html)_

**ABSTRACT**: A system for monitoring livestock in a ranching environment. The system includes tag sensors attached to
animals, and configured to collect monitoring data from the animals, a first access point, configured to receive the
collected monitoring data from the tag sensors and to process the collected monitoring data, an Internet of Things (IoT)
link established between each of the tag sensors and the access point, and an IoT communication protocol overlay that
enables synchronized uplinks from the tag sensors to the first access point via the IoT links. The IoT communication
protocol overlay governs transmissions of monitoring data by the tag sensors to the access point. The system further
includes a hub/cloud platform configured to receive the processed monitoring data from the first access point, perform
data analytics on the processed monitoring data, and provide a user interface that enables a user to monitor the
livestock.

**LAYMAN'S**: This patent described a system that could monitor the physical location of "things" over an IoT wireless
network in a battery-efficient manner, without requiring continuous connectivity to the internet.  In this case, those
"things" were cattle in a ranching environment, where the location data could be processed to generate information on
the animal's health or current whereabouts.

## Encapsulating traffic while preserving packet characteristics

_United States Patent #9769116 – Issued 2017 – Robinson, Schmidtke, Tsui, Armstrong_<br/>
_[Google Patents](https://patents.google.com/patent/US9769116B2/) |
[USPTO](http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&p=1&u=/netahtml/PTO/srchnum.html&r=1&f=G&l=50&d=PALL&s1=9769116.PN.)_

**ABSTRACT**: A method for encapsulating a packet of data from a data flow is described. The packet comprises a flow
network header for identifying a source network address and a target destination network address and a flow transport
network header for identifying a source port and a target destination port. The method comprises the following steps.
The flow network header is replaced with an encapsulation network header for identifying an encapsulation network
address and a decapsulation network address. The decapsulation network address specifies the address of a decapsulation
node. The flow transport header is replaced with an encapsulation transport header for identifying an encapsulation port
and a decapsulation port. The decapsulation port is configured to be the same as the target destination port. A method
for decapsulating the encapsulated packet, as well as network nodes configured to implement the methods, are also
described.

**LAYMAN'S**: This patent describe a technique whereby IP packets could be sent via a tunnel to a destination server,
but by placing the tunnel header at the rear of the packet rather than the front, existing middleboxes (like DPI or
zero-rating functions) could still read and classify the traffic as if it were not tunneled.

## Encapsulation system featuring an intelligent network component

_United States Patent #9838319 – Issued 2017 – Armstrong, Robinson, Schmidtke_<br/>
_[Google Patents](https://patents.google.com/patent/US9838319B2/) |
[USPTO](http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&p=1&u=/netahtml/PTO/srchnum.html&r=1&f=G&l=50&d=PALL&s1=9838319.PN.)_

**ABSTRACT**: A network component is provided for facilitating communication of traffic between a destination server and
a client over a network comprising the plurality of network paths. The network component comprising memory for storing
computer-readable instructions and a processor configured to implement the computer-readable instructions. The
computer-readable instructions operable to implement the following: exchange control parameters with the client via a
control channel using one or more of the plurality of network control paths; encapsulate the traffic for transmission to
the client; decapsulate the traffic received from the client; and schedule traffic to the client via one or more of the
plurality of network paths using logic common with the client based on network parameters. A client configured to work
with the network component is also described, as is a communication system including both the client and network
component.

**LAYMAN'S**: This patent described a system in which the network traffic from a client is sent across a virtual IP
network that is formed from multiple underlying physical IP networks; data scheduled across physical networks according
to policies for throughput, reliability, or other factors by a cooperating client and server.

## Accessing Local Network Resources in a Multi-Interface System

_United States Patent #9860156 – Issued 2013 – Armstrong, Schmidtke, Robinson, Tsui_<br/>
_[Google Patents](https://patents.google.com/patent/US9860156B2/) |
[USPTO](http://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&p=1&u=/netahtml/PTO/srchnum.html&r=1&f=G&l=50&d=PALL&s1=9860156.PN.)
| [CIPO](http://brevets-patents.ic.gc.ca/opic-cipo/cpd/eng/patent/2791523/summary.html)_

**ABSTRACT**: A method is provided for selectively routing data packets on a client device having of plurality of
network interfaces for communicating over a network. The method comprising the following steps. It is determined if the
data packets should be routed to a network server accessible by a corresponding one of the network interfaces to access
local resources offered thereon. If the data packets should be routed to the network server, the data packets are routed
directly to the network server via the corresponding network interface. Otherwise, the data packets are routed via a
default route. A client device configured to implement the method is also provided.

**LAYMAN'S**: This patent described a mechanism for "breaking out" traffic from a virtual private network to allow it to
access resources on the local network, even if that traffic had initially been assigned a source IP address on the VPN
network.

