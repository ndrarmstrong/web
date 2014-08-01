---
layout: post
published: true
title: ! 'Sending Email with PowerShell: Implicit and Explicit SSL'
---

I never quite understood the attraction of scripting; sure, not having to set up the scaffolding code of a more formal language is nice, but the limitations of the environment just seemed too great. The Unix community has it far better than the Windows community in this regard; shell scripting can accomplish amazing feats -- as long as all of the appropriate utilities are strung together in the right configuration, that is. And though scripting languages like Python and Ruby do hold some allure, it's one more thing to install on my Windows box and learn the syntax for. So for most tasks that needed scripting, C# filled the bill -- when I could justify the start-up cost.

Enter PowerShell, the Windows scripting language that purportedly brings together the power of Unix shell scripts with the flexibility of the .NET framework. And it's installed by default on Windows 7, to boot. I'd seen an interesting demo of how WPF and PowerShell worked together, so when I recently found the need to send a bunch of mark reports out, I figured it was time to give it a whirl. There were a couple of tricky problems I encountered while I was throwing the script together; here's a quick overview of sending email with PowerShell.

## The Basics

First, we need an email to send. This should do:

{% highlight powershell %}
# Mail Message
$from = "user@domain.com"
$to = "user@domain.com"
$subject = "Hello from PowerShell"
$body = "This is a message saying hello from PowerShell."
$hasAttachment = $false
$attachmentPath = "attachmentPath.txt"
{% endhighlight %}

The primary requirement for sending email is access to an SMTP server; it needn't be on the local machine. We'll use Gmail's SMTP server:

{% highlight powershell %}
# Mail Server Settings
$server = "smtp.gmail.com"
$serverPort = 587
$timeout = 30000          # timeout in milliseconds
$enableSSL = $true
$implicitSSL = $false
{% endhighlight %}

Pretty basic stuff; here we're using smtp.gmail.com on port 587, and we're using an SSL-encrypted connection. We're also *not* using implicit SSL, and instead using explicit SSL; wait, **what's the difference?**

#### Explicit SSL

Explicit SSL, as described <a title="Explicit versus implict SSL" href="http://help.globalscape.com/help/secureserver2/Explicit_versus_implicit_SS.htm">here</a>, means that the client first connects to the server using an unsecure channel, requests that conversations be moved to a secure channel, and then both server and client switch to a secure connection and the rest of the communication is encrypted. Though this sounds somewhat lengthy, it's the standard procedure for setting up an SSL connection (see <a title="FTP Security Extensions" href="http://www.ietf.org/rfc/rfc2228.txt">RFC 2228</a>). Gmail handles explicit SSL without any difficulties, as do many other mail servers; Gmail's explicit SSL server runs on port 587.

#### Implicit SSL

In contrast, implicit SSL drops the SSL negotiation and jumps right into the SSL connection to begin with. Often, this is done through a connection to a specific port that only accepts secure connections. There is no official standard for this mode of communication, though it's widely implemented; Gmail also handles implicit SSL, this time on port 465.

## The Catch

My local university SMTP server *only* handles implicit SSL, so I needed to find a way to work with this variant. Unfortunately, the standard .NET library for sending mail, System.Net.Mail -- the one often used from PowerShell to send mail -- don't support implicit SSL. Luckily, System.Web.Mail -- an older, now obsolete mail sending library residing in System.Web.dll -- does support implicit SSL.

## Putting it all Together

Now that we've got a strategy for handling implicit and explicit SSL, let's code up a section of our script to handle each of these servers so we can switch back and forth easily.

We're also going to need a set of credentials if we're logging into a secure server; the <a title="Get-Credential" href="http://technet.microsoft.com/en-us/library/dd315327.aspx">Get-Credential</a> cmdlet is just the ticket:

{% highlight powershell %}
# Get user credentials if required
if ($enableSSL)
{
    $credentials = [Net.NetworkCredential](Get-Credential)
}
{% endhighlight %}

We could also prompt at the command line for a username/password combo or just hardcode these values into the script, but the Get-Credential cmdlet is an easy way to get and store just the information we need.

### Explicit SSL with System.Net.Mail

We'll be using the <a title="System.Net.Mail Namespace" href="http://msdn.microsoft.com/en-us/library/system.net.mail.aspx">System.Net.Mail</a> namespace to send email to servers using explicit SSL, or to servers that do not require SSL connections.

{% highlight powershell %}
if (!$enableSSL -or !$implicitSSL)
{
    # Set up server connection
    $smtpClient = New-Object System.Net.Mail.SmtpClient $server, $serverPort
    $smtpClient.EnableSsl = $enableSSL
    $smtpClient.Timeout = $timeout

    if ($enableSSL)
    {
        $smtpClient.UseDefaultCredentials = $false;
        $smtpClient.Credentials = $credentials
    }

    # Create mail message
    $message = New-Object System.Net.Mail.MailMessage $from, $to, $subject, $body

    if ($hasAttachment)
    {
        $attachment = New-Object System.Net.Mail.Attachment $attachmentPath
        $message.Attachments.Add($attachment)
    }

    # Send the message
    Write-Output "Sending email to $to..."
    try
    {
        $smtpClient.Send($message)
        Write-Output "Message sent."
    }
    catch
    {
        Write-Error $_
        Write-Output "Message send failed."
    }

}
{% endhighlight %}

