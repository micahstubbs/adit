AFRAME.registerComponent('plot', {
  schema: { 
    size: { default: 0.5 },
    xname: {default: ''},
    xlabels: { default: [] },
    xbreaks: { default: [] },
    yname: {default: ''},
    ylabels: { default: [] },
    ybreaks: { default: [] },
    zname: {default: ''},
    zlabels: { default: [] },
    zbreaks: { default: [] } 
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
      var newBreaks, newLabels, newName;
      switch(ax.components['plot-axis'].data.axis) {
        case 'x':
          newName = dat.xname;
          newBreaks = dat.xbreaks;
          newLabels = dat.xlabels;
          break;
        case 'y':
          newName = dat.yname;
          newBreaks = dat.ybreaks;
          newLabels = dat.ylabels;
          break;
        case 'z':
          newName = dat.zname;
          newBreaks = dat.zbreaks;
          newLabels = dat.zlabels;
          break;
      }
      ax.setAttribute('plot-axis', 'name', newName);
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
    name: { default: '' },
    breaks: { default: [] },
    labels: { default: [] },
    fontScale: { default: 0.15 },
    material: { default: 'src: #arrow' },
    size: { default: 1 },
    hoverState: { default: 'hovered' },
    hoverClass: { default: 'hoverable' } 
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
    xname: {default: ''},
    xlabels: { default: [] },
    xbreaks: { default: [] },
    yname: {default: ''},
    ylabels: { default: [] },
    ybreaks: { default: [] },
    zname: {default: ''},
    zlabels: { default: [] },
    zbreaks: { default: [] }    
  },
  
  init: function () {
    this.POINT_UPDATED = 'pointUpdated';
    this.queuePos = null;
    this.pointEls = [];
  },
  
  updateCallback: function() {
    var pdat, p, an,
        dataLen = this.data.points.length;
    if (this.queuePos < dataLen) {
      // remove any extra entities first
      if (this.pointEls.length > dataLen) {
        this.el.removeChild(this.pointEls[dataLen]);
        this.pointEls.splice(dataLen, 1);
      } else {
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
        p.setAttribute('material', pdat.material);
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
      }
      setTimeout(this.updateCallback.bind(this));
    } else {
      this.el.emit("plotUpdateComplete");
    }
  },
  update: function () {
    var parent = this.el.parentEl,
        dat = this.data,
        // pass scale info up without overwriting other settings
        plotDat = AFRAME.utils.extend(parent.getComputedAttribute('plot'),
                                      { xname: dat.xname,
                                        xlabels: dat.xlabels,
                                        xbreaks: dat.xbreaks,
                                        yname: dat.yname,
                                        ylabels: dat.ylabels,
                                        ybreaks: dat.ybreaks,
                                        zname: dat.zname,
                                        zlabels: dat.zlabels,
                                        zbreaks: dat.zbreaks });
    this.queuePos = 0;
    setTimeout(this.updateCallback.bind(this));
    parent.setAttribute('plot', plotDat);
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
      this.nameEl.setAttribute('bmfont-text', 'text', this.data.name);
      this.nameEl.setAttribute('position', 
                               this.data.axis == 'y' ? 'x' : this.data.axis, 
                               this.offset(this.data.name.length));
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
