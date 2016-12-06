# Adit: Enter the Data Mine

Adit is a tool for exploratory data analysis that brings together 
the R language for statistical computing and virtual reality via 
[shiny](https://shiny.rstudio.com/) and [A-frame](http://aframe.io).

## Current Status

Adit renders data from the `iris` dataset in a 3d scatter plot, mapping
data to x, y, z, color, and shape. You can grab the plot and move it
with a controller.

### Latest Updates

* Reworked sleepy component to utilize `CANNON.js` built-in sleepiness
  and control damping. In WebVR Chromium 56, this can cause `dynamic-body` 
  entities to be obliterated. Can use v55 WebVR build instead. When
  releasing objects now:
      * Objects with low momentum will go to sleep (become idle).
        This makes it easier to place a plot still without any residual
        spin or motion.
      * Objects released with significant momentum will cease linear
        motion quickly, but will continue to spin in place. This makes
        it easy to make a plot animated by giving a flick of the wrist when
        releasing.
* Added `aframe-stretch` to scale the scatterplot by grabbing and 
  stretching with two hands
* Changed to [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system)
  and [aframe-extras](https://github.com/donmccurdy/aframe-extras) 
  from @donmccurdy for improved grabbing (rotation & position) via `cannon.js`
  constraints


Now that basic mapping is working, the current focus will be on UI within VR
to build plots interactively. 

## Try it

This is an early work in progress. The current build can be experienced at
http://wmurphyrd.shinyapps.io/adit. 

## Requirements
Adit requires a complete VR system (rotational & positional tracking with
hand controllers). As of today, only the HTC Vive offers this experience, 
but Oculus Rift will be launching their Touch controllers shortly.

WebVR is still experimental and only available in test versions of browsers. 
Currently, only [Chromium](https://webvr.info/get-chrome/) 
supports the full experience with hand controllers. 

After installing Chromium, you **must** enable two options for WebVR to work:

* chrome://flags/#enable-webvr
* chrome://flags/#enable-gamepad-extensions
  
