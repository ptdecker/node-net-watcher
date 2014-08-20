'use strict';

const
    fs = require('fs'),
    net = require('net'),
    filename = process.argv[2],
    server = net.createServer(function(connection) {
        console.log('Subscriber connected.');
        connection.write(JSON.stringify({type: 'watching',file: filename})+"\n");
        let watcher = fs.watch(filename, function() {
            connection.write(JSON.stringify({type: 'changed',file: filename,timestamp: new Date()}) + "\n");
        });
        connection.on('close', function() {
            console.log('Subscriber disconnected.');
            watcher.close();
        });
    });

if (!filename) {
    throw Error('No target filename was specified.');
}

process.on('SIGINT', function() {
    console.log('\nClosing socket');
    server.close(function() {
        process.exit(0);
    });
});

server.listen('/tmp/watcher.sock', function() {
    console.log('Listening for subscribers...');
});

