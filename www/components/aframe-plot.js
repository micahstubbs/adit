AFRAME.registerComponent('plot', {
  schema: { 
    size: { default: 0.5 },
    points: { default: [] },
    xname: {default: '' },
    xlabels: { default: [] },
    xbreaks: { default: [] },
    yname: {default: ''},
    ylabels: { default: [] },
    ybreaks: { default: [] },
    zname: {default: ''},
    zlabels: { default: [] },
    zbreaks: { default: [] },
    colorname: { default: '' },
    colorbreaks: { default: [] },
    colorlabels: { default: [] },
    shapename: { default: '' },
    shapebreaks: { default: [] },
    shapelabels: { default: [] },
    sizename: { default: '' },
    sizebreaks: { default: [] },
    sizelabels: { default: [] }
  },
  init: function() {
    var self = this;
    var size = this.data.size;
    this.updatePending = false;
    self.axes = [];
    this.guides = [];
    //register plotting area
    this.plotArea = document.createElement('a-entity');
    this.el.appendChild(this.plotArea);
    this.plotArea.setAttribute('plot-area', '');
    // register axes
    ['x', 'y', 'z'].forEach(function (axis) {
      var axEl = document.createElement('a-entity');
      self.el.appendChild(axEl);
      axEl.setAttribute('plot-axis', { axis: axis, size: size });
      axEl.plotEl = self.el;
      self.axes.push(axEl);
    });
    this.guideArea = document.createElement('a-entity');
    this.el.append(this.guideArea);
    this.guideArea.setAttribute('position', {
      x: size / -2, y: size / -2, z: size / -2
    });
    this.guideArea.setAttribute('rotation', '0 -45 0');
    this.guideArea.setAttribute('layout', 
                                'type: box; margin: ' + ((size - 0.04) / 3));
    ['color', 'shape', 'size'].forEach( (guide) => {
      var guideEl = document.createElement('a-entity');
      this.guideArea.appendChild(guideEl);
      guideEl.setAttribute('plot-guide', { 
        aesthetic: guide, size: (size - 0.15) / 3
      });
      guideEl.plotEl = this.el;
      this.guides.push(guideEl);
    });
    // correct physics shape to not include scales/guides
    if (this.el.body) this.replacePhysicsBody(); else
      this.el.addEventListener(
        'body-loaded', 
        this.replacePhysicsBody.bind(this)
      );
  },
  
  update: function() {
    var dat = this.data;
    this.plotArea.setAttribute('plot-area', { points: this.data.points });
    this.axes.forEach( (ax) => {
      if(!ax.components['plot-axis'].data) {
        ax.addEventListener('loaded', this.updateScale); 
      } else {
        this.updateScale.bind(ax)();
      }
    });
    this.guides.forEach( (guide) => {
      if(!guide.components['plot-guide'].data) {
        guide.addEventListener('loaded', this.updateScale); 
        return; 
      }
      this.updateScale.bind(guide)();
    });
    
  },
  // called when bound to a child scale/guide element
  updateScale: function() {
    var type, attr, 
        mapping = this.axis,
        dat = this.plotEl.getComputedAttribute('plot');
    type = this.components['plot-axis'] ? 'plot-axis' : 'plot-guide';
    attr = this.getComputedAttribute(type);
    this.setAttribute(type, 
      AFRAME.utils.extend({}, attr, {
        breaks: dat[mapping + 'breaks'],
        labels: dat[mapping + 'labels'],
        name: dat[mapping + 'name']
      })
    );
  },
  // override automatic shape determination so that the bounding area
  // does not include children (guides/scales)
  replacePhysicsBody: function(evt) {
    if(evt && evt.target !== this.el) return;
    var shape,
        size = new THREE.Vector3(),
        geom = this.el.getComputedAttribute('geometry');
    size.multiplyVectors(
      this.el.getComputedAttribute('scale'),
      new THREE.Vector3(geom.width, geom.height, geom.depth).multiplyScalar(0.5)
    );
    shape = new CANNON.Box(new CANNON.Vec3().copy(size));
    this.el.body.shapeOffsets.pop();
    this.el.body.shapeOrientations.pop();
    this.el.body.shapes.pop();
    this.el.body.addShape(shape);  
    
  }
});

