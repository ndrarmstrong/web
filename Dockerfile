FROM jekyll/jekyll:3.4

RUN npm install -g grunt-cli

WORKDIR /srv/jekyll/web
CMD /bin/sh