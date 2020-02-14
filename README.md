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