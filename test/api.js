'use strict';

var supertest = require("supertest");
var should = require("should");
var app = require("../server");

// This agent refers to PORT where program is runninng.

var agent = supertest.agent(app);

// UNIT test begin

describe("Unit test for BloodAPP REST API",function(){

  // #1 should return home page
  var donor_id;

  it("should give a 404 error on unexisting route",function(done){
    // calling donors add endpoint
    agent
    .get("/donorss")
    .expect("Content-type",/json/)
    .expect(404, done());
  });

  it("should fail to create a donor with incomplete data",function(done){
    var donor = {
      "first_name": "Ricardo"
    };
    // calling donors add endpoint
    agent
    .post("/donors")
    .send(donor)
    .expect("Content-type",/json/)
    .expect(400, done());
  });

  it("should create a donor",function(done){
    var donor = {
      "first_name": "Ricardo",
      "last_name": "Romo",
      "email": "rick@romo.com",
      "blood_type": "O+",
      "contact_number": "2334445555",
      "address": "Address 123",
      "location": [1,1]
    };
    // calling donors add endpoint
    agent
    .post("/donors")
    .send(donor)
    .expect("Content-type",/json/)
    .expect(200)
    .end(function(err,res){
      if (err) return done(err);
      should.exist(res.body._id, "Expected _id to exist");
      donor_id = res.body._id;
      done();
    });
  });

  it("should return donors list",function(done){

    // calling donors list endpoint
    agent
    .get("/donors")
    .expect("Content-type",/json/)
    .expect(200)
    .end(function(err,res){
      if (err) return done(err);
      should(res.body.length).be.above(0);
      done();
    });
  });

  it("should return just the donor information",function(done){

    // calling donors information endpoint
    agent
    .get("/donors/" + donor_id)
    .expect("Content-type",/json/)
    .expect(200)
    .end(function(err,res){
      if (err) return done(err);
      should(res.body.first_name).be.equal("Ricardo", "Expected first_name to be Ricardo");
      done();
    });
  });

  it("should not update a donor when required attribute is null",function(done){
    var userEdit = {
      "first_name": null
    };
    // calling donors list endpoint
    agent
    .put("/donors/" + donor_id)
    .send(userEdit)
    .expect("Content-type",/json/)
    .expect(400)
    .end(function(err,res){
      if (err) return done(err);
      should(res.body.error).be.equal(true, "Expected error to be true");
      done();
    });
  });

  it("should update a donor with new name",function(done){
    var userEdit = {
      "first_name": "Pepe"
    };
    // calling donors list endpoint
    agent
    .put("/donors/" + donor_id)
    .send(userEdit)
    .expect("Content-type",/json/)
    .expect(200)
    .end(function(err,res){
      if (err) return done(err);
      should(res.body.first_name).be.equal("Pepe", "Expected First Name to be Pepe");
      done();
    });
  });

  it("should not delete a donors that doesn't exist",function(done){

    // calling donors delete endpoint
    agent
    .delete("/donors/idnotexist")
    .expect("Content-type",/json/)
    .expect(400)
    .end(function(err,res){
      if (err) return done(err);
      should(res.body.error).be.equal(true, "Expected error to be true");
      done();
    });
  });

  it("should delete a donor account",function(done){
    // calling donors list endpoint
    agent
    .delete("/donors/" + donor_id)
    .expect("Content-type",/json/)
    .expect(200, done);
  });

  it("should not return any info for the deleted donor",function(done){

    // calling donors information endpoint
    agent
    .get("/donors/" + donor_id)
    .expect("Content-type",/json/)
    .expect(200)
    .end(function(err,res){
      if (err) return done(err);
      should.not.exist(res.body, "Expeced an empty body");
      done();
    });
  });

});