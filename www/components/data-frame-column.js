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
    this.anim = document.createElement('a-animation');
    this.anim.setAttribute('attribute', 'position');
    this.anim.setAttribute('to', AFRAME.utils.coordinates.stringify(this.homePos));
    this.anim.setAttribute('begin', this.data.dropEvent);
    this.el.appendChild(this.anim);
    
  },
  
  update: function () {
    //this.el.emit('model-loaded');
  },
  
  returnHome: function () {
    
  }
});