AFRAME.registerComponent('data-frame', {
  // Define component properties.
  schema: { },
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    // Do stuff using `this.el` and `this.data`.
    this.el.setAttribute("layout", "type: box; margin: .08");
    //this.el.setAttribute("geometry", "plane");
    //this.el.setAttribute("material", "side: double; color: white;");
    //this.el.setAttribute("mixin", "cube");
  }
});