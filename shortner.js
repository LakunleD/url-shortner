'use strict';
const Hapi = require("hapi");
const server = new Hapi.Server();
const MongoClient = require('mongodb').MongoClient;
const corsHeaders = require('hapi-cors-headers');

let routes = require('./routes');

const mongodbLocation = process.env.LOCALHOST;
const mongodbDatabase = process.env.SHORTNER_DATABASE;
const mongoUser = process.env.SHORTNER_MONGODB_USER;
const mongoPasswd = process.env.SHORTNER_MONGODB_PWD;

let mongoDbConnectionString = '' ;

if(mongoUser || mongoPasswd === undefined){
    mongoDbConnectionString = "mongodb://" + mongodbLocation + ":27017/" + mongodbDatabase;
}
else{
    mongoDbConnectionString = "mongodb://" + mongoUser + ":" + mongoPasswd + "@" + mongodbLocation + ":27017/" + mongodbDatabase;
}

console.log(mongoDbConnectionString);

MongoClient.connect(mongoDbConnectionString, function(err, db) {
    if(err){
        console.log('error connecting to the database');
        console.log(err);
        return;
    }
    console.log("Connected correctly to server");
    addRoutes(server, db);
    startServer(server);
});


server.connection({
    "port": 9999,
    "routes": {
        "cors": {
            "headers": ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language", "Origin"],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    }
});

server.ext('onPreResponse', corsHeaders)

function addRoutes(server, db) {
    routes(server, db);
}

function startServer(server) {
    server.start(function () {
        console.log('Server running at: ' + server.info.uri);
        server.log('info', 'Server running at: ' + server.info.uri);
    });
}
