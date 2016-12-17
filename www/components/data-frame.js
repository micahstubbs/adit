AFRAME.registerComponent('data-frame', {
  // Define component properties.
  schema: { 
    data: { default: [] },
    columnClass: { default: 'grabbable' },
    columnMixin: { default: 'datacolumn' },
    layout: { default: "type: box; margin: 0.15" }
  },
  
  dependencies: ["position"],
  /**
   * Run when component is attached.
   * @member {Element} el - Entity.
   * @member data - Component data.
   */
  init: function () {
    this.el.setAttribute("layout", this.data.layout);
    //this.myCols = [];
  },
  
  update: function() {
    var frameEl = this.el;
    var schemaDat = this.data;
    /*frameEl.childNodes.forEach(function(col) {
      if(col.nodeType == Node.ELEMENT_NODE &&
           col.hasAttribute('data-frame-column')) {
        frameEl.removeChild(col);
      }
    });*/
    
    while(frameEl.lastChild) {
      frameEl.lastChild.components['dynamic-body'].remove();
      frameEl.removeChild(frameEl.lastChild);
    }

    //this.myCols = schemaDat.data;
    schemaDat.data.forEach(function(c) {
      var newCol = document.createElement('a-plane');
      frameEl.appendChild(newCol);
      newCol.className = schemaDat.columnClass;
      newCol.setAttribute('data-frame-column', c);
      newCol.setAttribute('mixin', schemaDat.columnMixin);
    });
   
    //this.el.setAttribute("layout", schemaDat.layout);
    
  },
  
  updateData: function(newDat) {
    //if(this.el.hasAttribute('layout')) this.el.components.layout.remove();
    this.data.data = newDat;
    this.el.components.layout.children = [];
    this.update();
    this.el.components.layout.update();
    //this.el.setAttribute('layout', this.data.layout);
  }
});