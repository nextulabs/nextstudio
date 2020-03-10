/*
    NextStudio
    Copyright (C) Nextulabs. All Rights Reserved.
    Please see associated licence for more details.
*/

// Defines shapes that are contained in the ns library

ns.shapes = {};

ns.shapes.Shape = class extends ns.Thing {
    constructor(parent, children = []) {
        super(parent, children);

        this.name = "Shape";
        this.visible = true;
        this.tangible = true;

        this.style = {};
        this.style.fill = "red";
        this.style.stroke = "white";
        this.style.thickness = 0;
    }
};

ns.shapes.Rectangle = class extends ns.shapes.Shape {
    constructor(parent, children = []) {
        super(parent, children);

        this.name = "Rectangle";
        this.visible = true;
        this.tangible = true;

        this.style.roundedCorners = {};
        this.style.roundedCorners.topLeft = 0;
        this.style.roundedCorners.topRight = 0;
        this.style.roundedCorners.bottomLeft = 0;
        this.style.roundedCorners.bottomRight = 0;
    }

    render() {
        if (this.visible) {
            _raw.graphics.drawRectangle(this.x, this.y, this.width, this.height, this.rotation, this.style);

            super.render();
        }
    }
};