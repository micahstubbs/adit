# Adit: Enter the Data Mine

Adit is a tool for exploratory data analysis that brings together 
the R language for statistical computing and virtual reality via 
[shiny](https://shiny.rstudio.com/) and [A-frame](http://aframe.io).

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
  
