#
# This is the user-interface definition of a Shiny web application. You can
# run the application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

library(shiny)
library(htmlwidgets)
library(shinyaframe)


# Define UI for application that draws a histogram
shinyUI(fluidPage(
  
  # AFRAME scripts
  tags$head(
    #tags$script(src = "aframe.js"),
    tags$script(src = "cannon.js"),
    tags$script(src = "components/ground.js"),
    tags$script(src = "shaders/skyGradient.js"),
    #tags$script(src = "components/aframe-layout-component.js"),
    tags$script(src = "components/kframe.js"),
    tags$script(src = "components/aframe-bmfont-text-component.js"),
    tags$script(src = "components/aframe-draw-component.js"),
    tags$script(src = "components/aframe-textwrap-component.js"),
    tags$script(src = "components/data-frame.js"),
    tags$script(src = "components/data-frame-column.js"),
    tags$script(src = "components/aframe-physics-system.js"),
    tags$script(src = "components/aframe-extras.js"),
    tags$script(src = "components/aframe-physics-sleepy.js"),
    tags$script(src = "components/aframe-physics-collision-filter.js"),
    tags$script(src = "components/aframe-stretch.js"),
    tags$script(src = "components/aframe-plot.js"),
    tags$script(src = "components/aframe-drag-drop.js"),
    tags$script(src = "components/aframe-physics-collider.js"),
    tags$script(src = "components/aframe-monitor-camera-tweak.js"),
    tags$style("#vrcontent {height: 600px;}")
  ),
  # Application title
  titlePanel("Adit: Enter the Data Mine"),
  fluidRow(
    column(6,
      tags$p(
        "Adit is a tool for virtual reality exploratory data analysis",
        "using the HTC Vive.",
        "Adit brings",
        "together the R language for statistical computing and",
        "virtual reality on the Web",
        "using RStudio's shiny and Mozilla's A-frame.",
        "With Adit, you can create visualizations by dragging variable name",
        "cards and dropping them on the x, y, and z axes or the color, shape,",
        "and size legends.",
        "Examine your plot by grabbing it to move and rotate, stretching with",
        "two hands to scale, or releasing with with a twist to animate.",
        tags$br(),
        "Visit the",
        tags$a(href = "https://github.com/wmurphyrd/adit", "Adit GitHib page"), 
        "for more info.")
    ),
    column(
      6,
      fluidRow(
        column(4,
               radioButtons("datasource", "Select a dataset:",
                            c("iris", "mtcars", "diamonds"),
                            selected = "iris")
        ),
        column(
          8,
          fileInput(
            "datafile", 
            "Or upload your own: (csv, Excel, or RDS)", 
            accept = c(
              "text/csv",
              "text/comma-separated-values,text/plain",
              ".csv",
              ".xls",
              ".xlsx",
              ".RDS")
          )
        )
      ),
      fluidRow(
        column(
          6,
          sliderInput("sample_limit", 
                      "Number of cases to plot:",
                      value = 100, min = 0, max = 150, round = TRUE)
        ),
        column(
          6,
          helpText("Limiting the number of cases will use a randomly sampled",
                   "subset and will improve performance with large datasets.")
        )
      )
    )
  ),
  conditionalPanel("!window.hasNativeWebVRImplementation", HTML("
<div class=\"alert alert-danger\">
WebVR is a cutting-edge, experimental technology, and you'll need to install 
a cutting-edge, experimental web browser for it to work properly. 
Here's what you'll need to do:
<ul>
 <li>Visit <a href = \"https://webvr.info/get-chrome/\">https://webvr.info/get-chrome/</a></li>
 <li>Click on the \"Archive\" and then \"September, 23 2016\" folders to download the correct WebVR version of Chromium (or 
  <a href = \"https://drive.google.com/open?id=0BzudLt22BqGRbHdGOTdiaTBkZXM\">click here</a> to go directly there)</li>
 <li>Open Chromium and enable WebVR entering the option links </li>
 <li>chrome://flags/#enable-webvr</li>
 <li>chrome://flags/#enable-gamepad-extensions</li>
</div>")
  ),
  conditionalPanel(
    "window.hasNativeWebVRImplementation && navigator.userAgent.includes('Chrome/56')",
    HTML("
<div class=\"alert alert-danger\">
You are running a version of WebVR Chromium that contains a bug that prevents Adit
from running properly. Please download a previous version to experience Adit. 
<ul>
 <li>Visit <a href = \"https://webvr.info/get-chrome/\">https://webvr.info/get-chrome/</a></li>
 <li>Click on the \"Archive\" and then \"September, 23 2016\" folders to download the previous WebVR version of Chromium (or 
  <a href = \"https://drive.google.com/open?id=0BzudLt22BqGRbHdGOTdiaTBkZXM\">click here</a> to go directly there)</li>
</ul>
</div>")
  ),
  aframeScene(
    id = "vrcontent",
    embedded = "",
    physics = "gravity: 0;",
    fog = "color: #cccccc; near: 0; far: 65;",
    aframeAssets(
      tags$img(id = "arrow", src = "textures/arrow.png"),
      tags$img(id = "grid", src = "textures/grid2.png"),
      aframeMixin(
        id = "plottheme",
        geometry = "primitive: box; height: 0.5; width: 0.5; depth: 0.5",
        material = paste("color: #EF2D5E; transparent: true;", 
                         "opacity: 0.2; side: double;")
      ),
      aframeMixin(id = "plottheme-collided", material = "color: #F2E646;"),
      aframeMixin(id = "plottheme-grabbed", material = "color: #F2E646;"),
      aframeMixin(
        id = "controller",
        `static-body`="shape: sphere; sphereRadius: 0.02;",
        `physics-collider` = "",
        `collision-filter` = paste("collidesWith: default, plots,",
                                   "datacolumn, plotaxis, notplots;"),
        grab = "", stretch = "", `drag-drop` = ""
      ),
      atags$mixin(id = "datacolumn", `dynamic-body` = "", sleepy = "",
                  `collision-filter` = "group: datacolumn;",
                  material = "color: #FFF; side: double"),
      atags$mixin(id = "datacolumn-collided", material = "color: #F2E646;"),
      atags$mixin(id = "testbox", material = "color: blue"),
      atags$mixin(id = "testbox-collided", material = "color: green")
    ),
    atags$entity(camera = "userHeight: 1.6", `look-controls` = "",
                 `monitor-camera-tweak` = "", position = "0 0 .8"),
    # Hand conttols
    aframeEntity(
      id = "lefthand",
      `vive-controls`="hand: left",
      mixin = "controller"
    ),
    aframeEntity(
      id = "righthand",
      `vive-controls`="hand: right",
      mixin = "controller"
    ),
    aScatter3dOutput(
      "myplot",
      mixin = "plottheme",
      position = "0 1.5 0",
      rotation = "0 45 0",
      plot = "size: 0.5",
      `dynamic-body` = "shape: box;",
      sleepy = "angularDamping: 0; speedLimit: 1",
      `collision-filter` = "group: plots;"
    ),
    # aframeBox(
    #   position = "-1 1.5 -0.5",
    #   width = "0.25", height = "0.25", depth = "0.25",
    #   `dynamic-body` = "",
    #   `collision-filter` = "group: notplots; collidesWith: notplots, default;",
    #   sleepy = "",
    #   class = "grabbable",
    #   id = "testbox",
    #   mixin = "testbox"
    # ),
    # aframeBox(
    #   position = "-1 1.5 0.5",
    #   width = "0.25", height = "0.25", depth = "0.25",
    #   material = "color: blue",
    #   `dynamic-body` = "",
    #   `collision-filter` = "group: notplots; collidesWith: notplots, default;",
    #   sleepy = "",
    #   class = "grabbable",
    #   id = "filterbox2"
    # ),
    aframeEntity(
      position = "1 1 -0.25",
      aDataFrameOutput("mydat"),
      id = "datacontainer"
    ),
    atags$other("sun-sky", material = "sunPosition: -0.5 1 1"),
    #ground layer w/ collision
    aframeEntity(
      geometry = "primitive: plane; width: 100; height: 100;",
      material = "src: #grid; repeat: 100 100; shader: flat;",
      `static-body` = "",
      `collision-filter` = "collidesWith: notplots, plots, datacolumn",
      rotation = "-90 0 0", position = "0 0 0",
      id = "floorcollider"
    )
  )# /a-scene
))
