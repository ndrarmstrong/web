FROM jekyll/jekyll:3.8

RUN npm install -g grunt-cli local-web-server &&\
    gem install s3_website

WORKDIR /srv/jekyll/web
ENV PATH="${PATH}:/usr/gem/bin"
CMD /bin/sh