// manages scale labels and receiving user mapping input
AFRAME.registerComponent('plot-axis', {
  // Define component properties.
  schema: {
    axis: { default: 'x' },
    name: { default: '' },
    breaks: { default: [] },
    labels: { default: [] },
    fontScale: { default: 0.15 },
    material: { default: 'src: #arrow' },
    size: { default: 1 },
    hoverState: { default: 'hovered' },
    hoverClass: { default: 'hoverable' } 
  },
  init: function () {
    // create axis drop-targets for mapping UI
    var vec3 = AFRAME.utils.coordinates.parse;
    var pos = vec3('0 0 0'), 
        rot = vec3('0 0 0'), 
        pos2 = vec3('0 0 0'), 
        rot2 = vec3('0 0 0'),
        posscale = vec3('0 0 0'),
        rotscale = vec3('0 0 0'),
        posText = vec3('0 0 0'),
        rotText = vec3('0 0 0'),
        text,
        compDat = this.data;
    // counter keeps hover events working when the collide zones overlap
    this.numHovered = 0;
    this.el.axis = compDat.axis;
    this.axis = document.createElement('a-entity');
    this.el.appendChild(this.axis);
    this.mirror = document.createElement('a-entity');
    this.el.appendChild(this.mirror);
    this.axisScale = document.createElement('a-entity');
    this.el.appendChild(this.axisScale);
 
    makeAxis = function(el, pos, rot) {
      el.className = compDat.hoverClass;
      el.axis = compDat.axis;
      el.setAttribute('geometry', { primitive: 'plane',
                                    width: compDat.size,
                                    height: compDat.size });
      el.setAttribute('material', compDat.material);
      el.setAttribute('material', 'visible', false);
      el.setAttribute('position', pos);
      el.setAttribute('rotation', rot);
      el.setAttribute('static-body', '');
      el.setAttribute('collision-filter', 'group: plotaxis');
      return el;
    };
    
    switch(compDat.axis) {
      case 'x':
        pos.y = -1 * compDat.size / 2;
        rot.x = -90;
        rot.z = -90;
        pos2.y = -1 * pos.y;
        rot2.x = -1 * rot.x;
        rot2.z = rot.z;
        posText.y = pos.y - 0.015;
        posText.z = compDat.size / 2 + 0.015;
        rotText.x = -45;
        break;
      case 'y':
        pos.z = -1 * compDat.size / 2;
        pos2.z = -1 * pos.z;
        rot2.x = 180;
        rot2.z = 180;
        posText.x = compDat.size / 2 + 0.005;
        posText.z = compDat.size / 2 + 0.005;
        rotText.y = -45;
        break;
      case 'z':
        pos.x = -1 * compDat.size / 2;
        rot.y = 90;
        rot.z = 90;
        pos2.x = -1 * pos.x;
        rot2.y = -1 * rot.y;
        rot2.z = -1 * rot.z;
        posText.y = -1 * compDat.size / 2 - 0.015;
        posText.x = -1 * compDat.size / 2 - 0.015;
        rotText.z = -45;
    }
    
    makeAxis(this.axis, pos, rot);
    makeAxis(this.mirror, pos2, rot2);
    this.axisScale.setAttribute('plot-axis-text',{
      name: compDat.name,
      labels: compDat.labels, 
      breaks: compDat.breaks, 
      fontScale: compDat.fontScale,
      axis: this.data.axis
    });
    this.axisScale.setAttribute('position', posText);
    this.axisScale.setAttribute('rotation', rotText);
  },
  

  update: function(oldData) {
    if(oldData.breaks !== this.data.breaks ||
        oldData.labels !== this.data.labels ||
        oldData.name !== this.data.name ||
        oldData.fontScale !== this.data.fontScale) {
      this.axisScale.setAttribute('plot-axis-text', {
        name: this.data.name,
        labels: this.data.labels,
        breaks: this.data.breaks,
        fontScale: this.data.fontScale,
        axis: this.data.axis
      });
    }
  },
  
  play: function () {
    this.el.addEventListener('stateadded', 
                               this.hover.bind(this));
    this.el.addEventListener('stateremoved', 
                               this.unHover.bind(this));

  },
  pause: function () {
    this.el.removeEventListener('stateadded', 
                                  this.hover.bind(this));
    this.el.removeEventListener('stateremoved', 
                                  this.unHover.bind(this));
  },
  
  hover: function (evt) {
    if (evt.detail.state == this.data.hoverState) {
      this.numHovered++;
      this.axis.setAttribute('material', 'visible', true);
      this.mirror.setAttribute('material', 'visible', true);
    }
  },
  unHover: function(evt) {
    if (evt.detail.state == this.data.hoverState &&
          --this.numHovered === 0) {
      this.axis.setAttribute('material', 'visible', false);
      this.mirror.setAttribute('material', 'visible', false);
    }
  }
});

