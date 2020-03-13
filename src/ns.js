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
        this.rotation = 0;
        this.visible = false;
        this.tangible = false;
        this.draggable = true;
        this.droppable = true;
        this.mouseDown = false;
        this.mouseHandleX = null;
        this.mouseHandleY = null;
        this.overflowable = false;
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

    setParent(newParent) {
        if (newParent != null) {
            if (this.parent != null) {
                if (mouse.focussedObject == this) {
                    mouse.focussedObject = world;
                }

                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            }

            newParent.children.push(this);
            this.parent = newParent;
        } else {
            throw new ReferenceError("Parent cannot be null");
        }
    }

    getAbsolutePosition(useRotation = true) {
        var familyTree = [];
        var currentThing = this;

        while (true) {
            familyTree.unshift(currentThing);
            currentThing = currentThing.parent;
            
            if (currentThing == null) {
                break;
            }
        }

        var currentRegion = {
            x: 0,
            y: 0,
            width: 0,
            height: 0, 
            rotation: 0
        };

        for (var i = 0; i < familyTree.length; i++) {
            var rotatedPoint = _raw.graphics.rotateAroundPoint(
                currentRegion.x + familyTree[i].x,
                currentRegion.y + familyTree[i].y,
                currentRegion.x + (currentRegion.width / 2),
                currentRegion.y + (currentRegion.height / 2),
                useRotation ? currentRegion.rotation : 0
            );

            currentRegion = {
                x: rotatedPoint.x,
                y: rotatedPoint.y,
                width: familyTree[i].width,
                height: familyTree[i].height,
                rotation: currentRegion.rotation + familyTree[i].rotation
            };

            if (i == familyTree.length - 1) {
                return {x: currentRegion.x, y: currentRegion.y, rotation: currentRegion.rotation};
            }
        }
    }

    getThingAtPosition(x, y, ignores = []) {
        // Go in reverse so that things that are layered in front are found first
        for (var i = this.children.length - 1; i >= 0; i--) {
            var currentThing = this.children[i].getThingAtPosition(x, y, ignores);

            if (currentThing != null) {
                return currentThing;
            }
        }

        // Lastly, detect to see if it's us who is the thing at the position
        if (
            ignores.indexOf(this) == -1 &&
            x >= this.getAbsolutePosition().x && y >= this.getAbsolutePosition().y && x < this.getAbsolutePosition().x + this.width && y < this.getAbsolutePosition().y + this.height &&
            (
                this.parent == null || this.parent.overflowable ||
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
        var parentMouseRotatedPoint = {};

        if (this.parent != null) {
            parentMouseRotatedPoint = _raw.graphics.rotateAroundPoint(
                mouse.x - this.parent.getAbsolutePosition().x,
                mouse.y - this.parent.getAbsolutePosition().y,
                this.parent.width / 2,
                this.parent.height / 2,
                -this.parent.getAbsolutePosition().rotation
            );

            parentMouseRotatedPoint = {
                x: this.parent.getAbsolutePosition().x + parentMouseRotatedPoint.x,
                y: this.parent.getAbsolutePosition().y + parentMouseRotatedPoint.y
            };
        } else {
            mouseRotatedPoint = {x: 0, y: 0};
        }

        var mouseRotatedPoint = _raw.graphics.rotateAroundPoint(
            mouse.x - this.getAbsolutePosition().x,
            mouse.y - this.getAbsolutePosition().y,
            this.width / 2,
            this.height / 2,
            -this.getAbsolutePosition().rotation
        );

        mouseRotatedPoint = {
            x: this.getAbsolutePosition().x + mouseRotatedPoint.x,
            y: this.getAbsolutePosition().y + mouseRotatedPoint.y
        };

        if (this.tangible && (mouse.focussedObject == null || mouse.focussedObject == this)) {
            if (this != world && this.mouseDown && this.draggable && this.droppable) {
                // FIXME: Make dropping stick position when ancestors are moved

                this.x = mouse.x - this.mouseHandleX;
                this.y = mouse.y - this.mouseHandleY;
            } else if (this != world && this.mouseDown && this.draggable) {
                this.x = parentMouseRotatedPoint.x - this.parent.getAbsolutePosition().x - this.mouseHandleX;
                this.y = parentMouseRotatedPoint.y - this.parent.getAbsolutePosition().y - this.mouseHandleY;
            } else if (world.getThingAtPosition(mouse.x, mouse.y) == this) {
                this.mouseHandleX = mouseRotatedPoint.x - this.getAbsolutePosition().x;
                this.mouseHandleY = mouseRotatedPoint.y - this.getAbsolutePosition().y;

                this.onHover(this.mouseHandleX, this.mouseHandleY);

                if (mouse.button != null) {
                    if (this.droppable) {
                        this.setParent(world);
                    }

                    mouse.focussedObject = this;

                    this.onMouseDown(this.mouseHandleX, this.mouseHandleY);

                    if (!this.mouseDown) {
                        this.onClick(this.mouseHandleX, this.mouseHandleY);

                        this.mouseDown = true;
                    }
                }
            } else if (this != world && world.getThingAtPosition(mouseRotatedPoint.x, mouseRotatedPoint.y) != null && world.getThingAtPosition(mouseRotatedPoint.x, mouseRotatedPoint.y).hasParent(this)) {
                this.mouseHandleX = mouseRotatedPoint.x - this.getAbsolutePosition().x;
                this.mouseHandleY = mouseRotatedPoint.y - this.getAbsolutePosition().y;

                this.onChildHover(this.mouseHandleX, this.mouseHandleY);

                if (mouse.button != null) {
                    if (world.getThingAtPosition(mouseRotatedPoint.x, mouseRotatedPoint.y).draggable == false) {
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

                if (this.droppable) {
                    this.setParent(world.getThingAtPosition(mouse.x, mouse.y, [this]));
                    
                    this.x = this.x - this.parent.getAbsolutePosition().x;
                    this.y = this.y - this.parent.getAbsolutePosition().y;
                }
            }
        }

        this.children.forEach(function(child) {
            child.prerender();
        });
    }

    render() {
        var thisScope = this;

        if (this.visible) {
            this.children.forEach(function(child) {
                _raw.graphics.setRegion(thisScope.x, thisScope.y, thisScope.width, thisScope.height, thisScope.rotation, thisScope.overflowable);
                child.render();
                _raw.graphics.resetRegion();
            });
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