Using System.Net.Mail is pretty straightforward -- we create an <a title="SmtpClient Class (System.Net.Mail)" href="http://msdn.microsoft.com/en-us/library/system.net.mail.smtpclient.aspx">SmtpClient</a> to connect to the mail server with, and make the appropriate settings. Setting Timeout isn't necessary, but since the default is really high (something like 100,000 milliseconds) and most servers respond quickly, setting it to 30 seconds ensures that the script will fail in reasonably short order if it cannot connect.

Creating a message is easy too -- we just create a new <a title="MailMessage Class (System.Net.Mail)" href="http://msdn.microsoft.com/en-us/library/system.net.mail.mailmessage.aspx">MailMessage</a> and pass in our message to its constructor and attach any necessary files. Then we call the Send function on the SmtpClient we created, and the message goes on its merry way.

Users of PowerShell version 2 or greater can also make use of the <a title="Send-MailMessage" href="http://technet.microsoft.com/en-us/library/dd347693.aspx">Send-MailMessage</a> cmdlet, which wraps System.Net.Mail in an easy-to-use cmdlet.

### Implicit SSL with System.Web.Mail

For servers that only support Implicit SSL, we'll be using the <a title="System.Web.Mail Namespace" href="http://msdn.microsoft.com/en-us/library/system.web.mail.aspx">System.Web.Mail</a> namespace. This namespace has been made obsolete in favour of the newer System.Net.Mail namespace, but at the current time it's still included in the .NET Framework and so we can take advantage of it here.

{% highlight powershell %}
else
{
    # Load System.Web assembly
    [System.Reflection.Assembly]::LoadWithPartialName("System.Web") > $null

    # Create a new mail with the appropriate server settigns
    $mail = New-Object System.Web.Mail.MailMessage
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/smtpserver", $server)
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/smtpserverport", $serverPort)
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/smtpusessl", $true)
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/sendusername", $credentials.UserName)
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/sendpassword", $credentials.Password)
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/smtpconnectiontimeout", $timeout / 1000)
    # Use network SMTP server...
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/sendusing", 2)
    # ... and basic authentication
    $mail.Fields.Add("http://schemas.microsoft.com/cdo/configuration/smtpauthenticate", 1)

    # Set up the mail message fields
    $mail.From = $from
    $mail.To = $to
    $mail.Subject = $subject
    $mail.Body = $body

    if ($hasAttachment)
    {
        # Convert to full path and attach file to message
        $attachmentPath = (get-item $attachmentPath).FullName
        $attachment = New-Object System.Web.Mail.MailAttachment $attachmentPath
        $mail.Attachments.Add($attachment) > $null
    }

    # Send the message
    Write-Output "Sending email to $to..."
    try
    {
        [System.Web.Mail.SmtpMail]::Send($mail)
        Write-Output "Message sent."
    }
    catch
    {
        Write-Error $_
        Write-Output "Message send failed."
    }
}
{% endhighlight %}

As we can see, using System.Web.Mail is quite a bit more convoluted. First up is loading the System.Web DLL, which is where this namespace resides. Then, we configure the mail client using <a title="Overview of CDO" href="http://msdn.microsoft.com/en-us/library/aa140862%28office.10%29.aspx">CDO</a> fields; most of them have pretty obvious settings, though *sendusing* and *smtpauthenticate* are a little obtuse (see the comments in the script for what each value means). Unlike System.Net.Mail, these server settings are made on the <a title="MailMessage Class (System.Web.Mail)" href="http://msdn.microsoft.com/en-us/library/system.web.mail.mailmessage.aspx">MailMessage</a> class itself, which is also where we set the message properties and add any necessary attachments. Finally, we send the mail using the <a title="SmtpMail.Send Method (System.Web.Mail)" href="http://msdn.microsoft.com/en-us/library/system.web.mail.smtpmail.send.aspx">Send</a> static function on <a title="SmtpMail Class (System.Web.Mail)" href="http://msdn.microsoft.com/en-us/library/system.web.mail.smtpmail.aspx">SmtpMail</a>, and the message goes on its merry way just as before

### A Final Note for Gmail Users

Gmail's authentication settings are a bit strange; in my testing, I've found that you need to enter *just* your username (*not* username@gmail.com) in order to authenticate with their SMTP servers. This causes a bit of a problem with Google Apps installations, which also use smtp.gmail.com as their SMTP gateway; username@domain does not work, and I've yet to find a workaround.

Also, while Gmail supports explicit and implicit SSL, it does so on different ports -- 587 and 465, respectively.

## Sending Email with PowerShell -- Piece of Cake!

After a bit of hacking, I now understand just what those scripting folks feel when the advocate for scripting environments -- it really is quite easy to accomplish what you need to accomplish without a whole lot of code. And even though I needed to drop into the .NET framework to get classes to deal with explicit and implicit SMTP servers, that was hardly a problem -- those classes integrated with the rest of my PowerShell script seamlessly. PowerShell is certainly a very powerful environment, and I'm glad to add it to my technical bag of tricks.

[PowerShell Email Script](https://github.com/ndrarmstrong/blog/blob/master/PowerShellEmail/PowerShellEmail.ps1) [ps1]
