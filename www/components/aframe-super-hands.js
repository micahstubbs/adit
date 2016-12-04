/* global AFRAME */
  
  /**
  * Component for hand controls that enables grabbing entities 
  * with relevant components for:
  * Moving (moveable)
  * Drag & drop interactions (droptarget)
  * Stretching (stretchable)
  * Spinning (spinable)
*/
  AFRAME.registerComponent('super-hands', {
    init: function () {
      this.GRABBED_STATE = 'grabbed';
      // todo: read collider state name from entity.components
      this.HOVERED_STATE = 'collided'; //must match collider component
      // Bind event handlers
      this.onHit = this.onHit.bind(this);
      this.onGripOpen = this.onGripOpen.bind(this);
      this.onGripClose = this.onGripClose.bind(this);
    },
    
    play: function () {
      var el = this.el;
      el.addEventListener('hit', this.onHit);
      el.addEventListener('gripclose', this.onGripClose);
      el.addEventListener('gripopen', this.onGripOpen);
      el.addEventListener('thumbup', this.onGripClose);
      el.addEventListener('thumbdown', this.onGripOpen);
      el.addEventListener('pointup', this.onGripClose);
      el.addEventListener('pointdown', this.onGripOpen);
    },
    
    pause: function () {
      var el = this.el;
      el.removeEventListener('hit', this.onHit);
      el.removeEventListener('gripclose', this.onGripClose);
      el.removeEventListener('gripopen', this.onGripOpen);
      el.removeEventListener('thumbup', this.onGripClose);
      el.removeEventListener('thumbdown', this.onGripOpen);
      el.removeEventListener('pointup', this.onGripClose);
      el.removeEventListener('pointdown', this.onGripOpen);
    },
    
    onGripClose: function (evt) {
      this.grabbing = true;
      delete this.previousPosition;
      delete this.previousRotation;
    },
    
    onGripOpen: function (evt) {
      var hitEl = this.hitEl;
      this.grabbing = false;
      if(this.dropTarget) {
        if(this.dropTarget.is(this.HOVERED_STATE)) {
          this.dropTarget.emit("dropped", {item: this.hitEl});
        }
        this.dropTarget = undefined;
      }
      if (!hitEl) { return; }
      hitEl.removeState(this.GRABBED_STATE);
      this.hitEl = undefined;
    },
    
    onHit: function (evt) {
      var hitEl = evt.detail.el;

      // If no target or not grabbing, no action
      if (!hitEl || !this.grabbing) { 
        return; 
      }
      // IF second hand grabbing, enable stretch
      if(hitEl.is(this.GRABBED_STATE)) {
        // todo find a way to differentiate same v different hand
        return;
      }
      if(this.hitEl) {
        this.dropTarget = hitEl;
      } else {
        hitEl.addState(this.GRABBED_STATE);
        this.hitEl = hitEl;
      }
    },
    
    tick: function () {
      var hitEl = this.hitEl;
      //var position;
      var position = new THREE.Vector3();
      var rotation = new THREE.Vector3();
      if (!hitEl) { return; }
      this.updateDelta();
      //position = hitEl.getComputedAttribute('position');
      position.copy(hitEl.getComputedAttribute('position'));
      hitEl.setAttribute('position', position.add(this.deltaPosition));
      rotation.copy(hitEl.getComputedAttribute('rotation'));
      hitEl.setAttribute('rotation', rotation.add(this.deltaRotation));

    },
    
    updateDelta: function () {
      var currentPosition = new THREE.Vector3();
      currentPosition.copy(this.el.getComputedAttribute('position'));
      var currentRotation = new THREE.Vector3();
      currentRotation.copy(this.el.getComputedAttribute('rotation'));
      var previousPosition = this.previousPosition || currentPosition;
      var previousRotation = this.previousRotation || currentRotation;
      var deltaPosition = new THREE.Vector3();
      deltaPosition.subVectors(currentPosition, previousPosition);
      var deltaRotation = new THREE.Vector3();
      deltaRotation.subVectors(currentRotation, previousRotation);
      this.previousPosition = currentPosition;
      this.previousRotation = currentRotation;
      this.deltaPosition = deltaPosition;
      this.deltaRotation = deltaRotation;
    }
  });
