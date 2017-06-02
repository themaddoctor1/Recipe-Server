// stdlib imports
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// npm imports
var yargs = require('yargs');

// custom imports
var dbi = require('./dbinterface.js');

// Handle argument parsing
const argv = yargs.argv;

// Define the port number
var portno = 8080
if (argv.port !== undefined)
    portno = argv.port;

//Set default query for site (access site's root)
app.get('/', function (req, res) {
    // Provide the home page
    res.sendFile(__dirname + '/site/search.html');
});

app.get('/search', function(req, res) {
    res.sendFile(__dirname + '/site/search.html');
});

app.get('/submit', function (req, res) {
    res.sendFile(__dirname + '/site/submit.html');
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/site/style.css');
});

// socket.io connection event
io.on("connection", function (socket) {
    var address = socket.handshake.address;

    // Log the new connection
    userlog(address, 'User connected');
    
    // Define the disconnect event for the socket
    socket.on('disconnect', function () {
        // Log the disconnect
        userlog(address, 'User disconnected');
    });
    
    // Handle recipe requests
    socket.on('req_recipe', function (data) {
        
        // Supply the recipe
        var regexName = data.name;
        
        try {
            var query = {
                'name' : new RegExp(regexName, 'gi')
            };

            userlog(address, 'New recipe request');

            // Get and return the recipe if possible
            dbi.getRecipe(dbi.db_url, query, (res) => {
                // Send res back to the client
                socket.emit('res_recipe', res);

                userlog(address, 'Recipe request successful');
            });
        } catch (e) {
            userlog(address, 'Recipe request unsuccessful:');
            console.log(e);

            //Send the empty list
            socket.emit('res_recipe', []);
        }

    });

    // Handle deletion requests
    socket.on('del_recipe', function (data) {
        userlog(address, 'New recipe deletion request');

        dbi.removeRecipe(dbi.db_url, data, (res) => {
            // Supply the result to the client
            socket.emit(res);

            userlog(address, 'Deletion request complete');
        });

    });

    // Handle a new recipe
    socket.on('add_recipe', function (data) {
        
        // Error check the input
        if (data.name.length <= 0)
            return;

        data.id = new Date().getTime();

        dbi.addRecipe(dbi.db_url, data, (res) => {
            userlog(address, 'Added new recipe');
        });
    });

});

// Listen on the selected port
http.listen(portno, function () {
    console.log('Listening on port', portno);
});

/**
 * Given address info and a message, logs the message.
 * Used by the io.on callback.
 */
var userlog = function (address, message) {
    var clientname;
    
    if (address === undefined)
        clientname = 'unknown';
    else if (address.address === undefined)
        clientname = 'unknown';
    else
        clientname = address.address + ':' + address.port;

    console.log('(' + clientname + ')', message);
};
