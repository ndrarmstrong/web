---
layout: post
published: true
title: Sideloading Windows 8 apps with WiX
excerpt:
---

I recently wrote a (modern/metro/windows store) app for one our partners that we wanted to deploy internally for testing
prior to a larger release.  This is known as *sideloading*.  Microsoft's policies for sideloading are, roughly:

  1. Sideloading is allowed for enterprises, but only for domain-joined devices
  2. Sideloading is allowed if you purchase a
     [sideloading product key](http://technet.microsoft.com/en-ca/windows/jj874388.aspx)
  3. Sideloading is allowed for developers

Our devices are not domain-joined and this was not for permanent installation, so we went with option #3.  Microsoft
doesn't make this particularly easy - and [TestFlight](http://testflightapp.com) does not support Windows - so I needed
a way to make it easy for users to install the beta build and install updates throughout the test period.

My normal go-to solution for applications on Windows is [WiX](http://wixtoolset.org), the "Windows Installer XML
Toolkit" - which makes Windows Installers survivable, if not easy.  And we were already using it for the accompanying
Windows Service component, so it made sense to bundle our UI in the same package.

I couldn't find anybody else that had done this successfully -- so here is my solution.


## Overview

At a high level, the things we need to do are:

  1. Build an `.appx` package
  2. Copy the package to the target device
  3. Make sure the target device has an active developer license
  4. Install the package
  5. Handle upgrades/uninstalls/rollbacks
  6. (optional) Local loopback

Follow along with [my example project on GitHub](https://github.com/ndrarmstrong/blog/tree/master/SideloadWithWiX).

You will need the [WiX toolset](http://wixtoolset.org) installed to open the setup project.


## Build an APPX package

We're going to start off with a Windows Store application and a WiX setup project in the same solution.  This allows us
to automatically build the latest version of the application setup easily when we are developing (and keeps all of the
code together if you want to build automatically from your sources).

Here, I've used the built-in templates for a Windows 8.1 application, and a WiX setup project.  I've also split the
configurable parts of the `.wxs` file into a `.wxi` file for easier updating.

![Solution setup]({{ site.baseurl }}/assets/posts/2014-08-26/solution.png)

Windows bundles apps into APPX packages.  These packages contain all the code and associated information needed to
install the app into the modern environment, display the app's tile, and grant access based on the requested
permissions.  Visual Studio will build this package on demand through the 'Create App Packages' wizard - but we want to
do this automatically on every build so our setup can include it.

Visual Studio builds its packages the way it does regular builds - by calling `msbuild` with the project file.  It also
sets a special flag `GenerateAppxPackageOnBuild` that the app build targets use to decide whether to package the app or
stop at the loose files.  By setting this flag for all builds in the project file, we can ensure the app is always
packaged.

Open the app's `.csprj` file in a text editor and add the following PropertyGroup:

{% highlight xml %}
<PropertyGroup>
    <!-- Always build a Appx package -->
    <GenerateAppxPackageOnBuild>True</GenerateAppxPackageOnBuild>
    <!-- Put it where setup can find it -->
    <AppxPackageDir>$(OutputPath)AppPackages</AppxPackageDir>
    <!-- Change the name so that it doesn't change per-build -->
    <AppxPackageName>$(AssemblyName)</AppxPackageName>
</PropertyGroup>
{% endhighlight %}

Now when you build the app in Visual Studio, you should see an `AppPackages` folder in the output directory containing
the package files.  This folder can be copied manually to another computer and the included `Add-AppDevPackage.ps1`
script run to install the app.  This is precisely what we'll be doing with our installer.

![Appx package]({{ site.baseurl }}/assets/posts/2014-08-26/package.png)


## Copy the package to the device

Next, we want to bundle the APPX package into our installer.  Our installer will copy this package on to the target
device, where we can use the bundled script to do install it.

WiX has a number of different ways for specifying which files to copy, but the easiest way for us is to use the
[HarvestDirectory task](http://wixtoolset.org/documentation/manual/v3/msbuild/target_reference/harvestdirectory.html)
to copy the whole package directory without specifying each file individually.

This is specified in the setup project's `.wixproj` file, so open that in a text editor and add the following:

{% highlight xml %}
<PropertyGroup>
    <!-- Configuration for app harvesting -->
    <AppxDir>..\SideloadWithWiX\bin\$(Configuration)\AppPackages\SideloadWithWiX_Test\</AppxDir>
    <DefineConstants>$(DefineConstants);AppxDir=$(AppxDir)</DefineConstants>
</PropertyGroup>
{% endhighlight %}

{% highlight xml %}
<ItemGroup>
    <!-- Harvest app package -->
    <HarvestDirectory Include="$(AppxDir)">
        <InProject>false</InProject>
        <DirectoryRefId>INSTALLFOLDER</DirectoryRefId>
        <ComponentGroupName>ComponentGroup.App</ComponentGroupName>
        <PreprocessorVariable>var.AppxDir</PreprocessorVariable>
    </HarvestDirectory>
</ItemGroup>
{% endhighlight %}

You should also make sure that the setup project references your app project, and any WiX libraries used (e.g.
WixUtilExtension, WixUIExtension).

What these snippets of code do is instruct WiX to copy all of the package files into the INSTALLFOLDER; we assign the
component name `ComponentGroup.App` to our package so that we can refer to it in our `.wxs` file.

All that's left to do is tell WiX that it's part of our default feature:

{% highlight xml %}
<Feature Id="ProductFeature" Title="SideloadWithWiXSetup" Level="1">
	<ComponentGroupRef Id="ComponentGroup.App" />
</Feature>
{% endhighlight %}


## Get a developer license

Now that we've got the installer successfully copying the app onto the target device, it's time to turn our focus to
the install process for a developer-licensed app.  The Visual Studio-provided `Add-AppxDevPackage.ps1` describes the
process thusly:

{% highlight powershell %}
# Add-AppxDevPackage.ps1 is a PowerShell script designed to install app
# packages created by Visual Studio for developers.
#
# This script simplifies installing these packages by automating the
# following functions:
#   1. Find the app package and signing certificate in the script directory
#   2. Prompt the user to acquire a developer license and to install the
#      certificate if necessary
#   3. Find dependency packages that are applicable to the operating system's
#      CPU architecture
#   4. Install the package along with all applicable dependencies
{% endhighlight %}

For our purposes, we want to tweak the process a bit:

  1. Prompt the user to acquire a developer license
  2. Install the certificate *(as administrator)*
  3. Install the package and dependencies *(as user)*

I created a script -- `Check-WindowsDeveloperLicense.ps1` -- that you can get [from the accompanying source
code](https://github.com/ndrarmstrong/blog/blob/master/SideloadWithWiX/SideloadWithWiXSetup/Check-WindowsDeveloperLicense.ps1)
to handle step 1.  All we have to do is update our WiX install it to copy it to install directory, and invoke it with
PowerShell.

First, add a component group to copy the scripts to the install directory:

{% highlight xml %}
<ComponentGroup Id="ComponentGroup.PowerShellScripts" Directory="INSTALLFOLDER">
    <Component Id="Component.CheckWindowsDeveloperLicense">
        <File Id="File.CheckWindowsDeveloperLicense" Source="$(var.CheckLicensePs)"/>
    </Component>
</ComponentGroup>
{% endhighlight %}

Add the component to our feature table:

{% highlight xml %}
<Feature Id="ProductFeature" Title="SideloadWithWiXSetup" Level="1">
    <ComponentGroupRef Id="ComponentGroup.App" />
    <ComponentGroupRef Id="ComponentGroup.PowerShellScripts" />
</Feature>
{% endhighlight %}

Then, use a property to locate PowerShell on the system:

{% highlight xml %}
<Property Id="POWERSHELLEXE">
    <RegistrySearch Id="POWERSHELLEXE"
                    Type="raw"
                    Root="HKLM"
                    Key="SOFTWARE\Microsoft\PowerShell\1\ShellIds\Microsoft.PowerShell"
                    Name="Path" />
</Property>
<Condition Message="Unable to locate PowerShell. PowerShell is required to install this application.">
    <![CDATA[Installed OR POWERSHELLEXE ]]>
</Condition>
{% endhighlight %}

We need two custom actions to run our script: the first to set the command line, and the second to run it.

{% highlight xml %}
<CustomAction
    Id="CustomAction.CheckWindowsDeveloperLicense_Cmd"
    Property="CustomAction.CheckWindowsDeveloperLicense"
    Value="&quot;[POWERSHELLEXE]&quot; $(var.PowerShellFlags) -File &quot;[#File.CheckWindowsDeveloperLicense]&quot;" />
<CustomAction
    Id="CustomAction.CheckWindowsDeveloperLicense"
    BinaryKey="WixCA"
    DllEntry="CAQuietExec"
    Execute="deferred"
    Return="check"
    Impersonate="no" />
{% endhighlight %}

We also need to use the following flags when calling PowerShell. In particular, `-ExcecutionPolicy Bypass` is necessary
as Windows does not allow execution of PowerShell scripts by default.  By using the flag, we don't need to change
the machine policy but can still run our script.

{% highlight xml %}
<?define PowerShellFlags = "-NoProfile -NonInteractive -InputFormat None -ExecutionPolicy Bypass" ?>
{% endhighlight %}

Finally, we schedule the check as part of the install sequence:

{% highlight xml %}
<InstallExecuteSequence>
    <Custom Action="CustomAction.CheckWindowsDeveloperLicense_Cmd"
            After="InstallFiles">
        NOT Installed
    </Custom>
    <Custom Action="CustomAction.CheckWindowsDeveloperLicense"
            After="CustomAction.CheckWindowsDeveloperLicense_Cmd">
        NOT Installed
    </Custom>
</InstallExecuteSequence>
{% endhighlight %}


## Install the app

Now that we've got everything copied to the target device, it's time to do the actual installation.  Looking at
the previous list, there are two steps remaining to install the app:

<ol>
    <li><s>Prompt the user to acquire a developer license</s></li>
    <li>Install the certificate <em>(as administrator)</em></li>
    <li>Install the package and dependencies <em>(as user)</em></li>
</ol>

WiX gives us the ability when running custom actions to specify whether they will they will run in the LocalSystem
context or in the user's context.  We'll need to run each of the above steps in a different context, as the app itself
must be installed as the user, while the development certificate must be installed as system.  Both steps are
handled by `Add-AppxDevPackage.ps1`, so we'll need to call it twice.

This leads us to four additional custom actions:

{% highlight xml %}
<!-- Install cert as admin -->
    <CustomAction
    Id="CustomAction.InstallCertificateCmd"
    Property="CustomAction.InstallCertificate"
    Value="&quot;[POWERSHELLEXE]&quot; $(var.PowerShellFlags) -File &quot;[INSTALLFOLDER]$(var.AppxInstallPath)\$(var.AddAppDevPackage)&quot; -force -CertificatePath &quot;[INSTALLFOLDER]$(var.AppxInstallPath)\$(var.AppxCertPath)&quot;" />
<CustomAction
    Id="CustomAction.InstallCertificate"
    BinaryKey="WixCA"
    DllEntry="CAQuietExec"
    Execute="deferred"
    Return="check"
    Impersonate="no" />

<!-- Install app as user -->
<CustomAction
    Id="CustomAction.InstallAppxCmd"
    Property="CustomAction.InstallAppx"
    Value="&quot;[POWERSHELLEXE]&quot; $(var.PowerShellFlags) -File &quot;[INSTALLFOLDER]$(var.AppxInstallPath)\$(var.AddAppDevPackage)&quot; -force" />
<CustomAction
    Id="CustomAction.InstallAppx"
    BinaryKey="WixCA"
    DllEntry="CAQuietExec"
    Execute="deferred"
    Return="check"
    Impersonate="yes" />
{% endhighlight %}

These actions depend on a few additional defines:

{% highlight xml %}
<?define AddAppDevPackage = "Add-AppDevPackage.ps1" ?>
<?define AppxInstallPath = "SideloadWithWiX_Test" ?>
<?define AppxCertPath = "SideloadWithWiX.cer" ?>
{% endhighlight %}

When run by a user, `Add-AppxDevPackage.ps1` first to see what operations it needs to do (get license, install
certificate, install app), then elevates itself (if not already elevated) listing the elevated tasks, and then finishes
by installing the app.  The internal behaviour of this script is undocumented and may change in future versions, but for
now we can nudge it to do what we want.

When launched elevated, the script looks for a list of operations should perform, as arguments:

  * **-GetDeveloperLicense**: Show the developer license dialog
  * **-CertificatePath**: The path to the certificate to install

When passed, these arguments skip most of the internal validation checks - which works in our favour.  By launching
the script elevated with -CertificatePath, it will install *just* the certificate.  So that is precisely what our
first custom action -- `CustomAction.InstallCertificate` -- does.

We then call the script again, this time without arguments as both the developer license and certificate are installed.
This is our `CustomAction.InstallAppx` action.  Note how `Impersonate` is set to `yes` to make this action run as the
user.

Finally, we finish the installer by adding the actions to our install sequence, which now looks like:

{% highlight xml %}
<InstallExecuteSequence>
    <Custom Action="CustomAction.CheckWindowsDeveloperLicense_Cmd"
            After="InstallFiles">
        NOT Installed
    </Custom>
    <Custom Action="CustomAction.CheckWindowsDeveloperLicense"
            After="CustomAction.CheckWindowsDeveloperLicense_Cmd">
        NOT Installed
    </Custom>
    <Custom Action="CustomAction.InstallCertificate_Cmd"
            After="CustomAction.CheckWindowsDeveloperLicense">
        NOT Installed
    </Custom>
    <Custom Action="CustomAction.InstallCertificate"
            After="CustomAction.InstallCertificate_Cmd">
        NOT Installed
    </Custom>
    <Custom Action="CustomAction.InstallAppx_Cmd"
            After="CustomAction.InstallCertificate">
        NOT Installed
    </Custom>
    <Custom Action="CustomAction.InstallAppx"
            After="CustomAction.InstallAppx_Cmd">
        NOT Installed
    </Custom>
</InstallExecuteSequence>
{% endhighlight %}


## Uninstalling

We now have a working installer that sideloads our Windows app - but it has one fatal flaw.  If you try to uninstall our
app, all the files we installed will be removed but *not the app itself*.  The built-in actions in WiX handle most of
the clean-up tasks automatically, but since we are using custom actions to install the app, we need to add  custom
actions to remove the app as well.

Removing the app is perhaps the trickiest part, as our app package doesn't include a script for removing an app like it
does for installing one.  We have to rely on PowerShell's built-in
[Remove-AppxPackage](http://technet.microsoft.com/en-us/library/hh856038.aspx) function, which frustratingly uses the
*full* package name of the app.

I've put together my own removal script -- `Remove-AppPackage.ps1` -- which is [available in the accompanying
source code](https://github.com/ndrarmstrong/blog/blob/master/SideloadWithWiX/SideloadWithWiXSetup/Remove-AppPackage.ps1).
It also takes the (short) package name of the app and searches the installed apps for a match,
then uses the full name as-installed on the device to do the removal.

Like the license check script, we need to copy it to the target device and call it with PowerShell:

{% highlight xml %}
<?define RemoveAppPackagePs = "Remove-AppPackage.ps1" ?>
<?define AppxPackageName = "SideloadWithWiX" ?>
{% endhighlight %}

{% highlight xml %}
<Component Id="Component.RemoveAppPackage">
    <File Id="File.RemoveAppPackage" Source="$(var.RemoveAppPackagePs)"/>
</Component>
{% endhighlight %}

{% highlight xml %}
<CustomAction
    Id="CustomAction.RemoveAppx_Cmd"
    Property="CustomAction.RemoveAppx"
    Value="&quot;[POWERSHELLEXE]&quot; $(var.PowerShellFlags) -File &quot;[#File.RemoveAppPackage]&quot; &quot;$(var.AppxPackageName)&quot;" />
<CustomAction
    Id="CustomAction.RemoveAppx"
    BinaryKey="WixCA"
    DllEntry="CAQuietExec"
    Execute="deferred"
    Return="check"
    Impersonate="yes" />
{% endhighlight %}

And update our install sequence to remove on uninstall.  Note that the `RemoveFiles` action occurs before
`InstallFiles`, so I usually put the remove actions before the install actions.  The exact sequence of actions is
[available on MSDN](http://msdn.microsoft.com/en-us/library/aa372038.aspx).

{% highlight xml %}
<InstallExecuteSequence>
    <Custom Action="CustomAction.RemoveAppx_Cmd"
            Before="RemoveFiles">
        Installed
    </Custom>
    <Custom Action="CustomAction.RemoveAppx"
            After="CustomAction.RemoveAppx_Cmd">
        Installed
    </Custom>
    ...
</InstallExecuteSequence>
{% endhighlight %}

By setting the custom action condition to `Installed`, the installer will also handle upgrades.  On an upgrade, the
previous package is removed and then the new package installed.

## Extra Credit

For simplicity, I've ignored a couple things you may want to consider when developing your own apps:

* **Updates**: This version updates by removing the old app before installing the new one.  As long as the version number
  increases between versions, Windows will also let you do in-place upgrades.  This means separate custom actions for
  upgrades and uninstalls.
* **Rollbacks**: If the install fails for any reason, Windows Installer will execute rollback executed actions from
  the current point.  The actions built into WiX write into the rollback list so that the system is cleaned up on
  failure.  Our custom actions for the app install should do likewise, so that failed installs remove any installed
  apps and restore any removed ones.
* **Progress text**: WiX supports [ProgressText](http://wixtoolset.org/documentation/manual/v3/xsd/wix/progresstext.html)
  elements that allow the default installer UI to show which actions it is executing.  This is highly recommended, as
  executing the PowerShell scripts can take some time.
* **Enterprise install**: Theoretically this process will work for enterprise-sideloaded apps as well, at which point
  you don't need to worry about getting a developer license.  You may have to obtain a sideload license instead.

## Limitations

Installing Windows apps with WiX is not a perfect solution, and has a few limitations to be aware of:

* **Licensing**: If you are using developer builds, users must log into their Microsoft Account to obtain a developer
  license.  These are currently available at no cost, but last only 30 days.  After 30 days, users must either
  re-install the app (to trigger a new license request), or run the
  [Show-WindowsDeveloperLicenseRegistration](http://technet.microsoft.com/en-us/library/jj657535.aspx) from an elevated
  PowerShell window.
* **Multiple users**: Currently, sideloading a developer app on a target device can only be done for a single user;
  installation will fail for subsequent users.  This can be resolved by deploying your app to the Windows Store.


## Done!

There you go - sideloading (modern/metro/windows store) apps is possible with WiX, though it takes some care.

See the [source code](https://github.com/ndrarmstrong/blog/tree/master/SideloadWithWiX) accompanying this post for my complete
solution with all of the source files described here.

[Sideload With WiX](https://github.com/ndrarmstrong/blog/tree/master/SideloadWithWiX) [source code]