AFRAME.registerComponent("plot-area", {
  schema: { 
    points: { default: [] }
  },
  
  init: function () {
    this.POINT_UPDATED = 'pointUpdated';
    this.queuePos = null;
    this.pointEls = [];
  },
  
  updateCallback: function() {
    var pdat, p, an,
        dataLen = this.data.points.length;
    // remove any extra entities first
    if (this.pointEls.length > dataLen) {
      this.el.removeChild(this.pointEls[dataLen]);
      this.pointEls.splice(dataLen, 1);
      setTimeout(this.updateCallback.bind(this));
    } else if (this.queuePos < dataLen) {
      pdat = this.data.points[this.queuePos];
      //create new entities as needed
      if(this.queuePos >= this.pointEls.length) {
        p = document.createElement('a-entity');
        this.el.appendChild(p);
        p.setAttribute('position', '0 0 0');
        this.pointEls.push(p);
      } else {
        p = this.pointEls[this.queuePos];
      }
      p.setAttribute('geometry', pdat.geometry);
      p.setAttribute('material', 'color: ' + pdat.color);
      p.setAttribute('animation', 
                     'property: position; ' + 
                       'startEvents: '+ this.POINT_UPDATED + 
                       '; to: ' + [pdat.x, pdat.y, pdat.z].join(' ')
                    );
      if(p.hasLoaded) {
        p.emit(this.POINT_UPDATED, {}, false);
      } else {
        p.addEventListener('loaded', (evt) => {
          evt.detail.target.emit(this.POINT_UPDATED, {}, false);
        });
      }
      this.queuePos++;
      setTimeout(this.updateCallback.bind(this));
    } else {
      this.el.emit("plotUpdateComplete");
    }
  },
  update: function () {
    this.queuePos = 0;
    setTimeout(this.updateCallback.bind(this));
  }
});

