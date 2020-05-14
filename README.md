# web

Sources for NicholasArmstrong.com

## Checkout

To checkout:

```
git clone git@github.com:ndrarmstrong/web.git
cd web
git submodule update --init
```

## Development container

To build the development container:

```
docker-compose --env-file docker.env build
```

To run the development container:

```
docker-compose --env-file docker.env run --rm web-dev
```

## Website

To build development version:

```
grunt
```

To build and watch development version:

```
grunt develop
```

To build release version:

```
grunt release
```

## Deploy to S3/CloudFront

Make sure there is a `.env` file in the root directory with the following variables filled in:

```
export WEBSITE_S3_BUCKET=
export WEBSITE_S3_ID=
export WEBSITE_S3_SECRET=
export WEBSITE_CF_DISTRO=
```

Then:

```
grunt deploy
```

This will build and upload the release version of the website, and invalidate the distribution.