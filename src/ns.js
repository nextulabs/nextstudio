/*
    NextStudio
    Copyright (C) Nextulabs. All Rights Reserved.
    Please see associated licence for more details.
*/

// Defines the ns library

var ns = {};

ns.Thing = class {
    constructor(parent, children = []) {
        this.parent = parent;
        this.children = children;

        this.name = "Thing";
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.visible = false;
        this.tangible = false;
        this.draggable = true;
        this.mouseDown = false;
        this.mouseHandleX = null;
        this.mouseHandleY = null;
    }

    child(childName) {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].name == childName) {
                return this.children[i];
            }
        }
    }

    delete() {
        if (this.parent != null) {
            if (mouse.focussedObject == this) {
                mouse.focussedObject = world;
            }

            this.parent.children.splice(this.parent.children.indexOf(this), 1);
        } else {
            throw new ReferenceError("Cannot delete thing with no parent");
        }
    }

    getAbsolutePosition() {
        var currentThing = this;
        var x = 0;
        var y = 0;

        while (true) {
            x += currentThing.x;
            y += currentThing.y;

            currentThing = currentThing.parent;

            if (currentThing == null) {
                break;
            }
        }

        return {x: x, y: y};
    }

    getThingAtPosition(x, y) {
        // Go in reverse so that things that are layered in front are found first
        for (var i = this.children.length - 1; i >= 0; i--) {
            var currentThing = this.children[i].getThingAtPosition(x, y);

            if (currentThing != null) {
                return currentThing;
            }
        }

        // Lastly, detect to see if it's us who is the thing at the position
        if (
            x >= this.getAbsolutePosition().x && y >= this.getAbsolutePosition().y && x < this.getAbsolutePosition().x + this.width && y < this.getAbsolutePosition().y + this.height &&
            (
                this.parent == null ||
                (x >= this.parent.getAbsolutePosition().x && y >= this.parent.getAbsolutePosition().y && x < this.parent.getAbsolutePosition().x + this.parent.width && y < this.parent.getAbsolutePosition().y + this.parent.height)
            )
        ) {
            return this;
        }
    }

    hasParent(parent) {
        if (parent == null) {return false;}

        var currentThing = this;
        
        while (true) {
            currentThing = currentThing.parent;

            if (currentThing == parent) {
                return true;
            } else if (currentThing == null) {
                return false;
            }
        }
    }

    bringChildFromTo(from, to) {
        if (to > 0 && to < this.children.length) {
            this.children.splice(to, 0, this.children.splice(from, 1)[0]);
        }
    }

    bringChildToFront(child) {
        if (this.children.indexOf(child) > -1) {
            this.bringChildFromTo(this.children.indexOf(child), this.children.length - 1);

        } else {
            throw new ReferenceError(`"${child.name}" is not a child of "${this.name}"`);
        }
    }

    sendChildToBack(child) {
        if (this.children.indexOf(child) > -1) {
            this.bringChildFromTo(this.children.indexOf(child), 0);
        } else {
            throw new ReferenceError(`"${child.name}" is not a child of "${this.name}"`);
        }
    }

    // Index can be negative to send the child backwards
    // If the child is already at the front or back, nothing will happen
    bringChildForwardBy(child, index) {
        if (this.children.indexOf(child) > -1) {
            this.bringChildFromTo(this.children.indexOf(child), this.children.indexOf(child) + index);
        } else {
            throw new ReferenceError(`"${child.name}" is not a child of "${this.name}"`);
        }
    }

    onHover(relativeX, relativeY) {}
    onMouseDown(relativeX, relativeY) {}
    onClick(relativeX, relativeY) {}
    onChildHover(relativeX, relativeY) {}
    onChildMouseDown(relativeX, relativeY) {}
    onChildClick(relativeX, relativeY) {}

    prerender() {
        if (this.tangible && (mouse.focussedObject == null || mouse.focussedObject == this)) {
            if (this.mouseDown && this.draggable) {
                this.x = mouse.x - this.parent.getAbsolutePosition().x - this.mouseHandleX;
                this.y = mouse.y - this.parent.getAbsolutePosition().y - this.mouseHandleY;
            } else if (world.getThingAtPosition(mouse.x, mouse.y) == this) {
                this.mouseHandleX = mouse.x - this.getAbsolutePosition().x;
                this.mouseHandleY = mouse.y - this.getAbsolutePosition().y;

                this.onHover(this.mouseHandleX, this.mouseHandleY);

                if (mouse.button != null) {
                    mouse.focussedObject = this;

                    this.onMouseDown(this.mouseHandleX, this.mouseHandleY);

                    if (!this.mouseDown) {
                        this.onClick(this.mouseHandleX, this.mouseHandleY);

                        this.mouseDown = true;
                    }
                }
            } else if (this != world && world.getThingAtPosition(mouse.x, mouse.y).hasParent(this)) {
                this.mouseHandleX = mouse.x - this.getAbsolutePosition().x;
                this.mouseHandleY = mouse.y - this.getAbsolutePosition().y;

                this.onChildHover(this.mouseHandleX, this.mouseHandleY);

                if (mouse.button != null) {
                    if (world.getThingAtPosition(mouse.x, mouse.y).draggable == false) {
                        mouse.focussedObject = this;
                    }

                    this.onChildMouseDown(this.mouseHandleX, this.mouseHandleY);

                    if (!this.mouseDown) {
                        this.onChildClick(this.mouseHandleX, this.mouseHandleY);

                        this.mouseDown = true;
                    }
                }
            }
        }

        if (mouse.button == null) {
            this.mouseDown = false;
            this.mouseHandleX = null;
            this.mouseHandleY = null;

            if (mouse.focussedObject == this) {
                mouse.focussedObject = null;
            }
        }

        this.children.forEach(function(child) {
            child.prerender();
        });
    }

    render() {
        var thisScope = this;

        if (this.visible) {
            _raw.graphics.setRegion(thisScope.x, thisScope.y, thisScope.width, thisScope.height);
            this.children.forEach(function(child) {
                child.render();
            });
            
            _raw.graphics.resetRegion();
        }
    }
};

ns.World = class extends ns.Thing {
    constructor(parent, children = []) {
        super(parent, children);

        this.name = "World";
        this.x = 0;
        this.y = 0;
        this.width = _raw.graphics.screenSize.width;
        this.height = _raw.graphics.screenSize.height;
        this.visible = true;
        this.tangible = true;
    }

    prerender() {
        this.x = 0;
        this.y = 0;
        this.width = _raw.graphics.screenSize.width;
        this.height = _raw.graphics.screenSize.height;

        super.prerender();
    }

    render() {
        super.render();
    }
};

importScripts(
    "ns_shapes.js"
);