AFRAME.registerComponent('drop-target', {
  // Define component properties.
  schema: {},
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    // Do stuff using `this.el` and `this.data`.
    this.el.addEventListener("dropped", function(e){console.log(e)});
  }
});