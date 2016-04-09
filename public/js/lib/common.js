var hostname, client;

var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
client   = new BinaryClient(host);

function fizzle(e) {
    e.preventDefault();
    e.stopPropagation();
}

function emit(event, data, file) {
    console.log("Common emit event = "+ event);
    console.log(data);
    console.log(file);
    file       = file || {};
    data       = data || {};
    data.event = event;

    return client.send(file, data);
}

function emitDbListbkp(event) {
    console.log("Common.js :: Inside emitDbList : Event= "+event);
    return client.send(event);
}
function emitDbList(event, data) {
    console.log("Common.js :: Inside emitDbList : Event= "+event);
    data       = data || {};
    data.event = event;
    return client.send(event, data);
}