AFRAME.registerComponent('plot-axis-text', {
  schema: {
    name: { default: '' },
    labels: { default: [] },
    breaks: { default: [] },
    fontScale: { default: 1 },
    axis: { default: 'x'}
  },
  
  init: function() {
    this.labelEls = [];
    this.nameEl = document.createElement('a-entity');
    this.el.appendChild(this.nameEl);
    this.nameEl.setAttribute('scale', 
                             new Array(4).join(this.data.fontScale + ' '));
                             
    var namePos = [0, this.offset(2), this.offset(2)];
    if(this.data.axis == 'y') {
      namePos[1] = this.el.parentEl.components['plot-axis'].data.size / 2 - 
                    this.offset(2);
    } else if(this.data.axis == 'z') {
      namePos[0] = -this.offset(2);
      this.nameEl.setAttribute('rotation', '0 -90 0');
    }
    this.nameEl.setAttribute('position', namePos.join(' '));
    this.nameEl.setAttribute('bmfont-text', {
        width: 0, mode: 'nowrap',align: 'center'});

  },
  
  update: function(oldData) {
    if(this.data.name !== oldData.name) {
      let nameText = this.data.name.length ? this.data.name : 
                                             this.data.axis + ' (unmapped)';
      this.nameEl.setAttribute('bmfont-text', 'text', nameText);
      this.nameEl.setAttribute('position', 
                               this.data.axis == 'y' ? 'x' : this.data.axis, 
                               this.offset(nameText.length));
    }
    // if the two properties areupdated asyncrhonously
    // and are different lengths, wait for the second
    if(this.data.labels.length !== this.data.breaks.length) return;
    
    var diff = this.labelEls.length - this.data.labels.length;
    if(diff > 0) {
      this.labelEls.splice(this.data.labels.length).forEach(function (rem){
        rem.parentNode.removeChild(rem);
      });
    }
    this.labelEls.forEach(function(labEl, i) {
      this.setLabel(labEl, this.data.labels[i], this.data.breaks[i]);
    }, this);
    if(diff < 0) {
      this.addLabels(this.data.labels.slice(this.labelEls.length),
                     this.data.breaks.slice(this.labelEls.length));
    }

  },
  
  addLabels: function(newLabels, newPositions) {
    var frag = document.createDocumentFragment();
    newLabels.forEach(function(lab, i) {
      var labEl = document.createElement('a-entity');
      frag.appendChild(labEl);
      labEl.setAttribute('bmfont-text', {
        width: 0, mode: 'nowrap',align: 'center'});
      labEl.setAttribute('position', '0 0 0');
      this.setLabel(labEl, lab, newPositions[i]);
      if(this.data.axis == 'z') labEl.setAttribute('rotation', '0 -90 0');
      this.labelEls.push(labEl);
    }, this);
    this.el.appendChild(frag);
  },

  setLabel: function(labEl, lab, pos) {
    // compensate for width of string(approximate)
    var numChar = this.data.axis === 'y' ? 1 : lab.length;
    pos += this.offset(numChar);
    labEl.setAttribute('bmfont-text', 'text', lab);
    labEl.setAttribute('position', this.data.axis, pos);
    labEl.setAttribute('scale', 
                       new Array(4).join(this.data.fontScale + ' '));
  },
  
  offset: function(nchar) {
    return -0.05 * nchar * this.data.fontScale;
  }
});

