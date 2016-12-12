AFRAME.registerComponent('data-frame-column', {
  // Define component properties.
  schema: {
    data: { type: 'array' },
    name: { type: 'string' },
    type: { type: 'string' },
    dropEvent: { default: 'dropped' }
  },
  dependencies: ['position', 'rotation'],

  init: function () {
    var label = this.data.name,
        width = 0.5, height = 0.085;
    this.el.setAttribute('width' , width);
    this.el.setAttribute('height', height);
    this.text = document.createElement('a-entity');
    this.el.appendChild(this.text);
    this.text.setAttribute('scale', '0.2 0.2 0.2');
    this.text.setAttribute('position', 
                           (width / -2 + 0.01) + ' ' + 
                           (height / -2 + 0.01) + ' 0.002');

    if(this.data.type) label += ' (' + this.data.type + ')';
    this.text.setAttribute('bmfont-text', 'text: ' + label + "; width: 400");
    // define home state for animations
    /*this.anim = document.createElement('a-animation');
    this.anim.setAttribute('attribute', 'position');
    this.anim.setAttribute('to', AFRAME.utils.coordinates.stringify(this.homePos));
    this.anim.setAttribute('begin', 'never');
    this.el.appendChild(this.anim);
    this.el.addEventListener('animationstart', function(evt){console.log(evt);});
    this.el.addEventListener('animationend', function(evt){console.log(evt);});*/
    this.el.addEventListener('stateremoved', this.returnHome.bind(this));

  },
  
  update: function () {
    this.homePos = this.el.getComputedAttribute('position');
    this.homeRot = this.el.getComputedAttribute('rotation');
  },
  
  returnHome: function (evt) {
    if(evt.detail.state == 'grabbed') {
      this.el.body.sleep();
      this.el.setAttribute('position', this.homePos);
      this.el.setAttribute('rotation', this.homeRot);
      this.el.components['dynamic-body'].syncToPhysics();
      //this.anim.start();
    }
  }
});