AFRAME.registerComponent('plot-axis', {
  // Define component properties.
  schema: {
    axis: { default: 'x' },
    material: { default: 'color: white' },
    size: { default: 1 },
    hoverState: { default: 'collided' },
    hoverClass: { default: 'hoverable' },
    collider: { default: 'sphere-collider' }
  },


  init: function () {
    // counter keeps hover events working when the collide zones overlap
    this.numHovered = 0;

    this.axis = document.createElement("a-entity");
    this.mirror = document.createElement("a-entity");
    this.axis.className = this.data.hoverClass;
    this.mirror.className = this.data.hoverClass;
    this.el.appendChild(this.axis);
    this.el.appendChild(this.mirror);
    var myGeom = { primitive: 'plane',
               buffer: false, 
               skipCache: true,
               width: this.data.size,
               height: this.data.size };

    var pos = { x: 0, y: -1 * this.data.size / 2, z: 0 };
    var rot = { x: -90, y: 0, z: 0};
    this.axis.setAttribute('geometry', myGeom);
    this.axis.setAttribute('material', this.data.material);
    this.axis.setAttribute('material', 'visible', false);
    this.axis.setAttribute('position', pos);
    this.axis.setAttribute('rotation', rot);

                               
    var pos2 = { x: 0, y: pos.y * -1, z: 0 };
    var rot2 = { x: rot.x * -1, y: 0, z: 0};
    this.mirror.setAttribute("geometry", myGeom);
    this.mirror.setAttribute('material', this.data.material);
    this.mirror.setAttribute('material', 'visible', false);
    this.mirror.setAttribute("position", pos2);
    this.mirror.setAttribute("rotation", rot2);


    var collider = this.data.collider; 
    var colliderEls = document.querySelectorAll('[' + collider + ']');
    colliderEls.forEach(function (collEl) {
      //if(coll.components[this.data.colliders].hasLoaded) {
        collEl.components[collider].update();
      //}
    });

  },
  
  play: function () {
    this.axis.addEventListener('stateadded', 
                               this.hover.bind(this));
    this.axis.addEventListener('stateremoved', 
                               this.unHover.bind(this));
    this.mirror.addEventListener('stateadded', 
                                 this.hover.bind(this));
    this.mirror.addEventListener('stateremoved', 
                                 this.unHover.bind(this));
  },
  pause: function () {
    this.axis.removeEventListener('stateadded', 
                                  this.hover.bind(this));
    this.axis.removeEventListener('stateremoved', 
                                  this.unHover.bind(this));
    this.mirror.removeEventListener('stateadded', 
                                    this.hover.bind(this));
    this.mirror.removeEventListener('stateremoved', 
                                    this.unHover.bind(this));    
  },
  
  hover: function (evt) {
    if (evt.detail.state == this.data.hoverState) {
      this.numHovered++;
      this.axis.setAttribute('material', 'visible', true);
      this.mirror.setAttribute('material', 'visible', true);
    }
  },
  unHover: function(evt) {
    if (evt.detail.state == this.data.hoverState &&
          --this.numHovered === 0) {
      this.axis.setAttribute('material', 'visible', false);
      this.mirror.setAttribute('material', 'visible', false);
    }
  }
});

