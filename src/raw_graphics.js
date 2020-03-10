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
    height: 0,
    rotation: 0
};

_raw.graphics.rotateAroundPoint = function(x, y, cx, cy, rotation) {
    var radians = -rotation * (Math.PI / 180);
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);

    return {x: (cos * (x - cx)) + (sin * (y - cy)) + cx, y: (cos * (y - cy)) - (sin * (x - cx)) + cy};
};

_raw.graphics.setRegion = function(x, y, width, height, rotation, overflowable = false, absolute = false) {
    var rotatedPoint = _raw.graphics.rotateAroundPoint(
        _raw.graphics.currentRegion.x + x,
        _raw.graphics.currentRegion.y + y,
        _raw.graphics.currentRegion.x + (_raw.graphics.currentRegion.width / 2),
        _raw.graphics.currentRegion.y + (_raw.graphics.currentRegion.height / 2),
        _raw.graphics.currentRegion.rotation
    );

    _raw.graphics.currentRegion = {
        x: absolute ? x : rotatedPoint.x,
        y: absolute ? y : rotatedPoint.y,
        width: width,
        height: height,
        rotation: absolute ? rotation : _raw.graphics.currentRegion.rotation + rotation
    };

    if (!overflowable) {
        _raw.graphics.nextFrame.push({
            message: "graphics_setRegion",
            ..._raw.graphics.currentRegion
        });
    }
};

_raw.graphics.resetRegion = function() {
    _raw.graphics.currentRegion = {
        x: 0,
        y: 0,
        width: _raw.graphics.screenSize.width,
        height: _raw.graphics.screenSize.height,
        rotation: 0
    };

    _raw.graphics.nextFrame.push({
        message: "graphics_resetRegion"
    });
};

_raw.graphics.drawRectangle = function(x, y, width, height, rotation, style = {}, absolute = false) {
    var rotatedPoint = _raw.graphics.rotateAroundPoint(
        _raw.graphics.currentRegion.x + x,
        _raw.graphics.currentRegion.y + y,
        _raw.graphics.currentRegion.x + (_raw.graphics.currentRegion.width / 2),
        _raw.graphics.currentRegion.y + (_raw.graphics.currentRegion.height / 2),
        _raw.graphics.currentRegion.rotation
    );
    
    _raw.graphics.nextFrame.push({
        message: "graphics_drawRectangle",
        x: absolute ? x : rotatedPoint.x,
        y: absolute ? y : rotatedPoint.y,
        width: width,
        height: height,
        rotation: absolute ? rotation : _raw.graphics.currentRegion.rotation + rotation,
        style: {
            fill: style.fill || "white",
            stroke: style.stroke || "transparent",
            thickness: style.thickness || 0,
            roundedCorners: {
                topLeft: (style.roundedCorners || {}).topLeft || 0,
                topRight: (style.roundedCorners || {}).topRight || 0,
                bottomLeft: (style.roundedCorners || {}).bottomLeft || 0,
                bottomRight: (style.roundedCorners || {}).bottomRight || 0
            }
        }
    });
};