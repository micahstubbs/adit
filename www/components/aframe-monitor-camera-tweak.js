// allows for the camera to be positioned when viewing in monitor mode without
// offsetting camera position while in VR mode
AFRAME.registerComponent('monitor-camera-tweak', {
  dependencies: ['position'],
  init: function() {
    this.offsetPos  = this.el.getComputedAttribute('position');
    this.tweakCameraB = this.tweakCamera.bind(this);
    this.unTweakCameraB = this.unTweakCamera.bind(this);
  },
  play: function() {
    if(navigator.getVRDisplays) {
      navigator.getVRDisplays().then( (displays) => {
        if (displays.length > 0) {
            vrDisplay = displays[displays.length - 1];
            if(vrDisplay.capabilities.hasPosition) {
                this.el.sceneEl.addEventListener('enter-vr', this.unTweakCameraB);
                this.el.sceneEl.addEventListener('exit-vr', this.tweakCameraB);
            }
        }
      });
    }
  },
  pause: function() {
    this.el.sceneEl.removeEventListener('enter-vr', this.unTweakCameraB);
    this.el.sceneEl.removeEventListener('exit-vr', this.tweakCameraB);
  },
  unTweakCamera: function() {
    this.el.setAttribute('position', '0 0 0');
  },
  tweakCamera: function() {
    this.el.setAttribute('position', this.offsetPos);
  }
  
});