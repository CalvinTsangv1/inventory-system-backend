FROM ubuntu:20.04


#System setup
RUN apt-get update && apt-get install -y jq sudo curl wget gnupg build-essential git

#install homebrew and netstat
RUN apt-get install -y build-essential procps curl file git
RUN apt-get install net-tools

#Yarn repo
RUN curl fsSL https://dl.yarnpkg.com/debian/pubkey.gpg -k | apt-key add
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list

#Node.js using Ubuntu

RUN curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
RUN sudo apt-get install -y nodejs

#Yarn
RUN sudo apt-get update && apt-get install -y yarn
RUN apt-get clean && rm -rf /var/lib/apt/lists/*;

#Create app directory
RUN mkdir -p /app
WORKDIR /app

#setup environment
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

#copy project to work directory
COPY . /app
RUN yarn install

EXPOSE 3000
CMD ["yarn", "start"]
