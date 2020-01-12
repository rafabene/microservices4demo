FROM node:10-alpine
ENV JAEGER_ENDPOINT=http://jaeger-collector.istio-system.svc:14268/api/traces
ENV KAFKA_URL=my-cluster-kafka-brokers.kafka.svc:9092

# Configure Redis HOST
ENV MYSQL_HOST=mysql
# Create app directory
WORKDIR /usr/src/app/

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "index.js" ]