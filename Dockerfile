FROM jekyll/jekyll:3.8

RUN npm install -g grunt-cli local-web-server

WORKDIR /srv/jekyll/web
CMD /bin/sh