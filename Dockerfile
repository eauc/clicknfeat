FROM node:10 as client

# yeah we need sass to run 'grunt build'
RUN apt update && \
    apt install -y ruby2.3 ruby2.3-dev
RUN gem install sass

WORKDIR /app

# install all JS packages
COPY ./package.json ./
COPY *bower* ./
RUN npm install
RUN npx bower install --allow-root

# try to build dist files
COPY ./.babelrc ./
COPY ./Gruntfile.js ./
RUN mkdir -p client
COPY ./client/dev ./client/dev
RUN npx grunt build

# copy eslint config for dev setup
COPY ./.eslint* ./

FROM ruby:2.6.1 as server

WORKDIR /app

COPY Gemfile* ./
RUN bundle install

# copy dist files from client
RUN mkdir -p client
COPY --from=client /app/client/dist ./client/dist
COPY --from=client /app/client/dev/lib/bootstrap/dist/css/bootstrap.min.css ./client/dist/css
COPY --from=client /app/client/dev/lib/bootstrap/dist/fonts ./client/dist/fonts
COPY ./client/data ./client/data

# copy server files
COPY ./server ./server
COPY ./config.ru ./

ENV RACK_ENV=production
ENV PORT=3000

CMD ["bash","-c","bundle exec rackup --host 0.0.0.0 -p $PORT"]
