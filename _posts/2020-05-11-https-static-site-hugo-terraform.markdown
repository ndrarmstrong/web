---
layout: post
published: true
title: HTTPS static site with Hugo and Terraform
excerpt: Using Hugo to generate a fast static website that can be hosted on Amazon S3/CloudFront; and using Terraform
         to configure all of the Amazon infrastructure.
---

We've known for over a decade that faster websites are better -- users respond better to sites that load quickly (both
[Cloudflare](https://www.cloudflare.com/learning/performance/why-site-speed-matters/) and
[Mozilla](https://moz.com/learn/seo/page-speed) have good overviews on why).  Yet all too often I find myself using
websites that are frustratingly slow.  Having a fast website can be _easier_ than having a slow one -- you don't need
layered caches, premium DNS, a tuned Wordpress install, a fast database, or an expensive web host... you just need a
static site.

By static, I mean a site that is pre-rendered -- where every user is served the same content.  You can still personalize
the site with client-side JavaScript, and deploy updates hundreds of times per day; we just want the web server to have
almost no work to do when a user visits your site.  That way, your users see your site immediately, instead of waiting
while your server renders the site.

Some commercial web hosts will help you build static sites -- but for the price, you can't beat a handful of open-source
tools and Amazon's web services.  This website -- a fast static site like the one described below -- costs about
$0.15/month to host, which is hard to beat.

## Get the source code

You can see a complete working example of this entire stack in my
[hugo-terraform-aws repository on GitHub](https://github.com/ndrarmstrong/hugo-terraform-aws).

I will be covering the design and functional elements here so that you have a good understanding of how everything fits
together.  If you're already comfortable working with Terraform and Hugo, it's much faster to simply change
the variables mentioned [in the README](https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/README.md) and deploy.

## Motivation

You'll find many good tutorials for creating static websites, and for the tools you can use to create them.  As of early
2020, I couldn't find a single source that did everything I wanted -- which meant pulling bits from a lot different
sources. Some of the limitations I encountered were --

* No Terraform state store
* Broken redirects when using S3 origin for CloudFront
* Missing public bucket policies, or do not disable the public access block
* Not using Hugo's new deployment features
* No HTTPS, or certificate in wrong region
* No logs for buckets and distributions
* Old Terraform syntax
* Put credentials in Terraform vars, rather than `aws configure`
* Requiring Route53 for DNS

My goal is to show you what we did when building the static site for [DexManus](https://dexmanus.com) (a startup
I am advising), which avoided the issues above and resulted in a website that is fast, secure, and easy to update.

## Overview

Working backward from end user to site editing, the components I use are --

* **AWS CloudFront** to deliver the website to end users from hundreds of locations around the globe. Putting the
  site close to the user (from a network perspective) minimizes connection times.
* **AWS S3** to host the website files.  CloudFront updates its cache of the site from the files hosted in S3 -- you
  don't upload to CloudFront directly.
* **Terraform** to deploy and configure all of the AWS infrastructure.
* **Hugo** is a static site generator that allows me to write content in Markdown (text files), and combine them
  with my site template to get static HTML.


## Setting up static site infrastructure with Terraform

The first step in creating our static site is setting up the hosting infrastructure.  This diagram shows everything
we will need to set up:

![Static site infrastructure]({{ site.baseurl }}/assets/posts/2020-05-11/Hugo-Terraform-Diagram.svg){: .width90}

While we could set up everything manually using the AWS console, that's a lot of steps to get right -- and there won't
be any record of what we did.  Using Terraform allows us to specify all of the settings we care about in one place,
regardless of AWS service, and source control them along with our site files.

### Terraform IAM user

Before we start using Terraform, we'll need an AWS user for it to run as. This user will need to have sufficient
permissions to create the AWS infrastructure mentioned above.  I used a user that had full control of S3 and CloudFront,
and limited ACM/IAM permissions (you may want to be more selective):

```
s3:*
cloudfront:*
acm:DescribeCertificate
acm:ExportCertificate
acm:GetCertificate
acm:ListCertificates
acm:ListTagsForCertificate
acm:RequestCertificate
iam:AttachUserPolicy
iam:CreateAccessKey
iam:CreatePolicy
iam:CreateUser
iam:GetPolicy
iam:GetUser
iam:GetUserPolicy
iam:ListAccessKeys
iam:ListPolicies
iam:ListUsers
iam:ListUserPolicies
iam:ListUserTags
iam:PutUserPolicy
```          

If you don't already have a suitable user,
[create one in the AWS console](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)
(make sure _Programmatic Access_ is selected for access type).  We'll create another user for publishing later, using
Terraform.

Log in with your infrastructure user before continuing; set the AWS Access Key ID and Secret Access Key, and leave the
defaults as-is:

```console
$ aws configure
```

### Terraform state bucket (optional)

Terraform maintains a state store with metadata about the infrastructure you manage with it
([more details here](https://www.terraform.io/docs/state/purpose.html)). Strictly speaking, if you're the only one
managing the infrastructure you can use the on-disk state file Terraform will create by default, but if you are working
as part of a team -- or want to keep the store in a more reliable place -- you can use S3 as a remote state store.

To create a bucket for a state store with Terraform itself, create a configuration like the following in separate
directory:

```terraform
provider "aws" {
  region  = "ca-central-1"
}

resource "aws_s3_bucket" "tf_state" {
  bucket = "static-site-state-bucket-name"
  # Enable versioning so we can see the full revision history of our state files
  versioning {
    enabled = true
  }

  # Enable server-side encryption
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

See the [infra/state](https://github.com/ndrarmstrong/hugo-terraform-aws/tree/master/infra/state) directory for a
slightly expanded example that makes use of a `variables.tf` file -- variables allow you to change the configuration to
suit your needs from a single place.

We're ready to create the state bucket -- initialize Terraform, review what it will do, and apply it.  Terraform
will let you know once the new bucket is created:

```console
$ terraform init
$ terraform apply
...
aws_s3_bucket.tf_state: Creating...
aws_s3_bucket.tf_state: Creation complete after 4s [id=example-static-site-state]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

s3_backend_bucket = example-static-site-state
s3_backend_key = global/s3/terraform.tfstate
s3_backend_region = ca-central-1
```

Now that you have a state bucket, switch back to your site infrastructure directory
([infra/site](https://github.com/ndrarmstrong/hugo-terraform-aws/tree/master/infra/site) in the example) and add an S3
backend to your `terraform.tf` configuration, with the name and region of the bucket you just created.

```terraform
terraform {
  backend "s3" {
    # Replace with your state bucket name and region
    bucket = "example-static-site-state"
    region = "ca-central-1"
    key    = "global/s3/terraform.tfstate"
  }
}
```

Future Terraform operations in this directory will use the S3 bucket for state rather than storing state locally.

<div class="tip"><strong>TIP:</strong> Terraform can also lock the infrastructure to prevent multiple users from making simultaneous changes. <a href="https://blog.gruntwork.io/how-to-manage-terraform-state-28f5697e68fa">This post</a>
contains the necessary DynamoDB setup if you want that.</div>

### S3 buckets

The first part of the infrastructure to set up is the S3 buckets -- most of the other services depend on these.
We need three buckets to host our website --

1. **Site:** the main site bucket; it is used to store and serve the static site files (public)
2. **Site (www):** we use this one to redirect from `www.{static-site}` to `{static-site}`, in case a user types
   `www.` before our domain name (public)
3. **Logs:** store logs from S3 and CloudFront (private)

Strictly speaking, you don't need a `www` redirect. You could also swap the first two buckets so that your site is
always accessed with a `www.` prefix.

<div class="tip"><strong>TIP:</strong> All three buckets are defined in
<a href="https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/s3.tf">infra/site/s3.tf</a>
in the source code.</div>

The logs bucket is the easiest to create -- we simply need a bucket with the `logs-delivery-write` ACL.  We'll also
make sure it doesn't accidentally become public in the future by applying a public access block:

```terraform
## Bucket
resource "aws_s3_bucket" "site-logs" {
  bucket = "example-static-site-logs"
  acl = "log-delivery-write"
}

## Disable bucket public access
resource "aws_s3_bucket_public_access_block" "site-logs" {
  bucket = aws_s3_bucket.site-logs.id
  block_public_acls   = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
```

The site bucket has a few more settings --

1. **Public access:** a public ACL and permissive policy, plus disabling the public access block
2. **Static website hosting:** index and error documents
3. **Logging:** to the bucket we previously created

Using Terraform, that looks like the following:

```terraform
## Bucket
resource "aws_s3_bucket" "site-bucket" {
  bucket = var.domain_name
  acl    = "public-read"

  website {
    index_document = "index.html"
    error_document = "404.html"
  }

  logging {
    target_bucket = aws_s3_bucket.site-logs.bucket
    target_prefix = "${var.domain_name}/s3/root"
  }
}

## Bucket public access
resource "aws_s3_bucket_public_access_block" "site-bucket" {
  bucket = aws_s3_bucket.site-bucket.id
}

## Bucket policy
data "template_file" "site-bucket-policy" {
  template = "${file("bucket_policy.json")}"
  vars = {
    bucket = aws_s3_bucket.site-bucket.id
  }
}
resource "aws_s3_bucket_policy" "site-bucket" {
  bucket = aws_s3_bucket.site-bucket.id
  policy = data.template_file.site-bucket-policy.rendered
}
```

Since both the site and www buckets will need the same public access policy, I've used Terraform's template support
to extract the policy document into its own file,
[public_bucket_policy.json](https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/public_bucket_policy.json).
That contains a parameterized version of the policy given in the
[AWS static website guide](https://docs.aws.amazon.com/AmazonS3/latest/dev/HostingWebsiteOnS3Setup.html):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::${bucket}/*"
            ]
        }
    ]
}
```

The www bucket is almost identical to the site bucket, with the index/error documents exchanged for a redirect to our
primary domain name (without `www.`).  I've suppressed the other resources for clarity; see the
[full version in the source code](https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/s3.tf).

```terraform
## Bucket
resource "aws_s3_bucket" "www-site-bucket" {
  bucket = "www.${var.domain_name}"
  acl    = "public-read"

  website {
    redirect_all_requests_to = var.domain_name
  }

  logging {
    target_bucket = aws_s3_bucket.site-logs.bucket
    target_prefix = "${var.domain_name}/s3/www"
  }
}
```

### HTTPS certificate

Next up is a HTTPS certificate for our website.  Public certificates issued through AWS Certificate Manager are free; as
a bonus, ACM integrates directly with CloudFront and manages certificate renewals automatically for us.

<div class="tip"><strong>TIP:</strong> This is
<a href="https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/acm.tf">infra/site/acm.tf</a>
in the source code.</div>

```terraform
resource "aws_acm_certificate" "site" {
  provider                  = aws.us-east-1
  domain_name               = var.domain_name
  validation_method         = "DNS"
}
```

**NB:** Regardless of the region of your static site, you **must** create
and validate the certificate in the `us-east-1` region for CloudFront to use it
([more info](https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html)). I use a
[provider alias](https://www.terraform.io/docs/configuration/providers.html#alias-multiple-provider-instances) in the
configuration above to tell Terraform to create the certificate in that region.

You must prove that you own or control the domain before ACM will issue a certificate for it. This means that unless the
static website you are setting up is a subdomain of an already-verified domain, Terraform alone won't create a valid
certificate for CloudFront to consume -- and we won't be able to create a CloudFront distribution with an invalid
certificate.

The workaround for this is to create certificate on its own with Terraform, validate it manually using the AWS console,
then apply our full Terraform configuration.  Validation can take some time to complete, so let's do that now.

Terraform will provide the DNS values you need to validate your domain in its output:

```console
$ terraform init
$ terraform apply -target=aws_acm_certificate.site
...
aws_acm_certificate.site: Creating...
aws_acm_certificate.site: Creation complete after 5s [id=arn:aws:acm:us-east-1:...]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.

Outputs:

acm_verify_name = _abc12345.static-example.nicholasarmstrong.com.
acm_verify_type = CNAME
acm_verify_value = _12345.abcdef.acm-validations.aws.
```

You'll need to create the DNS record in your nameserver as specified in the output above; Amazon has
[more details here](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html).  Ensure that your
certificate is showing as `Issued` in the [AWS Console for us-east-1](https://console.aws.amazon.com/acm/home?region=us-east-1#/) before applying the rest of the infrastructure with Terraform.

### CloudFront distribution for website

We have our bucket of site files and our TLS certificate; now we have to serve the site.  CloudFront is a Content
Delivery Network (CDN), which we will use to distribute the contents of our website S3 bucket to users.

I won't discuss all of the necessary CloudFront settings, but a few crucial settings for static websites are:

* **Origin domain name:** This should be the S3 **website** URL, not the bucket URL.  If we use an S3 bucket URL as
  the source, so-called "pretty URLs" won't work -- CloudFront isn't capable of redirecting `/foo/bar/` to `/foo/bar/index.html`.  By using the S3 website URL, CloudFront will pass the request for the former through to S3, which knows
  how to handle this (and CloudFront will cache the result).
* **Alternate domain names**: Set to the domain name of our static website -- we'll use a CNAME to point this domain to
  the domain CloudFront assigns our distribution
* **Price class:** Where CloudFront will distribute our content.  `PriceClass_100` is the least expensive (North America
  and Europe); users outside those areas will still be able to access our site.
  [Higher cost price classes](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PriceClass.html)
  distribute content into more regions to provide faster responses to users in those regions.
* **Viewer Protocol Policy:** Should be set to redirect HTTP to HTTPS -- we want to serve our site securely whenever
  possible.
* **Object Caching:** Should be set to use origin cache headers, so that we can set them with Hugo
* **Compress Objects:** Should be enabled for maximum performance
* **Viewer Certificate:** Set to the certificate we created in the previous step
* **Logging:** Set to the logs bucket we created earlier

The full Terraform configuration for our bucket looks like the following:

<div class="tip"><strong>TIP:</strong> This is
<a href="https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/cloudfront.tf">infra/site/cloudfront.tf</a>
in the source code.</div>

```terraform
# Name for the origin
locals {
  s3_origin_id = "s3-web-${aws_s3_bucket.site-bucket.id}"
}

# CF distribution
resource "aws_cloudfront_distribution" "site" {
  origin {
    origin_id   = local.s3_origin_id
    domain_name = aws_s3_bucket.site-bucket.website_endpoint

    # Custom origin with S3 website as source
    # This ensures subdirectories redirect to their associated index.html
    custom_origin_config {
      http_port              = "80"
      https_port             = "443"
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"
  aliases = [
    var.domain_name
  ]
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.site.arn
    ssl_support_method  = "sni-only"
  }

  logging_config {
    include_cookies = false
    bucket          = aws_s3_bucket.site-logs.bucket_domain_name
    prefix          = "${var.domain_name}/cf/"
  }
}
```

### IAM user for publishing

Almost done! Security best practices suggest creating a user for each application you deploy, and using policies to
limit access just to what is needed for that application. The IAM user we've been using thus far has permissions
to create infrastructure in AWS -- not something we want to allow every site editor to do.

We'll create another user that can read and write our main S3 bucket and invalidate our CloudFront distribution.  This
is the user we will use when publishing with Hugo.

In Terraform, that looks like:

<div class="tip"><strong>TIP:</strong> This is
<a href="https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/iam.tf">infra/site/iam.tf</a>
in the source code.</div>

```terraform
resource "aws_iam_user" "publish" {
  name = "StaticExamplePublish"
}

resource "aws_iam_access_key" "publish" {
  user = aws_iam_user.publish.name
}

# User policy
data "template_file" "publish-policy" {
  template = "${file("publish_user_policy.json")}"
  vars = {
    bucket = aws_s3_bucket.site-bucket.arn
    distribution = aws_cloudfront_distribution.site.arn
  }
}
resource "aws_iam_user_policy" "publish" {
  name = "${aws_iam_user.publish.name}Policy"
  user = aws_iam_user.publish.name
  policy = data.template_file.publish-policy.rendered
}
```

Just as we did when creating bucket policies, we use a template file for our user policy -- 
[publish_user_policy.json](https://github.com/ndrarmstrong/hugo-terraform-aws/blob/master/infra/site/publish_user_policy.json).  Our policy file only allows our new publishing user to update files in S3 and invalidate the CloudFront
distribution, does not permit any infrastructure changes.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "cloudfront:CreateInvalidation"
            ],
            "Resource": [
                "${bucket}/*",
                "${distribution}"
            ]
        }
    ]
}
```

### Run Terraform

With the site configuration ready, we just have to tell Terraform to apply it.  Be patient while Terraform creates
the infrastructure in AWS; the CloudFront distribution (in particular) can take quite a long time to deploy.
Terraform will print a log of everything it applies:

```console
$ terraform apply
...
aws_s3_bucket.site-logs: Creating...
aws_s3_bucket.site-logs: Creation complete after 4s [id=example-static-site-logs]
aws_s3_bucket_public_access_block.site-logs: Creating...
aws_s3_bucket.www-site-bucket: Creating...
aws_s3_bucket.site-bucket: Creating...
aws_s3_bucket_public_access_block.site-logs: Creation complete after 0s [id=example-static-site-logs]
aws_s3_bucket.site-bucket: Creation complete after 4s [id=static-example.nicholasarmstrong.com]
data.template_file.site-bucket-policy: Refreshing state...
aws_s3_bucket_public_access_block.site-bucket: Creating...
aws_s3_bucket_policy.site-bucket: Creating...
aws_cloudfront_distribution.site: Creating...
aws_s3_bucket.www-site-bucket: Creation complete after 4s [id=www.static-example.nicholasarmstrong.com]
data.template_file.www-site-bucket-policy: Refreshing state...
aws_s3_bucket_public_access_block.www-site-bucket: Creating...
aws_s3_bucket_policy.www-site-bucket: Creating...
aws_s3_bucket_public_access_block.site-bucket: Creation complete after 0s [id=static-example.nicholasarmstrong.com]
aws_s3_bucket_public_access_block.www-site-bucket: Creation complete after 1s [id=www.static-example.nicholasarmstrong.com]
aws_cloudfront_distribution.site: Still creating... [10s elapsed]
...
aws_cloudfront_distribution.site: Still creating... [9m0s elapsed]
aws_cloudfront_distribution.site: Creation complete after 9m1s [id=ABC12345]
data.template_file.publish-policy: Refreshing state...
aws_iam_user.publish: Creating...
aws_iam_user.publish: Creation complete after 1s [id=StaticExamplePublish]
aws_iam_user_policy.publish: Creating...
aws_iam_access_key.publish: Creating...
aws_iam_access_key.publish: Creation complete after 0s [id=AKIAxxxxxxx]
aws_s3_bucket_policy.www-site-bucket: Creating...
aws_iam_user_policy.publish: Creating...
aws_s3_bucket_policy.site-bucket: Creating...
aws_iam_user_policy.publish: Creation complete after 0s [id=StaticExamplePublish:StaticExamplePublishPolicy]
aws_s3_bucket_policy.www-site-bucket: Creation complete after 0s [id=www.static-example.nicholasarmstrong.com]
aws_s3_bucket_policy.site-bucket: Creation complete after 0s [id=static-example.nicholasarmstrong.com]

Apply complete! Resources: 12 added, 0 changed, 0 destroyed.

Outputs:

cf_distribution_id = ABC12345
cf_website_endpoint = d2jgxxad50efr7.cloudfront.net
iam_publish_access_key = AKIAxxxxxxx
iam_publish_secret_key = xxxxxxxxxxx
s3_bucket_url = s3://static-example.nicholasarmstrong.com?region=ca-central-1
s3_redirect_endpoint = www.static-example.nicholasarmstrong.com.s3-website.ca-central-1.amazonaws.com
```

If Terraform ran without errors, great -- your static site is ready for some content!

If Terraform encountered an error, it should give a pretty clear description of what the problem is; you may simply need
to try again now that some of the resources have been created.  It's safe to run `terraform apply` as many times as you
want -- it compares what is already in AWS with the configuration it has, and picks up where it left off (or applies the
changes you made).

Keep note of the output values -- they will be needed later.

<div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>Output</th>
                <th>Purpose</th>
                <th>Where it goes</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>cf_distribution_id</code></td>
                <td>Hugo &mdash; to invalidate CloudFront when you publish</td>
                <td>config.toml</td>
            </tr>
            <tr>
                <td><code>cf_website_endpoint</code></td>
                <td>CNAME value for your website domain</td>
                <td>Nameserver</td>
            </tr>
            <tr>
                <td><code>iam_publish_access_key</code></td>
                <td>This is your publishing user Access Key ID</td>
                <td>aws configure</td>
            </tr>
            <tr>
                <td><code>iam_publish_secret_key</code></td>
                <td>This is your publishing user Secret Access Key</td>
                <td>aws configure</td>
            </tr>
            <tr>
                <td><code>s3_bucket_url</code></td>
                <td>Hugo &mdash; destination for publishing site</td>
                <td>config.toml</td>
            </tr>
            <tr>
                <td><code>s3_redirect_endpoint</code></td>
                <td>CNAME value for <code>www.</code> your website domain</td>
                <td>Nameserver</td>
            </tr>
        </tbody>
    </table>
</div>

## Building and deploying a static site with Hugo

All that is left is to create a static site to deploy on our new infrastructure. You can use whichever tool fits best
in your environment; [Jekyll (Ruby)](https://jekyllrb.com/), [Gatsby (node.js)](https://www.gatsbyjs.org/),
and [Hugo (Go)](https://gohugo.io/) are all popular choices.  I'm going to use Hugo here simply because it is
extremely capable out of the box, and works well with the infrastructure we built.

<div class="tip"><strong>TIP:</strong> A basic Hugo site is present at
<a href="https://github.com/ndrarmstrong/hugo-terraform-aws/tree/master/site">/site</a>
in the source code.</div>

## Create a new Hugo site

Run the following in a new directory to create a new Hugo site:

```console
$ hugo new site .
```

Then, edit `config.toml` with the settings for your website and the infrastructure values from earlier:

```toml
baseURL = "https://static-example.nicholasarmstrong.com/"
languageCode = "en-us"
title = "Example Static Hugo Site"

# Deploy to S3 + CloudFront
[deployment]
  [[deployment.targets]]
    name = "S3"
    URL = "s3://static-example.nicholasarmstrong.com?region=ca-central-1"
    cloudFrontDistributionID = "ABC12345"
```

If you use [resource fingerprints](https://gohugo.io/hugo-pipes/fingerprint/) with Hugo, you can also set far-future
expires for your assets by adding the following to your `config.toml` (add other file extensions as needed):

```toml
  [[deployment.matchers]]
    #  Cache static assets for 1 year.
    pattern = "^.+\\.(js|css|svg|ttf|png|jpg|svg|woff|woff2)$"
    cacheControl = "max-age=31536000, no-transform, public"
```

Many themes for Hugo [are available](https://themes.gohugo.io/); you can also
[create your own](https://gohugo.io/commands/hugo_new_theme/). For demonstration, we'll install the Anake theme:

```console
$ git submodule add https://github.com/budparr/gohugo-theme-ananke.git themes/ananke
```

Then add to `config.toml`:

```toml
theme = "anake"
````

We're all set!  We can now run our site in development mode with `hugo serve`:

```console
$ hugo serve

                   | EN  
-------------------+-----
  Pages            |  6  
  Paginator pages  |  0  
  Non-page files   |  0  
  Static files     |  1  
  Processed images |  0  
  Aliases          |  1  
  Sitemaps         |  1  
  Cleaned          |  0  

Built in 21 ms
Watching for changes in /home/static/site/{archetypes,content,data,layouts,static,themes}
Watching for config changes in /home/static/site/config.toml
Environment: "development"
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at http://localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
```

The Anake theme is rather plain -- but you're well on your way to building a great, fast static website.  To get an idea
of the things you can do, check out [dexmanus.com](https://dexmanus.com) -- it uses exactly the same
infrastructure I've been discussing here.

Let's get your site deployed!

## Deploying to S3/CloudFront with Hugo

The configuration we did in the last section is all Hugo needs to know how to deploy our site to the infrastructure we
built earlier.

To build the "production" version of the site, remove the output directory and re-generate:

```console
$ rm -rf public
$ hugo

                   | EN  
-------------------+-----
  Pages            | 10  
  Paginator pages  |  0  
  Non-page files   |  0  
  Static files     |  3  
  Processed images |  0  
  Aliases          |  1  
  Sitemaps         |  1  
  Cleaned          |  0  

Total in 27 ms
```

To publish, run the following commands.  Hugo will see what changes need to be applied to S3, prompt before continuing,
and then proceed to upload the updated site files to S3 and trigger a CloudFront invalidation:

```console
$ aws configure
AWS Access Key ID [None]: AKIAxxxxxxx
AWS Secret Access Key [None]: xxxxxxxxxxx
Default region name [None]: 
Default output format [None]: 
$ hugo deploy --maxDeletes -1 --invalidateCDN --confirm
Deploying to target "S3" (s3://static-example.nicholasarmstrong.com?region=ca-central-1)
Identified 15 file(s) to upload, totaling 391 kB, and 0 file(s) to delete.
Continue? (Y/n) Y
Success!
Invalidating CloudFront CDN...
Success!
```

If you navigate to the endpoint Terraform gave as `cf_website_endpoint` -- in my case, 
[https://d2jgxxad50efr7.cloudfront.net/](https://d2jgxxad50efr7.cloudfront.net/) -- you will see
your static site live on the web!

## Final step -- Update your nameserver

Now that the site is live on CloudFront, you have to update your DNS records so that they point to your CloudFront
distribution and S3 redirect.  Use CNAME or ALIAS records for this, depending on what your nameserver supports --

* If you are redirecting a subdomain, either CNAME or ALIAS will work
* If you are redirecting the root domain,
  * Use ALIAS if supported
  * Use CNAME _only if_ your nameserver supports
[CNAME flattening](https://support.cloudflare.com/hc/en-us/articles/200169056-Understand-and-configure-CNAME-Flattening)

If you use CNAME on a root domain with a nameserver that doesn't support CNAME flattening, you'll also redirect the
other types of records you may have created on your root domain -- like MX records for mail.  If you find yourself
with a nameserver that can't do either ALIAS or CNAME flattening, you can transfer your DNS to someone like
[Cloudflare](https://www.cloudflare.com/) -- their free plan is all that is needed.

You want your records to look something like this; the two values you need are from the Terraform output -- `cf_website_endpoint` (for the root) and `s3_redirect_endpoint` (for www):

<div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><code>@</code></td>
                <td>CNAME/ALIAS</td>
                <td>d2jgxxad50efr7.cloudfront.net</td>
            </tr>
            <tr>
                <td><code>www</code></td>
                <td>CNAME/ALIAS</td>
                <td>www.static-example.nicholasarmstrong.com.s3-website.ca-central-1.amazonaws.com</td>
            </tr>
        </tbody>
    </table>
</div>

As the redirect goes to S3 in the region you deployed in rather than all of the edge locations that CloudFront
distributes from, you'll find it a touch slower than accessing your site without the `www.` prefix.  As this only
applies to the initial redirect and not the actual site access -- and we're using it as a 'just in case' -- it will not
impact users in practice.

## That's it!

Your fast and secure static website is live on the web, ready for content and theming.  Mine is live at
[static-example.nicholasarmstrong.com](https://static-example.nicholasarmstrong.com/) -- and
[nicholasarmstrong.com](https://nicholasarmstrong.com), and [dexmanus.com](https://dexmanus.com/), and more.

When you have new content to deploy, all you have to do is run `hugo deploy` -- and your site will be distributed to
hundreds of edge locations around the world within minutes.

And if you want another website,
[clone the repository](https://github.com/ndrarmstrong/hugo-terraform-aws/)
and run `terraform apply` to set everything up again!