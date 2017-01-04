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

shinyUI(fluidPage(
  
  tags$head(
    # babel for EX5 compatibility
    tags$script(src = "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.1/babel.min.js"),
    #tags$script(src = "aframe.js"),
    tags$script(src = "components/ground.js"),
    tags$script(src = "shaders/skyGradient.js"),
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
    tags$style("#vrcontent {height: 600px;}"),
    # activate the warnings block after the window is loaded, so that they don't
    # appear erroneously for a second while shiny is initalizing
    tags$script(
      type = "text/javascript", 
      "$(window).load(function() {setTimeout(function() {$('#warningsContainer').attr('style', 'display: block;');}, 500);})"
    )
  ),
  # Application title
  titlePanel("Adit: Enter the Data Mine"),
  fluidRow(
    column(5,
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
      6, offset = 1,
      fluidRow(
        column(4,
               radioButtons("datasource", "Select a dataset:",
                            list("Anderson's Iris Data" = "iris", 
                                 "1974 Car Fuel Efficiency" = "mtcars", 
                                 "ggplot2 Diamond Prices" = "diamonds"),
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
  tags$div(id = "warningsContainer", style = "display: none;",
    conditionalPanel(
      "!window.hasNativeWebVRImplementation", 
      HTML(readLines("html/oldbrowserwarn.HTML"))
    ),
    conditionalPanel(
      "window.hasNativeWebVRImplementation && navigator.userAgent.includes('Chrome/56')",
      HTML(readLines("html/badchromium.HTML"))
    )
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
                 `wasd-controls` = "",
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