AFRAME.registerComponent('plot-guide', {
  schema: {
    aesthetic: { default: '' },
    name: { default: '' },
    breaks: { default: [] },
    labels: { default: [] },
    size: { default: 1 },
    fontScale: { default: 0.12 }
  },
  init: function() {
    var ymarg = 0.02;
    this.defaults = { 
      width: 0.01, height: 0.01, depth: 0.01, radius: 0.005, 
      'radius-bottom': 0.005, 'radius-top': 0.001, 'radius-tubular': 0.001,
      shape: 'sphere', color: 'black'
    };
    // aesthetic mapping to receive udpates from `plot`
    this.el.axis = this.data.aesthetic; 
    // drag-drop interaction target
    this.hoverEl = document.createElement('a-plane');
    this.el.appendChild(this.hoverEl);
    // aesthetic mapping to pass to shiny
    this.hoverEl.axis = this.data.aesthetic;  
    this.hoverEl.className += ' hoverable';
    this.hoverEl.setAttribute('position', {
      x: -this.data.size,
      y: this.data.size / 2 + ymarg / 2 + 0.0175,
      z: -0.0151
    });
    this.hoverEl.setAttribute('width', this.data.size * 2);
    this.hoverEl.setAttribute('height', this.data.size + 0.04);
    this.hoverEl.setAttribute('color', 'white');
    this.hoverEl.setAttribute('static-body', '');
    this.hoverEl.setAttribute('visible', 'false');
    // guide title
    this.nameEl = document.createElement('a-entity');
    this.el.appendChild(this.nameEl);
    //this.nameEl.setAttribute('rotation', '0 0 90');
    this.nameEl.setAttribute('position', {
      x: -0.2, y: this.data.size + 0.00625, z: -0.015 });
    //layout for the labels v. keys
    this.legendEl = document.createElement('a-entity');
    this.el.appendChild(this.legendEl);
    this.legendEl.setAttribute('position', {
      x: -0.2, y: ymarg, z: 0
    });
    this.legendEl.setAttribute('layout', 'type: line; margin: 0.18');
    //layout for text labels
    this.labels = document.createElement('a-entity');
    this.legendEl.appendChild(this.labels);
    this.labels.setAttribute('layout', 'type: box');
    //layout for the legend keys
    this.marks = document.createElement('a-entity');
    this.legendEl.appendChild(this.marks);
    this.marks.setAttribute('layout', 'type: box;');

    this.highlight = this.highlight.bind(this);
    this.unHighlight = this.unHighlight.bind(this);
  },
  update: function(oldDat) {
    var aes = this.data.aesthetic == 'size' ? 'radius' : this.data.aesthetic;
    // wait for both if asynch update
    if(this.data.breaks.length !== this.data.labels.length) return;
    this.nameEl.setAttribute('bmfont-text', {
      text: this.data.name.length ? this.data.name : 
                                    this.data.aesthetic + ' (unmapped)',
      width: 275
    });
    this.nameEl.setAttribute(
      'scale', 
      new Array(4).join((this.data.fontScale + 0.01) + ' ')
    );
    // only update legends if there is a change (AFRME.utils.deepEqual won't
    //  suffice as it doesn't compare array contents)
    if(arraysIdentical(this.data.breaks, oldDat.breaks) && 
         arraysIdentical(this.data.labels, oldDat.labels)) return;
    while(this.marks.lastChild) {
      this.marks.removeChild(this.marks.lastChild);
    }
    while(this.labels.lastChild) {
      this.labels.removeChild(this.labels.lastChild);
    }
    // A-Frame v0.4.0 - updated layout compnent no longer needs manual reset
    this.marks.components.layout.children = [];
    this.labels.components.layout.children = [];
    this.marks.setAttribute('layout', 'margin', 
                         this.data.size / this.data.breaks.length);
    this.labels.setAttribute('layout', 'margin', 
                         this.data.size / this.data.breaks.length);
    this.data.breaks.forEach( (b) => {
      var mark = AFRAME.utils.extend({}, this.defaults);
      mark[aes] = b;
      var markEl = document.createElement('a-' + 
      (mark.shape === 'torusKnot' ? 'torus-knot' : mark.shape));
      delete mark.shape;
      Object.keys(mark).forEach( (prop) => {
        markEl.setAttribute(prop, mark[prop]);
      });
      this.marks.appendChild(markEl);
    });
    this.data.labels.forEach( (l) => {
      var labEl = document.createElement('a-entity');
      this.labels.appendChild(labEl);
      labEl.setAttribute('scale', new Array(4).join(this.data.fontScale + ' '));
      labEl.setAttribute('bmfont-text', {
        text: l + '', width: 200, mode: 'nowrap', align: 'right'});
      this.labels.appendChild(labEl);
    });
  },
  play: function() {
    this.el.addEventListener('stateadded', this.highlight);
    this.el.addEventListener('stateremoved', this.unHighlight);
  },
  pause: function() {
    this.el.removeEventListener('stateadded', this.highlight);
    this.el.removeEventListener('stateremoved', this.unHighlight);
  },
  highlight: function(evt) {
    if(evt.detail.state !== 'hovered') { return; }
    this.hoverEl.setAttribute('visible', 'true');
  },
  unHighlight: function(evt) {
    if(evt.detail.state !== 'hovered') { return; }
    this.hoverEl.setAttribute('visible', 'false');
  }
});

function arraysIdentical(a1, a2) {
  return a1 && a2 && a1.length === a2.length && a1.every((v,i)=> v === a2[i]);
}