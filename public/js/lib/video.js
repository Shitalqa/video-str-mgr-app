var video = (function () {
    return {
        list     : list,
        listDb   : listDb,
        upload   : upload,
//        deleteOne: deleteOne,
        request  : request,
        download : download
    };

    function deleteOne(){
//        deleteFile('nature.mp4');
        var name = 'nature.mp4';
        console.log("Client video.js :: deleteOne");
        console.log(name);
//        emitDbList('request', { name : name });
        emit('deleteFile', { name : name });
    }
    
    function listDb(cb) {
        console.log("Inside listDb ========== video-client");
        var stream = emitDbList('listDb');
        
        stream.on('data', function (data) {
            cb(null, data.files);
        });

        stream.on('error', cb);
//        var arrFName = emitDbList('listDbFilenames');
//        console.log(arrFName);
    }
    function list(cb) {
        var stream = emit('list');

        stream.on('data', function (data) {
            cb(null, data.files);
        });

        stream.on('error', cb);
    }

    function upload(file, cb) {
        var stream = emit('upload', {
            name  : file.name,
            size  : file.size,
            type  : file.type
        }, file);

        stream.on('data', function (data) {
            cb(null, data);
        });

        stream.on('error', cb);
    }

    function request(name) {
        console.log("Client video.js :: request");
        console.log(name);
//        emitDbList('request', { name : name });
        emit('request', { name : name });
    }

    function download(stream, cb) {
        var parts = [];

        stream.on('data', function (data) {
            parts.push(data);
        });

        stream.on('error', function (err) {
            cb(err);
        });

        stream.on('end', function () {
            var src = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));

            cb(null, src);
        });
    }
})();
