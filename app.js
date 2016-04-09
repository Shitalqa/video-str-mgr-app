/**
 * File Uploading and Streaming with BinaryJS
 */
'use strict';

var BinaryServer, express, http, path, app, video, server, bs;

BinaryServer = require('binaryjs').BinaryServer;
express      = require('express');
http         = require('http');
path         = require('path');
app          = express();
video        = require('./lib/video');

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

server = http.createServer(app);

bs = new BinaryServer({server: server});

bs.on('connection', function (client) {
//    client.on('filenames', function(files){
//       video.listDbFilenames(files);
//    });
    client.on('stream', function (stream, meta) {
        switch(meta.event) {
            // list available videos
            case 'list':
                video.list(stream, meta);
                break;
            
            // list available videos from Db
            case 'listDb':
                video.listDb(stream, meta);
                break;
            
            // list available videos from Db
            case 'deleteOne':
                video.deleteFile(stream, meta);
                break;

            // request for a video
            case 'request':
                video.request(client, meta);
                break;

            // attempt an upload
            case 'upload':
            default:
                video.upload(stream, meta);
        }
    });
    
});

server.listen(process.env.PORT || 9000, function () {
    console.log('Video Server started on https://video-str-mgr-app.herokuapp.com:9000');
});
