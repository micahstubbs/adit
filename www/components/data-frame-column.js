AFRAME.registerComponent('data-frame-column', {
  // Define component properties.
  schema: {
    data: { type: 'array' },
    name: { type: 'string' },
    type: { type: 'string' },
    dropEvent: { default: 'dropped' }
  },
  dependencies: ['position', 'rotation'],
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    // Do stuff using `this.el` and `this.data`.
    /*this.el.setAttribute("geometry",
          "primitive: plane; height: .075; width: .33;");
    this.el.setAttribute("material", "color: #A0A0A0; side: double;");
    this.el.setAttribute("draw", {background: "#A0A0A0"});*/
    this.el.setAttribute('width' , '0.3');
    this.el.setAttribute('height', '0.075');
    this.el.setAttribute("textwrap", {
      text: this.data.name.concat(" (", this.data.type, ")"),
      font: "48px serif",
      lineHeight: 50,
      y: 48
    });
    // define home state for animations
    this.homePos = this.el.getComputedAttribute('position');
    this.homeRot = this.el.getComputedAttribute('rotation');
    /*this.anim = document.createElement('a-animation');
    this.anim.setAttribute('attribute', 'position');
    this.anim.setAttribute('to', AFRAME.utils.coordinates.stringify(this.homePos));
    this.anim.setAttribute('begin', 'never');
    this.el.appendChild(this.anim);
    this.el.addEventListener('animationstart', function(evt){console.log(evt);});
    this.el.addEventListener('animationend', function(evt){console.log(evt);});*/
    this.el.addEventListener('stateremoved', this.returnHome.bind(this));
    this.el.addEventListener('schemachanged', this.physicsSync.bind(this));
    
  },
  
  update: function () {
    this.homePos = this.el.getComputedAttribute('position');
    this.homeRot = this.el.getComputedAttribute('rotation');

  },
  
  physicsSync: function (evt) {
    this.components['dynamic-body'].syncToPhysics();
  },
  
  returnHome: function (evt) {
    if(evt.detail.state == 'grabbed') {
      this.el.body.sleep();
      this.el.setAttribute('position', this.homePos);
      this.el.setAttribute('rotation', this.homeRot);
      //this.anim.start();
    }
  }
});