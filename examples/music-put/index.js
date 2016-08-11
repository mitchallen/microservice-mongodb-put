"use strict";

let demand = require('@mitchallen/demand');
let prefix = process.env.MUSIC_PUT_API_VERSION || '/v1';

var service = {

    name: require("./package").name,
    version: require("./package").version,
    verbose: true,
    prefix: prefix,
    port: process.env.MUSIC_PUT_PORT || 8008,
    mongodb: {
        uri: process.env.TEST_MONGO_URI || 'mongodb://localhost/test',
    },
    collectionName: "music",
};

// TODO: update with module when published
require('../../index')(service, function(err,obj) {
// require('@mitchallen/microservice-mongodb-put')(service, function(err,obj) {
    if( err ) {
        console.log(err);
        throw new Error( err.message );
    }
});