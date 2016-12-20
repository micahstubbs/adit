# Adit: Enter the Data Mine

Adit is a tool for exploratory data analysis that brings together 
the R language for statistical computing and virtual reality via 
[shiny](https://shiny.rstudio.com/) and [A-frame](http://aframe.io).

## Current Status

Adit renders data from the `iris` and `mtcars` datasets in a 3d scatter plot 
with mapping capabilities for x, y, z, color, shape, and size. 
The x, y, and z mappings can be selected in VR by grabbing a variable name
card and dropping it into the desired axis. Legends and interactive mapping
for color, shape, and size are coming soon. 

To examine the resulting plot, 
you can grab the plot to move and rotate it with a controller. 
If you release it with a twist of the wrist, the plot
will remain animated in a spin. 
You can also grab the plot with two hands to stretch or shrink it.

### Latest Updates

* `stretch` component allows for two-handed grab and stretch of entities.
  Currently incomplete:
    * Efficient direct update of physics bodies to match scale
    * It's possible to inadvertently pickup another object while 
      stretching
* Scales for plots: added `plot-axis-text` component. This will be automatically
  added to a `plot` and label x, y, and z axes. Supports numeric labels and text
  labels for factors. Labels the name of the mapped variable as the scale title.
* Performance improvements
    * Plot updates are queued and completed as time is available to avoid 
      locking out the render thread
    * Plot points are updated rather than destroyed and recreated (and the 
      updates are not accomplished with an animation)
    * New `physics-collider` component is drop-in replacement for 
      `sphere-collider` that uses the `physics` engine's existing 
      collision detection instead of calculating its own collisions
* Interactive plot building: plots can now be built within Adit by dragging
  data columns onto the axes.
    * `drag-drop` component for controllers. Tells targets when they are
      hovered over and tells targets and carried entities when a successfull
      drag-and-drop interaction occurs. 
    * `data-frame` component receives data from
      [shinyaframe](http://github.com/wmurphyrd/shinyaframe) 
      `aDataFrame` widget and creates `data-frame-column` entities that
      can be dragged onto plot axes to update mapping
* `plot` components
    * `plot`: contains `plot-area`, creates and manages x, y, and z
      `plot-axis` components
    * `plot-axis`: target for `drag-drop`, highlights when hovered 
    * `plot-area`: receives data from
      [shinyaframe](http://github.com/wmurphyrd/shinyaframe) 
      `aScatter3d` widget
      and manages data point display
* `collision-filter` component and system to easily
  manage collision groups (which objects have physics ineractions
  with each other and  which don't) via `CANNON.js` settings
  `collisionFilterGroup` and `collisionFilterMask`
* `sleepy` component to utilize 
  `CANNON.js` built-in sleepiness
  and control damping. In WebVR Chromium 56, this can cause `dynamic-body` 
  entities to be obliterated. Can use v55 WebVR build instead.
    * With default settings, objects quickly come to rest after
      after relase regardless of release velocity.
    * Changing angularDamping to 0 and increasing the speedLimit creates
      a situation where objects released with a twist will cease linear
      translation but maintain their rotational spin indefinitely
* Using [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system)
  and [aframe-extras](https://github.com/donmccurdy/aframe-extras) 
  from @donmccurdy for improved grabbing (rotation & position) via `CANNON.js`
  constraints


## Try it

This is an early work in progress. The current build can be experienced at
http://wmurphyrd.shinyapps.io/adit. 

## Requirements
Adit requires a complete VR system (rotational & positional tracking with
hand controllers). Oculus Rift + Touch has joined the HTC Vive
in offering this experience, but I can only test with the Vive for now.

WebVR is still experimental and only available in test versions of browsers. 
Currently, only [Chromium](https://webvr.info/get-chrome/) 
supports the full experience with hand controllers. Also, I'm recommending
[the September 23rd archived Chromium build](https://drive.google.com/drive/folders/0BzudLt22BqGRbHdGOTdiaTBkZXM) 
for Adit because the latest version doesn't always get along with physics. 

After installing Chromium, you **must** enable two options for WebVR to work:

* chrome://flags/#enable-webvr
* chrome://flags/#enable-gamepad-extensions
  
