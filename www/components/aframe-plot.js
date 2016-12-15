AFRAME.registerComponent('plot', {
  schema: { 
    size: { default: 0.5 },
    xbreaks: { default: '' },
    xlabels: { default: '' },
    ybreaks: { default: '' },
    ylabels: { default: '' },
    zbreaks: { default: '' },
    zlabels: { default: '' }
  },
  dependencies: ['geometry'],
  init: function() {
    var self = this;
    var size = this.data.size;
    self.axes = [];
    // register axes
    ['x', 'y', 'z'].forEach(function (axis) {
      var axEl = document.createElement('a-entity');
      self.el.appendChild(axEl);
      axEl.setAttribute('plot-axis', { axis: axis, size: size });
      self.axes.push(axEl);
    });
    
  },
  
  update: function() {
    var dat = this.data;
    this.axes.forEach(function(ax) {
      if(!ax.components['plot-axis'].data) return;
      var newBreaks, newLabels;
      switch(ax.components['plot-axis'].data.axis) {
        case 'x':
          newBreaks = dat.xbreaks;
          newLabels = dat.xlabels;
          break;
        case 'y':
          newBreaks = dat.ybreaks;
          newLabels = dat.ylabels;
          break;
        case 'z':
          newBreaks = dat.zbreaks;
          newLabels = dat.zlabels;
          break;
      }
      ax.setAttribute('plot-axis', 'breaks', newBreaks);
      ax.setAttribute('plot-axis', 'labels', newLabels);

    }); 
  }
});

// manages scale labels and receiving user mapping input
AFRAME.registerComponent('plot-axis', {
  // Define component properties.
  schema: {
    axis: { default: 'x' },
    breaks: { default: [] },
    labels: { default: [] },
    title: { default: '' },
    fontScale: { default: 0.15 },
    material: { default: 'src: #arrow' },
    size: { default: 1 },
    hoverState: { default: 'hovered' },
    hoverClass: { default: 'hoverable' },
    collider: { default: 'sphere-collider' }
  },
  //dependencies: ['material'],
  
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
      labels: compDat.labels, 
      breaks: compDat.breaks, 
      fontScale: compDat.fontScale,
      axis: this.data.axis
    });
    this.axisScale.setAttribute('position', posText);
    this.axisScale.setAttribute('rotation', rotText);

    var colliderEls = document.querySelectorAll('a-entity[' + 
                                                compDat.collider + 
                                                ']');
    colliderEls.forEach(function (collEl) {
        collEl.components[compDat.collider].update();
    });
    
  },
  

  update: function(oldData) {
    if(oldData.breaks !== this.data.breaks ||
        oldData.labels !== this.data.labels ||
        oldData.title !== this.data.title) {
      this.axisScale.setAttribute('plot-axis-text', {
        labels: this.data.labels,
        breaks: this.data.breaks,
        fontScale: this.data.fontScale,
        axis: this.data.axis
      });
    }
  },
  
  play: function () {
    this.axis.addEventListener('stateadded', 
                               this.hover.bind(this));
    this.axis.addEventListener('stateremoved', 
                               this.unHover.bind(this));
    this.mirror.addEventListener('stateadded', 
                                 this.hover.bind(this));
    this.mirror.addEventListener('stateremoved', 
                                 this.unHover.bind(this));
  },
  pause: function () {
    this.axis.removeEventListener('stateadded', 
                                  this.hover.bind(this));
    this.axis.removeEventListener('stateremoved', 
                                  this.unHover.bind(this));
    this.mirror.removeEventListener('stateadded', 
                                    this.hover.bind(this));
    this.mirror.removeEventListener('stateremoved', 
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
    points: { default: [] },
    xlabels: { default: [] },
    xbreaks: { default: [] },
    ylabels: { default: [] },
    ybreaks: { default: [] },
    zlabels: { default: [] },
    zbreaks: { default: [] }    
  },
  
  init: function () {
    this.queuePos = null;
    this.pointEls = [];
  },
  
  updateCallback: function() {
    if (this.queuePos < this.data.points.length) {
      let pdat = this.data.points[this.queuePos],
          p;
      if(this.queuePos >= this.pointEls.length) {
        p = document.createElement('a-entity');
        this.el.appendChild(p);
        this.pointEls.push(p);
      } else {
        p = this.pointEls[this.queuePos];
      }
      p.setAttribute('position', [pdat.x, pdat.y, pdat.z].join(' '));
      p.setAttribute('geometry', pdat.geometry);
      p.setAttribute('material', pdat.material);
      this.queuePos++;
      setTimeout(this.updateCallback.bind(this));
    } else if (this.queuePos < this.pointEls.length) {
      this.el.removeChild(this.pointEls[this.queuePos]);
      this.pointEls.splice(this.queuePos, 1);
      setTimeout(this.updateCallback.bind(this));
    } else {console.log("total time", performance.now() - this.perfTime, "total length", this.pointEls.length);}
  },
  
  update: function () {
    var el = this.el;
    var dat = this.data; 
    this.queuePos = 0;
    this.perfTime = performance.now();
    setTimeout(this.updateCallback.bind(this));
    // pass scale info up
    /////////////////////////TODO//////////////////////
    // update single attributes instead of block to avoid overwritting other settings
    this.el.parentEl.setAttribute('plot', {
      xlabels: dat.xlabels,
      xbreaks: dat.xbreaks,
      ylabels: dat.ylabels,
      ybreaks: dat.ybreaks,
      zlabels: dat.zlabels,
      zbreaks: dat.zbreaks
    });
    ////////////////////////ENDTODO/////////////////////
  }
});

AFRAME.registerComponent('plot-axis-text', {
  schema: {
    labels: { default: [] },
    breaks: { default: [] },
    fontScale: { default: 1 },
    axis: { default: 'x'}
  },
  
  init: function() {
    this.labelEls = [];
  },
  
  update: function() {
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
      labEl.setAttribute('bmfont-text', 'text', this.data.labels[i]);
      labEl.setAttribute('position', this.data.axis, this.data.breaks[i]);
      labEl.setAttribute('scale', 
                         this.data.fontScale + ' ' + 
                           this.data.fontScale + ' ' + 
                           this.data.fontScale);
    }, this);
    if(diff < 0) {
      this.addLabels(this.data.labels.slice(this.labelEls.length),
                     this.data.breaks.slice(this.labelEls.length));
    }

  },
  
  addLabels: function(newLabels, newPositions) {
    var frag = document.createDocumentFragment();
    newLabels.forEach(function(lab, i) {
      var labEl = document.createElement('a-entity'),
          pos = newPositions[i] + this.offsetBreak(lab);
      frag.appendChild(labEl);
      labEl.setAttribute('bmfont-text', {
        text: lab, width: 0, mode: 'nowrap',align: 'center'});
      labEl.setAttribute('position', '0 0 0');
      labEl.setAttribute('position', this.data.axis, pos);
      labEl.setAttribute('scale', 
                         this.data.fontScale + ' ' +
                         this.data.fontScale + ' ' +
                         this.data.fontScale);
      if(this.data.axis == 'z') labEl.setAttribute('rotation', '0 -90 0');
      this.labelEls.push(labEl);
    }, this);
    this.el.appendChild(frag);
  },
  // compensate for width of string(approximate)
  offsetBreak: function(lab){
    // at default scale, characters are ~0.1m wide
    var numChar = this.data.axis == 'y' ? 1 : lab.length;
    return numChar * -0.075 * this.data.fontScale;
  }
  
});
