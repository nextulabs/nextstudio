/*
    NextStudio
    Copyright (C) Nextulabs. All Rights Reserved.
    Please see associated licence for more details.
*/

// Defines the environment that allows for things to exist

var world;
var mouse = {
    x: null,
    y: null,
    button: null,
    focussedObject: null
};

importScripts(
    "raw.js",
    "ns.js"
);

// Demo stuff below ─ only temporary

world = new ns.World(null);

var background = new ns.shapes.Rectangle(world);

background.name = "Background";
background.x = 0;
background.y = 0;
background.width = world.width;
background.height = world.height;
background.style.fill = "red";
background.draggable = true;
background.prerender = function() {
    ns.shapes.Rectangle.prototype.prerender.call(this);

    this.width = world.width;
    this.height = world.height;
};

world.children.push(background);

for (var i = 0; i < 5; i++) {
    var card = new ns.shapes.Rectangle(world);

    (function(card) {
        card.name = "Card";
        card.x = 100 + (i * 25);
        card.y = 100 + (i * 25);
        card.width = 50;
        card.height = 50;
        card.style.fill = "#" + i + i + i + i + i + i;
        card.style.roundedCorners.topLeft = i * 5;
        card.style.roundedCorners.topRight = i * 5;
        card.style.roundedCorners.bottomLeft = i * 5;
        card.style.roundedCorners.bottomRight = i * 5;
        card.draggable = true;

        card.onClick = function() {
            card.delete();
        };
    
        card.onChildClick = function() {
            world.bringChildToFront(card);
        };
    
        world.children.push(card);

        var minicard = new ns.shapes.Rectangle(card);

        minicard.name = "Minicard";
        minicard.x = 10;
        minicard.y = 10;
        minicard.width = 10;
        minicard.height = 10;
        minicard.draggable = true;
        minicard.style.fill = "green";

        card.children.push(minicard);
    })(card);
}

// End of demo stuff

onmessage = function(event) {
    if (event.data.message == "screenSize") {
        _raw.graphics.screenSize.width = event.data.width;
        _raw.graphics.screenSize.height = event.data.height;
    }

    if (event.data.message == "mouse") {
        mouse.x = event.data.x;
        mouse.y = event.data.y;
        mouse.button = event.data.button;
    }

    if (event.data.message == "render") {
        _raw.graphics.resetRegion();
        _raw.graphics.drawRectangle(0, 0, _raw.graphics.screenSize.width, _raw.graphics.screenSize.height, 0, {fill: "black"});

        world.prerender();
        world.render();

        postMessage({
            message: "frame",
            frame: _raw.graphics.nextFrame
        });

        _raw.graphics.nextFrame = [];
    }
};