// Allow scaling via two-handed grab and stretch

AFRAME.registerComponent('stretch', {
  // seletor to other controller
  schema: {type: 'selector'},
  
  init: function () {
    this.GRABBED_STATE = 'grabbed';
    this.STRETCHED_STATE = 'stretched';

    this.grabbing = false;
    this.hitEl = null;
    this.otherController = this.data;
    //this.physics = this.el.sceneEl.systems.physics;
    //this.constraint = null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);
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
    //this.physics.world.removeConstraint(this.constraint);
    //this.constraint = null;
  },

  onHit: function (evt) {
    var hitEl = evt.detail.el;
    // No action if: no target, other controller not already grabbing
    // target already being stretched, 
    // target not already grabbed by other controller, 
    // trigger not down, or another target already acquired
    if (!hitEl || !this.otherController.components.grab.grabbing ||
          hitEl.is(this.STRETCHED_STATE) || 
          !hitEl.is(this.GRABBED_STATE) ||
          !this.grabbing || this.hitEl) { 
            return; 
    }
    hitEl.addState(this.STRETCHED_STATE);
    this.hitEl = hitEl;
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

