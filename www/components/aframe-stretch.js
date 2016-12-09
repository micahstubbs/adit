// Allow scaling via two-handed grab and stretch

AFRAME.registerComponent('stretch', {
  // seletor to other controller
  schema: {},
  
  dependencies: ['grab'],
  
  init: function () {
    this.GRABBED_STATE = 'grabbed';
    this.STRETCHED_STATE = 'stretched';

    this.grabbing = false;
    this.hitEl = null;
    this.otherController = null;
    
    if (this.el.sceneEl.hasLoaded) {
      this.findOtherController();
    } else {
      this.el.sceneEl.addEventListener('loaded', 
        this.findOtherController.bind(this));
    }
    
    //this.physics = this.el.sceneEl.systems.physics;
    //this.constraint = null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
  },
  
  findOtherController: function () {
    
    me = this.el.components["tracked-controls"].controller;
    controllers = document.querySelectorAll("[tracked-controls]");
    for(var [id, node] of controllers.entries()) { 
      if(node !== this.el) this.otherController = node;
    }
  },

  play: function () {
    var el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function (evt) {
    this.grabbing = true;
    delete this.previousStretch;
  },

  onGripOpen: function (evt) {
    var hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) { return; }
    hitEl.removeState(this.STRETCHED_STATE);
    this.hitEl = undefined;
  },

  onHit: function (evt) {
    var hitEl = evt.detail.el;
    // start stretch when there is a hit, the trigger is down,
    // don't already have something grabbed, and the same target
    // is grabbed by the other controller
    if(hitEl && this.grabbing && !this.hitEl &&
        !this.el.components.grab.hitEl &&
       !hitEl.is(this.STRETCHED_STATE) &&
       hitEl === this.otherController.components.grab.hitEl) {
         hitEl.addState(this.STRETCHED_STATE);
         this.hitEl = hitEl;
       }
  },
  
  tick: function () {
    var hitEl = this.hitEl;
    if (!hitEl) { return; }
    var scale;
    this.updateDelta();
    scale = hitEl.getComputedAttribute('scale');
    hitEl.setAttribute('scale', {
      x: scale.x * this.deltaStretch,
      y: scale.y * this.deltaStretch,
      z: scale.z * this.deltaStretch
    });
    //temporary hack: force recreation of the physics body
    //with the new scale. appears to have a cumulative 
    //performance impact
    if(hitEl.components['dynamic-body']) {
      var bodycomp = hitEl.components['dynamic-body'];
      bodycomp.system.removeBody(bodycomp.body);
      //bodycomp.el.sceneEl.object3D.remove(bodycomp.wireframe);
      bodycomp.initBody();
    }

  },

  updateDelta: function () {
    var currentPosition = new THREE.Vector3();
    currentPosition.copy(this.el.getComputedAttribute('position'));
    var otherHandPos = new THREE.Vector3();
    otherHandPos.copy(this.otherController.getComputedAttribute('position'));
    var currentStretch = currentPosition.distanceTo(otherHandPos);
    var previousStretch = this.previousStretch || currentStretch;
    var deltaStretch = currentStretch / previousStretch;
    this.previousStretch = currentStretch;
    this.deltaStretch = deltaStretch;
  }
});

