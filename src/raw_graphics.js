/*
    NextStudio
    Copyright (C) Nextulabs. All Rights Reserved.
    Please see associated licence for more details.
*/

// Defines graphical functions and properties in the raw library, allows for interfacing with the main process's canvas

_raw.graphics = {};

_raw.graphics.screenSize = {
    width: null,
    height: null
};

_raw.graphics.nextFrame = [];

_raw.graphics.currentRegion = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
};

_raw.graphics.setRegion = function(x, y, width, height, absolute = false) {
    _raw.graphics.currentRegion = {
        x: absolute ? x : _raw.graphics.currentRegion.x + x,
        y: absolute ? y : _raw.graphics.currentRegion.y + y,
        width: width,
        height: height
    };

    _raw.graphics.nextFrame.push({
        message: "graphics_setRegion",
        ..._raw.graphics.currentRegion
    });
};

_raw.graphics.resetRegion = function() {
    _raw.graphics.currentRegion = {
        x: 0,
        y: 0,
        width: _raw.graphics.screenSize.width,
        height: _raw.graphics.screenSize.height
    };

    _raw.graphics.nextFrame.push({
        message: "graphics_resetRegion"
    });
};

_raw.graphics.drawRectangle = function(x, y, width, height, rotation, style = {}, absolute = false) {
    _raw.graphics.nextFrame.push({
        message: "graphics_drawRectangle",
        x: absolute ? x : _raw.graphics.currentRegion.x + x,
        y: absolute ? y : _raw.graphics.currentRegion.y + y,
        width: width,
        height: height,
        rotation: rotation,
        style: {
            fill: style.fill || "white",
            stroke: style.stroke || "transparent",
            roundedCorners: {
                topLeft: (style.roundedCorners || {}).topLeft || 0,
                topRight: (style.roundedCorners || {}).topRight || 0,
                bottomLeft: (style.roundedCorners || {}).bottomLeft || 0,
                bottomRight: (style.roundedCorners || {}).bottomRight || 0
            }
        }
    });
};