/*
    NextStudio
    Copyright (C) Nextulabs. All Rights Reserved.
    Please see associated licence for more details.
*/

window.addEventListener("load", function() {
    var environment = new Worker("src/environment.js");
    var canvas = document.getElementById("screen");
    var context = canvas.getContext("2d");
    var svgMatrix = document.getElementById("svgMatrix").createSVGMatrix();

    var mouse = {x: null, y: null, button: null};

    context.save();

    function parseStyle(style) {
        var styleCommand = style.split(";");

        try {
            if (styleCommand[0] == "") {
                if (styleCommand[1] == "linearGradient") {
                    var gradient = context.createLinearGradient(Number(styleCommand[2]), Number(styleCommand[3]), Number(styleCommand[4]), Number(styleCommand[5]));
                    var gradientStops = styleCommand.splice(6);

                    for (var i = 0; i < gradientStops.length; i++) {
                        gradient.addColorStop(Number(gradientStops[i].split(":")[0]), gradientStops[i].split(":")[1]);
                    }

                    return gradient;
                } else if (styleCommand[1] == "radialGradient") {
                    var gradient = context.createLinearGradient(Number(styleCommand[2]), Number(styleCommand[3]), Number(styleCommand[4]), Number(styleCommand[5]), Number(styleCommand[6]), Number(styleCommand[7]));
                    var gradientStops = styleCommand.splice(8);

                    for (var i = 0; i < gradientStops.length; i++) {
                        gradient.addColorStop(Number(gradientStops[i].split(":")[0]), gradientStops[i].split(":")[1]);
                    }

                    return gradient;
                } else if (styleCommand[1] == "image") {
                    var image = new Image();

                    image.src = styleCommand[2];

                    var repeat = "repeat";

                    if (styleCommand[3] == "repeat") {repeat = "repeat"}
                    if (styleCommand[3] == "repeatX") {repeat = "repeat-x"}
                    if (styleCommand[3] == "repeatY") {repeat = "repeat-y"}
                    if (styleCommand[3] == "noRepeat") {repeat = "no-repeat"}

                    var pattern = context.createPattern(image, repeat);

                    pattern.setTransform(
                        svgMatrix
                            .translate(Number(styleCommand[4] || 0), Number(styleCommand[5] || 0))
                            .scaleNonUniform(Number(styleCommand[6] || 1), Number(styleCommand[7] || 1))
                            .rotate(Number(styleCommand[8] || 0))
                    );

                    return pattern;
                }
            }
        } catch (e) {}

        return style;
    }

    environment.onmessage = function(event) {
        if (event.data.message == "frame") {
            requestAnimationFrame(function() {
                for (var i = 0; i < event.data.frame.length; i++) {
                    var command = event.data.frame[i];
    
                    if (command.message == "graphics_setRegion") {
                        context.fillStyle = "transparent";
                        context.strokeStyle = "transparent";

                        context.translate(command.x + (command.width / 2), command.y + command.height / 2);
                        context.rotate(command.rotation * (Math.PI / 180));
                        context.translate(-command.x - (command.width / 2), -command.y - (command.height / 2));
                        
                        context.beginPath();
                        context.rect(command.x, command.y, command.width, command.height);
                        context.clip();

                        context.translate(command.x + (command.width / 2), command.y + command.height / 2);
                        context.rotate(-command.rotation * (Math.PI / 180));
                        context.translate(-command.x - (command.width / 2), -command.y - (command.height / 2));
                    }
            
                    if (command.message == "graphics_resetRegion") {
                        context.restore();
                        context.save();
                    }
            
                    if (command.message == "graphics_drawRectangle") {
                        context.fillStyle = parseStyle(command.style.fill);
                        context.strokeStyle = parseStyle(command.style.stroke);
                        context.lineWidth = command.style.thickness;

                        context.translate(command.x + (command.width / 2), command.y + (command.height / 2));
                        context.rotate(command.rotation * (Math.PI / 180));
                        context.translate(-command.x - (command.width / 2), -command.y - (command.height / 2));

                        context.beginPath();
                        context.moveTo(command.x + command.style.roundedCorners.topLeft, command.y);
                        context.lineTo(command.x + command.width - command.style.roundedCorners.topRight, command.y);
                        context.quadraticCurveTo(command.x + command.width, command.y, command.x + command.width, command.y + command.style.roundedCorners.topRight);
                        context.lineTo(command.x + command.width, command.y + command.height - command.style.roundedCorners.bottomRight);
                        context.quadraticCurveTo(command.x + command.width, command.y + command.height, command.x + command.width - command.style.roundedCorners.bottomRight, command.y + command.height);
                        context.lineTo(command.x + command.style.roundedCorners.bottomLeft, command.y + command.height);
                        context.quadraticCurveTo(command.x, command.y + command.height, command.x, command.y + command.height - command.style.roundedCorners.bottomLeft);
                        context.lineTo(command.x, command.y + command.style.roundedCorners.topLeft);
                        context.quadraticCurveTo(command.x, command.y, command.x + command.style.roundedCorners.topLeft, command.y);
                        context.closePath();

                        context.fill();
                        context.stroke();

                        context.translate(command.x + (command.width / 2), command.y + (command.height / 2));
                        context.rotate(-command.rotation * (Math.PI / 180));
                        context.translate(-command.x - (command.width / 2), -command.y - (command.height / 2));
                    }
                }
            });
        }
    };

    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;

    window.addEventListener("resize", function() {
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
    });

    window.addEventListener("mousedown", function() {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.button = "click";
    });

    window.addEventListener("contextmenu", function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.button = "menu";

        event.preventDefault();
    });

    window.addEventListener("mousemove", function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener("mouseup", function() {
        mouse.button = null;
    });

    window.addEventListener("touchstart", function() {
        mouse.x = event.changedTouches[0].clientX;
        mouse.y = event.changedTouches[0].clientY;
        mouse.button = "touch";
    });

    window.addEventListener("touchmove", function(event) {
        mouse.x = event.changedTouches[0].clientX;
        mouse.y = event.changedTouches[0].clientY;
        mouse.button = "touch";
    });

    window.addEventListener("touchend", function() {
        mouse.button = null;
    });

    setInterval(function() {        
        environment.postMessage({
            message: "screenSize",
            width: context.canvas.width,
            height: context.canvas.height
        });

        environment.postMessage({
            message: "mouse",
            ...mouse
        });

        environment.postMessage({
            message: "render"
        });
    });
});