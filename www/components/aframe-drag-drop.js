// Allow scaling via two-handed grab and stretch

AFRAME.registerComponent('drag-drop', {
  // seletor to other controller
  schema: { 
            dropEvent: { default: 'dropped' },
            colliderState: { default: 'collided'},
            hoveredState: { default: 'hovered'}
  },
  
  dependencies: ['grab'],
  
  init: function () {
    this.hitEl = null;
    // keep tabs on next item hit when they overlap, so that it can 
    // be made the active target when the first is exited
    this.secondHitEl = null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    //this.onGripClose = this.onGripClose.bind(this);
  },
  

  play: function () {
    var el = this.el;
    el.addEventListener('hit', this.onHit);
    //el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    //el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
  //  el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('hit', this.onHit);
    //el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    //el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    //el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },


  onGripOpen: function (evt) {
    var hitEl = this.hitEl;
    var carried = this.carried;
    if (!hitEl) { return; }
    hitEl.emit(this.data.dropEvent, carried);
    carried.emit(this.data.dropEvent, hitEl);
    hitEl.removeState(this.data.hoveredState);
    this.hitEl = undefined;
    this.carried = undefined;
    this.secondHitEl = undefined;
  },

  onHit: function (evt) {
    var hitEl = evt.detail.el;
    var carried = this.el.components.grab.hitEl;
    // start hover when there is a hit, 
    // not currently hovering something else, and
    // have something grabbed,
    // and the grabbed thing is not the hit thing
    if (hitEl && carried && hitEl !== carried) {
      if(!this.hitEl) {
         hitEl.addState(this.data.hoveredState);
         this.hitEl = hitEl;
         this.carried = this.el.components.grab.hitEl;
         hitEl.addEventListener('stateremoved', this.unhover.bind(this));
      } else {
        //console.log("secondary hit", hitEl);
        this.secondHitEl = hitEl;
      }
    } 
  },
  
  unhover: function (evt) {
    if(evt.detail.state == this.data.colliderState) {
      evt.target.removeEventListener('stateremoved', this.unhover.bind(this));
      evt.target.removeState(this.data.hoveredState);
      this.hitEl = undefined;
      // activate backup target if present
      if(this.secondHitEl) {
        //console.log("fire backup")
        this.onHit({ detail: { el: this.secondHitEl } });
        this.secondHitEl = undefined;
      }
    }
  }
});

