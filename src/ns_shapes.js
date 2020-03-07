/*
    NextStudio
    Copyright (C) Nextulabs. All Rights Reserved.
    Please see associated licence for more details.
*/

// Defines shapes that are contained in the ns library

ns.shapes = {};

ns.shapes.Shape = class extends ns.Thing {};

ns.shapes.Rectangle = class extends ns.shapes.Shape {
    constructor(parent, children = []) {
        super(parent, children);

        this.name = "Rectangle";
        this.visible = true;
        this.tangible = true;

        this.options = {
            fill: "red",
            stroke: "white",
            thickness: 1
        };
    }

    render() {
        if (this.visible) {
            _raw.graphics.drawRectangle(this.x, this.y, this.width, this.height, this.options);

            super.render();
        }
    }
};