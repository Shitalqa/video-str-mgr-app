/**
 * Manages uploading and streaming of video files.
 *
 * @module video
 */
'use strict';

var assert = require('assert');
var fs = require('fs');
var mongodb = require('mongodb');

//var uri = 'mongodb://heroku_50l37vxm:8c0ll8behn4e9v6scs35fsr2tr4@ds019960.mlab.com:19960/heroku_50l37vxm';
var uri = 'mongodb://heroku_50l37vxm:8c0ll8behn4e9v6scs35fsr2tr@ds019960.mlab.com:19960/heroku_50l37vxm';
var uploadPath, supportedTypes;

//var fs             = require('fs');
uploadPath     = __dirname + '/../videos';
supportedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg'
];

module.exports = {
    list    : list,
    listDb  : listDb,
    listDbFilenames  : listDbFilenames,
    deleteFile  : deleteFile,
    request : request,
    upload  : upload
};

/* Start */
  
//_checkUploadDir();

function _checkUploadDir(cb) {
    cb = cb || function () {};

    fs.stat(uploadPath, function (err, stats) {
        if (
            (err && err.errno === 34) ||
            !stats.isDirectory()
           ) {
            // if there's no error, it means it's not a directory - remove it
            if (!err) {
                fs.unlinkSync(uploadPath);
            }

            // create directory
            fs.mkdir(uploadPath, cb);
            return;
        }

        cb();
    });
}

function list(stream, meta)  {
//    console.log("Inside list(Files)-----------------");
//    mongodb.MongoClient.connect(uri, function(error, db) {
//        assert.ifError(error);
//
//        db.collection('fs.files').find().toArray(function(err, files) {
//                    if (err){
//                        console.log("Err = " + err);
//                    }
//                    files.forEach(function(file) {
////                        var gs = new mongodb.GridStore(db, file._id, 'r');
//                        console.log(file.filename);
//                        stream.write({ files : file.filename});
//                    });
//                });
//    });
    
    
    
    _checkUploadDir(function () {
        fs.readdir(uploadPath, function (err, files) {
            stream.write({ files : files });
        });
    });
}

function request(client, meta) {
    if(fetchFromDb(meta)){
        var file = fs.createReadStream(uploadPath + '/' + meta.name);

        client.send(file);
    }
    
}

function upload(stream, meta) {
    if (!~supportedTypes.indexOf(meta.type)) {
        stream.write({ err: 'Unsupported type: ' + meta.type });
        stream.end();
        return;
    }

    var file = fs.createWriteStream(uploadPath + '/' + meta.name);
    stream.pipe(file);

    stream.on('data', function (data) {
        stream.write({ rx : data.length / meta.size });
    });

    stream.on('end', function () {
        stream.write({ end: true });
        
        console.log('File uploaded on server! calling storeInDb..');
        storeInDb(uploadPath + '/' + meta.name, meta);
    });
}
/* End */


function listDbFilenames(fileHolder)  {
    console.log("Srvr Video.js :: Inside listDbFilenames-----------------" + fileHolder);
//    console.log(stream);
    mongodb.MongoClient.connect(uri, function(error, db) {
        assert.ifError(error);

        var oArray = [];
        
        db.collection('fs.files').find().toArray(function(err, files) {
                    if (err){
                        console.log("Err = " + err);
                    }
                    files.forEach(function(file) {
//                        var gs = new mongodb.GridStore(db, file._id, 'r');
                        console.log(file.filename);
//                        stream.write([file.filename]);
                        oArray.push(file.filename);
                        
                    });
                });
                
                fileHolder = oArray;
    });
}
function listDb(stream, meta)  {
    console.log("Srvr Video.js :: Inside listFiles-----------------" + stream);
    var filespath = uploadPath + '/files/';
    mongodb.MongoClient.connect(uri, function(error, db) {
        assert.ifError(error);
        db.collection('fs.files').find().toArray(function(err, files) {
                    if (err){ console.log("Err = " + err); }
                    files.forEach(function(file) {
//                        if(!stream.write({files: file.filename})){
//                            console.log("Data NOT written to BinaryStream");
//                        }else{
//                            console.log("Data written to BinaryStream");
//                        }
                        fs.createWriteStream(uploadPath + '/files/' + file.filename);
                        fs.readdir(filespath, function (err, filenme) {
                            console.log(filenme);
                            stream.write({ files : filenme });
                        });
                    });
                });
    });
}
function fetchFromDb(meta) {
    console.log("Inside fetchFromDb-----------------");
    
    mongodb.MongoClient.connect(uri, function(error, db) {
        assert.ifError(error);

        var bucket = new mongodb.GridFSBucket(db);

        bucket.openDownloadStreamByName(meta.name).
                pipe(fs.createWriteStream(uploadPath + '/' + meta.name)).
                on('error', function(error) {
                    assert.ifError(error);
                }).
                on('finish', function() {
                    //console.log('done!');
                    //process.exit(0);
                });
    });
}

function storeInDb(filepath, meta) {
    console.log("Inside storeInDb-----------------------");
    
    mongodb.MongoClient.connect(uri, function(error, db) {
        assert.ifError(error);

        var bucket = new mongodb.GridFSBucket(db);

//        var readStream = fs.createReadStream('myfile.json');
//
//        readStream.on('end', function () {  
//            readStream.close();
//            var myData = JSON.parse(readStream);
//            //Do some operation on myData here
//        });

//        fs.createReadStream('./sample/nature.mp4').
        fs.createReadStream(filepath).
                pipe(bucket.openUploadStream(meta.name)).
                on('error', function(error) {
                    assert.ifError(error);
                }).
                on('finish', function() {
                    console.log(meta.name + ' stored in DB!');
                    fs.unlink(filepath);//Delete file from server directory!
                    //process.exit(0);
                });
    });
}

function deleteFile(filename) {
    console.log("Inside deleteFile-----------------");
    
    mongodb.MongoClient.connect(uri, function(error, db) {
        assert.ifError(error);
        var file = db.collection('fs.files').findOne({filename : filename});
        
        var bucket = new mongodb.GridFSBucket(db);
            
        console.log(file);
        bucket.Delete(file.id);
        
        var filespath = uploadPath + '/files/';
        fs.unlink(filespath + filename);//Delete file from server directory!
    });
}

function deleteAll(){
    console.log("Inside deleteAll-----------------");
    
    mongodb.MongoClient.connect(uri, function(error, db) {
        assert.ifError(error);

        var bucket = new mongodb.GridFSBucket(db);

        bucket.Drop();
    });
}
