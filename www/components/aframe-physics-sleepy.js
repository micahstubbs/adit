// Make dynamic bodies idle when not grabbed

AFRAME.registerComponent('sleepy', {
  // Define component properties.
  schema: {default: 'grabbed'},
  
  dependencies: ['dynamic-body'],
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    this.onDrop = this.onDrop.bind(this);
    ////if (this.el.hasLoaded) {
    //  this.initBody();
    //} else {
    this.el.addEventListener('body-loaded', this.updateBody.bind(this));
    //}
  },
  
  updateBody: function(evt) {
    //this.physicsBody = this.el.components['dynamic-body'].body;
    this.physicsBody = evt.detail.body;
    this.physicsBody.sleep();
  },
  update: function() {
    //this.physicsBody = this.el.components['dynamic-body'].body;
    //this.physicsBody.sleep();
  },
  
  play: function () {
    this.el.addEventListener("stateremoved", this.onDrop);
  },
  
  pause: function () {
    this.el.removeEventListener("stateremoved", this.onDrop);
  },
  
  onDrop: function(evt) {
    if(evt.detail.state == this.data) {
      this.physicsBody.sleep();
    }
  }
});