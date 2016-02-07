'use strict';
var DonorController = require('./controllers/donor');
module.exports = function(app, io) {

    // GET Routes
    // --------------------------------------------------------
    // Retrieve records for all donors in the db
    app.get('/donors', DonorController.list);
    app.get('/donors/:donorId', DonorController.show);

    // POST Routes
    // --------------------------------------------------------
    // Provides method for saving new donors in the db
    app.post('/donors', DonorController.create);

    // PUT Routes
    // --------------------------------------------------------
    // Provides method for updating donors information
    app.put('/donors/:donorId', DonorController.update(io));

    // DELETE Routes
    // --------------------------------------------------------
    // Provides method for deleting a donor account
    app.delete('/donors/:donorId', DonorController.delete(io));
};