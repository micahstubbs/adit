// Allow drag-and-drop interactions

AFRAME.registerComponent('drag-drop', {
  // seletor to other controller
  schema: { 
            dropEvent: { default: 'dropped' },
            colliderState: { default: 'collided' },
            hoveredState: { default: 'hovered' },
            targets: { type: 'selectorAll' },
            targetClass: { default: "hoverable" }  
  },
  
  dependencies: ['grab'],
  
  init: function () {
    this.hitEls = [];

    // Bind event handlers
    this.unHover = this.unHover.bind(this);
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
  },
  

  play: function () {
    var el = this.el;
    el.addEventListener('hit', this.onHit);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('hit', this.onHit);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerup', this.onGripOpen);
  },


  onGripOpen: function (evt) {
    var hitEls = this.hitEls.slice();
    if(hitEls.length !== 0) {
      var hitEl = hitEls[0]; 
      var carried = this.carried;
      hitEl.emit(this.data.dropEvent, 
                 { drop: 'receive', dropped: carried, on: hitEl });
      if (carried) carried.emit(this.data.dropEvent, 
                                { drop: 'give', dropped: carried, on: hitEl });
      // clear list of backup targets to prevent triggering hover
      this.hitEls = [];
      var hoveredState = this.data.hoveredState;
      hitEls.forEach(function (x) {
        x.removeState(hoveredState);
      });
    }
    this.carried = undefined;
  },

  onHit: function (evt) {
    var hitEl = evt.detail.el;
    var carried = this.el.components.grab.hitEl;
    // start hover when there is a hit, 
    // the hit has the right class
    // have something grabbed,
    // and the grabbed thing is not the hit thing
    if (hitEl && hitEl.classList.contains(this.data.targetClass) && 
        carried && hitEl !== carried) {
      if (this.hitEls.indexOf(hitEl) === -1) { 
        this.hitEls.push(hitEl); 
        hitEl.addEventListener('stateremoved', this.unHover);
        // only initiate a hover if the pushed item is the first
        // this keeps from having multiple drop targets when they overlap
        if (this.hitEls.length === 1) {
           this.hover();
        }
      }
    } 
  },
  
  hover: function() {
    if(this.hitEls.length) {
      let hoverEl = this.hitEls[0];
      hoverEl.addState(this.data.hoveredState);
      this.carried = this.el.components.grab.hitEl;
    }
  },
  
  unHover: function (evt) {
    if (evt.detail.state == this.data.colliderState ||
        evt.detail.state == this.data.hoveredState) {
      let hoverIndex = this.hitEls.indexOf(evt.target);
      evt.target.removeEventListener('stateremoved', this.unHover);
      if (evt.target.is(this.data.hoveredState)) {
          evt.target.removeState(this.data.hoveredState);
      }
      if (hoverIndex > -1) { this.hitEls.splice(hoverIndex, 1); } 
      // activate backup target if present
      this.hover();
    }
  }
});

