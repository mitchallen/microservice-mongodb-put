/**
    Module: @mitchallen/microservice-mongodb-put
      Test: smoke-test
    Author: Mitch Allen
*/

"use strict";

var request = require('supertest'),
    should = require('should'),
    postModulePath = "@mitchallen/microservice-mongodb-post",
    testName = require("../package").name,
    testVersion = require("../package").version,
    verbose = process.env.TEST_VERBOSE || false,
    testPort = process.env.TEST_SERVICE_PORT || 8030,
    postPort = process.env.TEST_SERVICE_POST_PORT || 8031,
    testCollectionName = "test-qa",
    testPrefix = "/v1",
    testUrl = testPrefix + "/" + testCollectionName,
    postUrl = testPrefix + "/" + testCollectionName,
    testHost = "http://localhost:" + testPort,
    postHost = "http://localhost:" + postPort,
    testMongo =  {
        // NOTE: if for localhost you change '/test' to '/test2', a test2 DB will be created in Mongo.
        // Then all operations will go to test2.
        uri: process.env.TEST_MONGO_URI || 'mongodb://localhost/test'
    },
    testObject = {
        email : "foo@foo.com",
        username: "foo",
        status: "active",
        age: 21
    };

describe('mongodb microservice smoke test', function() {

    // Set by before method
    var docId = null;

    before(function(done) {
        
        var postOptions = {
            name: testName,
            version: testVersion,
            verbose: verbose,
            port: postPort,
            prefix: testPrefix,
            mongodb: testMongo,
            collectionName: testCollectionName
        };

        // Needed for cleanup between tests
        delete require.cache[require.resolve(postModulePath)];
        require(postModulePath)(postOptions, function(err,postObj) {
            
            should.not.exist(err);
            should.exist(postObj);
            var postServer = postObj.server;
            should.exist(postServer);

            request(postHost)
                .post(postUrl)
                .send(testObject)
                .set('Content-Type', 'application/json')
                .expect(201)
                .end(function (err, res) {
                    should.not.exist(err);
                    if(verbose) {
                        console.log("BODY: %s", JSON.stringify(res.body) );
                        console.log("DOC ID: %s", JSON.stringify(res.body.insertedIds[0]) );
                    }
                    should.exist(res.body);
                    should.exist(res.body.result);
                    should.exist(res.body.result.ok);
                    res.body.result.ok.should.eql(1);
                    should.exist(res.body.result.n);
                    res.body.result.n.should.eql(1);
                    should.exist(res.body.insertedIds[0]);
                    docId = res.body.insertedIds[0];
                    should.exist(docId);
                    postServer.close(done);
                });

            });
    });

    after(function(done) {
        // Cleanup
        done();
    });

    it('should not throw an error', function(done) {
        var options = {
            name: testName,
            version: testVersion,
            verbose: verbose,
            port: testPort,
            prefix: testPrefix,
            mongodb: testMongo,
            collectionName: testCollectionName,
        };
        var modulePath = '../index';
        // Needed for cleanup between tests
        delete require.cache[require.resolve(modulePath)];
        require(modulePath)(options, function(err,obj) {
            should.not.exist(err);
            should.exist(obj);
            var server = obj.server;
            should.exist(server);
            server.close(done)
        });
    });

    it('should put to url', function(done) {

        var options = {
            name: testName,
            version: testVersion,
            verbose: verbose,
            port: testPort,
            prefix: testPrefix,
            mongodb: testMongo,
            collectionName: testCollectionName
        };
        
        var modulePath = '../index';
        // Needed for cleanup between tests
        delete require.cache[require.resolve(modulePath)];
        require(modulePath)(options, function(err,obj) {
            should.not.exist(err);
            should.exist(obj);
            var server = obj.server;
            should.exist(server);

            // PUT
            request(testHost)
                .put(testUrl + "/" + docId)
                // MUST USE DOUBLE QUOTES - or JSON.parse bombs in GET.
                // .query('filter={"email":"' + testEmail + '"}')\
                .send({ status: "UPDATED" })
                // .expect('Content-Type', /json/)
                .expect(204)
                .end(function (err, res) {
                    should.not.exist(err);
                    should.exist(res);
                    server.close(done);
                });
        });
    });
});