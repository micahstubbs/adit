AFRAME.registerComponent('data-frame', {
  // Define component properties.
  schema: { 
    data: { default: [] },
    columnClass: { default: 'grabbable' },
    columnMixin: { default: 'datacolumn' },
    layout: { default: "type: box; margin: 0.15" }
  },
  
  dependencies: ["position"],

  init: function () {
    this.el.setAttribute("layout", this.data.layout);
  },
  
  update: function() {
    var frameEl = this.el;
    var schemaDat = this.data;

    while(frameEl.lastChild) {
      frameEl.lastChild.components['dynamic-body'].remove();
      frameEl.removeChild(frameEl.lastChild);
    }

    schemaDat.data.forEach(function(c) {
      var newCol = document.createElement('a-plane');
      frameEl.appendChild(newCol);
      newCol.className = schemaDat.columnClass;
      newCol.setAttribute('data-frame-column', c);
      newCol.setAttribute('mixin', schemaDat.columnMixin);
    });
   
    
  },
  
  updateData: function(newDat) {
    this.data.data = newDat;
    this.el.components.layout.children = [];
    this.update();
  }
});