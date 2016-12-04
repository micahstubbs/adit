// Make dynamic bodies idle when not grabbed

AFRAME.registerComponent('sleepy', {
  schema: {state: {default: 'grabbed'}},
  
  dependencies: ['dynamic-body'],

  init: function () {
    this.onDrop = this.onDrop.bind(this);
    if (this.el.body) {
      this.updateBody({body: this.el.body});
    } else {
      this.el.addEventListener('body-loaded', this.updateBody.bind(this));
    }
  },
  
  updateBody: function(evt) {
    console.log(this.el.body);
    this.physicsBody = evt.detail.body;
    this.physicsBody.collisionResponse = false;
    this.physicsBody.sleep();
  },
  update: function() {
    this.physicsBody = this.el.body;
  },
  
  play: function () {
    this.el.addEventListener("stateremoved", this.onDrop);
  },
  
  pause: function () {
    this.el.removeEventListener("stateremoved", this.onDrop);
  },
  
  onDrop: function(evt) {
    if(evt.detail.state == this.data.state) {
      this.physicsBody.sleep();
    }
  }
});