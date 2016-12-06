// Make dynamic bodies idle when not grabbed

AFRAME.registerComponent('sleepy', {
  schema: {
    speedLimit: {default: null, type: 'number'},
    delay: {default: null, type: 'number'},
    linearDamping: {default: null, type: 'number'},
    angularDamping: {default: null, type: 'number'}
  },
  
  dependencies: ['dynamic-body'],

  init: function () {
    if (this.el.body) {
      this.updateBody();
    } else {
      this.el.addEventListener('body-loaded', this.updateBody.bind(this));
    }
    this.play();
    
  },
  
  updateBody: function() {
    this.el.body.sleepSpeedLimit = this.data.speedLimit || 
      this.system.data.speedLimit;
    this.el.body.sleepTimeLimit = this.data.delay ||
      this.system.data.delay;
    this.el.body.linearDamping = this.linearDamping ||
      this.system.data.linearDamping;
    this.el.body.angularDamping = this.linearDamping ||
      this.system.data.angularDamping;
    this.el.body.allowSleep = true;
    this.resumeState({detail: {state: this.system.HOLDSTATE}});
  },
  
  update: function() {
    if(this.el.body) this.updateBody();
  },
  
  play: function () {
    this.el.addEventListener('stateadded', this.holdState.bind(this));
    this.el.addEventListener('stateremoved', this.resumeState.bind(this));
  },
  
  pause: function () {
    this.el.removeEventListener('stateadded', this.pauseState.bind(this));
    this.el.addEventListener('stateremoved', this.resumeState.bind(this));
  },
  // disble the sleeping while grabbed because sleep will break constraints
  holdState: function(evt) {
    if(evt.detail.state == this.system.data.HOLDSTATE) {
       this.el.body.allowSleep = false;
    }
  },
  
  resumeState: function(evt) {
    if(evt.detail.state == this.system.data.HOLDSTATE) {
      this.el.body.allowSleep = true;
    }
  }

});


AFRAME.registerSystem('sleepy', {
  schema: {
    speedLimit: {default: 0.3},
    delay: {default: 0.5},
    linearDamping: {default: 0.8},
    angularDamping: {default: 0.0},
    HOLDSTATE: {default: 'grabbed'}
  },
  
  dependencies: ["physics"],
  
  init: function () {
    this.play();
  },
  
  play: function() {
    this.sceneEl.systems.physics.world.allowSleep = true;
  },
  
  pause: function() {
    this.sceneEl.systems.physics.world.allowSleep = false;
  }
});