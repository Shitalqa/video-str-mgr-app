$(document).ready(function () {
    var $video, $box, $progress, $list, $listDb;

    $video    = $('#videoplay');
    $box      = $('#upload-box');
    $progress = $('#progress');
    $list     = $('#list');
    $listDb   = $('#listDb');

    $video.attr({
        controls : true,
        autoplay : true
    });

    client.on('open', function () {
        video.list(setupList);
        video.listDb(setupListDb);

        $box.on('dragenter', fizzle);
        $box.on('dragover', fizzle);
        $box.on('drop', setupDragDrop);
    });

    client.on('stream', function (stream) {
        video.download(stream, function (err, src) {
            console.log("mainjs video dwnload");
            console.log(src);
            $video.attr('src', src);
        });
    });

    function setupListDb(err, oFilesname) {
        console.log("main.j :: inside setupListDb");
        var $ul, $li;

        $listDb.empty();
        $ul   = $('<ul>').appendTo($listDb);

        oFilesname.forEach(function (file) {
            $li = $('<li>').appendTo($ul);
            $a  = $('<a>').appendTo($li);

            $a.attr('href', '#').text(file).click(function (e) {
                fizzle(e);
console.log("main.j :: inside setupListDb click request");
                var name = $(this).text();
                video.request(name);
            });
        });
    }
    function setupList(err, files) {
        var $ul, $li;

        $list.empty();
        $ul   = $('<ul>').appendTo($list);

        files.forEach(function (file) {
            $li = $('<li>').appendTo($ul);
            $a  = $('<a>').appendTo($li);

            $a.attr('href', '#').text(file).click(function (e) {
                fizzle(e);

                var name = $(this).text();
                video.request(name);
            });
        });
    }

    function setupDragDrop(e) {
        fizzle(e);

        var file, tx;

        file = e.originalEvent.dataTransfer.files[0];
        tx   = 0;

        video.upload(file, function (err, data) {
            var msg;

            if (data.end) {
                msg = "Upload complete: " + file.name;

                video.list(setupList);
            } else if (data.rx) {
                msg = Math.round(tx += data.rx * 100) + '% complete';

            } else {
                // assume error
                msg = data.err;
            }

            $progress.text(msg);
            
            if (data.end || data.err) {
                setTimeout(function () {
                    $progress.fadeOut(function () {
                        $progress.text('Drop file here');
                    }).fadeIn();
                }, 5000);
            }
        });
    }
});
