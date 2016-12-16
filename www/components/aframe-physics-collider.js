AFRAME.registerComponent("physics-collider", {
  schema: {
    collidedState: { default: 'collided' }
  },
  init: function() {
    this.el.addEventListener("body-loaded", (evt) => {
      evt.detail.target.body.collisionResponse = false; 
    });
    this.collisions = [];
  },
  tick: function() {
    var collisions = [],
        colState = this.data.collidedState,
        el = this.el,
        body = el.body;
    if(!body) return;
    body.world.contacts.forEach( (contact) => {
      if(contact.bi === body) {
        handleHit(contact.bj.el);
        collisions.push(contact.bj.el);
      } else if(contact.bj === body) {
        handleHit(contact.bi.el);
        collisions.push(contact.bi.el);
      }
    });
    if (collisions.length === 0) { el.emit('hit', {el: null}); }
    // Update the state of the elements that are not intersected anymore.
    this.collisions.filter(function (el) {
      return collisions.indexOf(el) === -1;
    }).forEach(function removeState (el) {
      el.removeState(colState);
    });
    function handleHit (hitEl) {
        hitEl.emit('hit');
        hitEl.addState(colState);
        el.emit('hit', {el: hitEl});
    }
    
    this.collisions = collisions;
  }
});

