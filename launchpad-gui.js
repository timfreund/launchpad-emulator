var SVGNS = "http://www.w3.org/2000/svg";

var launchpad = {};
launchpad.buttonDown = function(buttonId){
    console.log(buttonId + " pressed");
    var noteOnMessage = [0x90, buttonId, 0x7f];    
    for(var port of launchpad.outputs){
        port.send( noteOnMessage );
    }
};

launchpad.buttonUp = function(buttonId){
    console.log(buttonId + " released");
    var noteOnMessage = [0x90, buttonId, 0x00];    
    for(var port of launchpad.outputs){
        port.send( noteOnMessage );
    }
};

launchpad.receive = function(message){
    var str = "";
    for (var i=0; i < message.data.length; i++) {
        str += "0x" + message.data[i].toString(16) + " ";
    }
    console.log( str );

    if(message.data.length == 3){
        if(message.data[0] == 0x90){
            var button = document.getElementById("button" + message.data[1]);
            if(message.data[2] == 0){
                button.setAttribute("fill", "#aaa");
            } else {
                button.setAttribute("fill", "#f00");
            }
        }
    }
};

var keyMap = [
    Array.from(Array(8), (x, i) => 104 + i),
    Array.from(Array(9), (x, i) => 81 + i),
    Array.from(Array(9), (x, i) => 71 + i),
    Array.from(Array(9), (x, i) => 61 + i),
    Array.from(Array(9), (x, i) => 51 + i),
    Array.from(Array(9), (x, i) => 41 + i),
    Array.from(Array(9), (x, i) => 31 + i),
    Array.from(Array(9), (x, i) => 21 + i),
    Array.from(Array(9), (x, i) => 11 + i)
];    

function drawLaunchpad(div){
    var width = 110;
    var height = 110;
    
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", "0 0 " + width + " " + height);
    s.setAttribute("preserveAspectRatio", "xMinYMin meet");
    div.appendChild(s);

    var bg = document.createElementNS(SVGNS, "rect");
    bg.setAttribute("width", width);
    bg.setAttribute("height", height);
    bg.setAttribute("fill", "#333");

    s.appendChild(bg);
    
    for(var y = 0; y < keyMap.length; y++){
        for(var x = 0; x < keyMap[y].length; x++){
            var b = null;
            if(x == 8 || y == 0){
                b = document.createElementNS(SVGNS, "circle");
                b.setAttribute("cx", x * 12 + 5);
                b.setAttribute("cy", y * 12 + 5);
                b.setAttribute("r", 4);
            } else {
                b = document.createElementNS(SVGNS, "rect");
                b.setAttribute("x", x * 12);
                b.setAttribute("y", y * 12);
                b.setAttribute("width", 10);
                b.setAttribute("height", 10);
            }
            b.setAttribute("id", "button" + keyMap[y][x]);
            b.setAttribute("fill", "#aaa");
            b.onmousedown = (function(buttonId){
                return function(e){
                    launchpad.buttonDown(buttonId);
                }
            })(keyMap[y][x]);
            b.onmouseup = (function(buttonId){
                return function(e){
                    launchpad.buttonUp(buttonId);
                }
            })(keyMap[y][x]);
            s.appendChild(b);
        }
    }

    navigator.requestMIDIAccess( { sysex: false } ).then( onMIDISuccess, onMIDIFailure );
}


function onMIDISuccess( midiAccess ) {
    console.log( "MIDI ready!" );
    launchpad.midi = midiAccess;
    launchpad.outputs = [];

    var outdiv = document.getElementById("outputs");
    for(var entry of launchpad.midi.outputs){
        var port = entry[1];
        var devlink  = document.createElement("a");
        devlink.className = "connected";
        devlink.id = entry[0];
        devlink.onclick = (function(devid){
            return function(event){
                var devlink = document.getElementById(devid);
                for(var entry of launchpad.midi.outputs){
                    if(entry[0] == devid){
                        var p = entry[1];
                        if(p.connection == "open"){
                            p.close();
                            devlink.className="disconnected";
                        } else if(p.connection == "closed"){
                            p.open();
                            devlink.className="connected";
                        }
                    }
                }
            }
        })(entry[0]);
        devlink.innerHTML = port.name + "<br/>";
        outdiv.appendChild(devlink);
        var port = entry[1];
        port.open();
        launchpad.outputs.push(port);
    }

    var indiv = document.getElementById("inputs");
    for(var entry of launchpad.midi.inputs){
        var port = entry[1];
        var devlink = document.createElement("a");
        devlink.id = entry[0];
        devlink.onclick = function(event){
            console.log("clicked");
        };
        devlink.innerHTML = port.name + "<br/>";
        indiv.appendChild(devlink);
        port.onmidimessage = launchpad.receive;
    }
}

function onMIDIFailure(msg) {
    console.log( "Failed to get MIDI access - " + msg );
}

