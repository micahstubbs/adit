# Adit: Enter the Data Mine

Adit is a tool for exploratory data analysis that brings together 
the R language for statistical computing and virtual reality via 
[shiny](https://shiny.rstudio.com/) and [A-frame](http://aframe.io).

## Current Status

Adit renders data from the `iris` dataset in a 3d scatter plot, mapping
data to x, y, z, color, and shape. You can grab the plot to move and
rotate it
with a controller. If you release it with a twist of the wrist, the plot
will remain animated in a spin. You can also grab the plot with two 
hands to stretch or shrink it 
(but this will degreade performance until you refresh the page for now).

### Latest Updates

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
* `stretch` component allows for two-handed grab and stretch of entities.
  Currently incomplete:
    * Updating the physics body shape during stretch greatly degrades
      performance (but makes for a smooth interaction feel)
    * It's possible to inadvertently pickup another object while 
      stretching
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


Now that basic mapping is working, the current focus will be on UI within VR
to build plots interactively. 

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
  
