AFRAME.registerComponent('data-frame-column', {
  // Define component properties.
  schema: {
    data: { type: 'array' },
    name: { type: 'string' },
    type: { type: 'string' }
  },
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    // Do stuff using `this.el` and `this.data`.
    this.el.setAttribute("geometry",
          "primitive: plane; height: .075; width: .33;");
    this.el.setAttribute("material", "color: #A0A0A0; side: both;");
    this.el.setAttribute("draw", {background: "#A0A0A0"});
    this.el.setAttribute("textwrap", {
      text: this.data.name.concat(" (", this.data.type, ")"),
      font: "48px serif",
      lineHeight: 50,
      y: 48
    });
  
  }
});