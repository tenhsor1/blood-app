'use strict';

var mongoose = require('mongoose');
var Donor = require('../models/donor');

var DonorController = {
  list: function(req, res){
    var query;
    if(req.query.topLat){
        var topLimit = [parseFloat(req.query.topLong), parseFloat(req.query.topLat)];
        var bottomLimit = [parseFloat(req.query.bottomLong), parseFloat(req.query.bottomLat)];
        var boxLimit = [topLimit, bottomLimit];
        query = Donor.find({"location" : {"$within" : {"$box" : boxLimit}}});
    }else{
        // Get a list of donors with no filters
        query = Donor.find({});
    }
    query.exec(function(err, donors){
        if(err){
            res.send({error: true, message: "Something wrong happened"});
        }
        else{
            // If no errors are found, it responds with a JSON of all donors
            res.json(donors);
        }
    });
  },

  show: function(req, res){
    var donorId = req.params.donorId;
    var query = Donor.findOne({'_id' : donorId});
    query.exec(function(err, donor){
        if(err){
            res.json({});
        }
        else{
            // If no errors are found, it responds with a JSON of all donors
            res.json(donor);
        }
    });
  },

  create: function(req, res){
    // Creates a new Donor based on the Mongoose schema and the post body
    var newDonor = new Donor(req.body);

    // New Donor is saved in the db.
    newDonor.save(function(err, donor){
        if(err){
            res.status(400).send({error: true,
                                message: "Something wrong happened, review your payload"});
        }else{
            // If no errors are found, it responds with a JSON of the new Donor
            res.json(donor);
        }
    });
  },

  update: function(socket){
      return function(req, res){
        var donorId = req.params.donorId;
        Donor.findOneAndUpdate({ _id: donorId }, {$set:req.body}, { runValidators: true, new: true },
        function(err, donor) {
            if(err) {
                res.status(400).send({error: true,
                            message: "Something wrong happened, review your payload"});
            }else{
                res.json(donor);
                socket.emit('update', donor);
            }
        });
    };
  },

  delete: function(socket){
    return function(req, res){
        var donorId = req.params.donorId;
        var query = Donor.findByIdAndRemove({'_id' : donorId});
        //first try to find the donor
        query.exec(function(err, donor){
            if(err){
                //if not found,return an error
                res.status(400).send({error: true, message: "Donor not found"});
            }
            else{
                socket.emit('delete', donorId);
                res.json({success:true, message: 'Donor deleted correctly'});
            }
        });
    };
  },
};

module.exports = DonorController;