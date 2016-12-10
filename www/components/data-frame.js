AFRAME.registerComponent('data-frame', {
  // Define component properties.
  schema: { 
    data: { default: [] },
    columnClass: { default: 'grabbable' },
    columnMixin: { default: 'data-column' }
  },
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    this.el.setAttribute("layout", "type: box; margin: .08;");
    this.myCols = [];
  },
  
  update: function() {
    var frameEl = this.el;
    var schemaDat = this.data;
    frameEl.childNodes.forEach(function(col) {
      if(col.nodeType == Node.ELEMENT_NODE &&
         col.hasAttribute('data-frame-column')) {
        col.components['data-frame-column'].remove();
        frameEl.removeChild(col);
      }
    });
    this.myCols = schemaDat.data;
    this.myCols.forEach(function(c) {
      newCol = document.createElement('a-plane');
      frameEl.appendChild(newCol);
      newCol.className = schemaDat.columnClass;
      newCol.setAttribute('data-frame-column', c);
      newCol.setAttribute('mixin', schemaDat.columnMixin);
    });
    
        var colliderEls = document.querySelectorAll('a-entity[sphere-collider]');
    colliderEls.forEach(function (collEl) {
      //if(coll.components[this.data.colliders].hasLoaded) {
        collEl.components['sphere-collider'].update();
      //}
    });
  },
  
  updateData: function(newDat) {
    this.data.data = newDat;
    this.update();
  }
});