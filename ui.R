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
    #tags$script(src = "components/aframe-bmfont-text-component.js"),
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
    tags$script(src = "components/aframe-drag-drop.js")
   

  ),
  # Application title
  titlePanel("VR Data Explorer"),
    # Sidebar with a slider input for number of bins 
  sidebarLayout(
    sidebarPanel(
      tags$p("Adit is a tool fo exploratory data analysis",
             "in virtual reality using the HTC Vive.",
             "Adit brings",
             "together the R language for statistical computing and",
             "virtual reality on the Web",
             "using RStudio's shiny and Mozilla's A-frame.",
             "This is an in-development prototype, see the",
             tags$a(href = "https://github.com/wmurphyrd/adit", 
                    "Adit GitHib page"), 
             "for more info."),
       radioButtons("datasource", "Select your data",
                          c("iris", "mtcars", "diamonds"),
                          selected = "iris"),
       tableOutput("dataset")
    ),
    
    mainPanel(
      aframeScene(
        physics = "gravity: 0; debug: true;",
        fog = "color: #bc483e; near: 0; far: 65;",
        aframeAssets(
          tags$img(id = "arrow", src = "/textures/arrow.png"),
          aframeMixin(id = "plottheme",
                      geometry = "primitive: box; height: 0.5; width: 0.5; depth: 0.5",
                      material = "color: #EF2D5E; transparent: true; opacity: 0.2; side: double;"),
          aframeMixin(id = "plottheme-collided",
                      material = "color: #F2E646;"),
          aframeMixin(id = "plottheme-grabbed",
                      material = "color: #F2E646;"),
          aframeMixin(id = "controller",
                      `static-body`="shape: sphere; sphereRadius: 0.02;",
                      `sphere-collider`="objects: .grabbable, .hoverable, .draggable;",
                      grab = "", stretch = "", `drag-drop` = ""),
          atags$mixin(id = "data-column",
                      `dynamic-body` = "",
                      sleepy = "",
                      `collision-filter` = "collidesWith: ;",
                      #geometry = "primitive: box; height: .075; width: 0.33; depth: 0.33",
                      material = "color: #FFF;",
                      draw = "background: #A0A0A0"),
          atags$mixin(id = "data-column-collided",
                      draw = "background: #A0F0F0")
        ),
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
        aframeEntity(
          id = "plotcontainer",
          mixin = "plottheme",
          position = "0 1.5 -0.5",
          #geometry = "primitive: box; width: 0.5; height: 0.5; depth: 0.5",
          #material = "transparent: true; opacity: 0;",
          `dynamic-body` = "shape: box;",
          class = "grabbable",
          sleepy = "angularDamping: 0; speedLimit: 1",
          `collision-filter` = "group: plots; collidesWith: plots, default;",
          aScatter3dOutput("myplot"),
          aframeEntity(`plot-axis` = "axis: x; size: 0.5;"),
          aframeEntity(`plot-axis` = "axis: y; size: 0.5;"),
          aframeEntity(`plot-axis` = "axis: z; size: 0.5;")
        ),
        aframeBox(
          position = "-1 1.5 -0.5",
          width = "0.25", height = "0.25", depth = "0.25",
          material = "color: blue",
          `dynamic-body` = "",
          `collision-filter` = "group: notplots; collidesWith: notplots, default;",
          sleepy = "",
          class = "grabbable",
          id = "testbox"
        ),
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
          position = ".5 1.5 -0.5",
          aDataFrameOutput("mydat"),
          id = "datacontainer"
        ),
        aframeEntity(id = "sky", geometry = "primitive: sphere; radius: 65;",
                     material = "shader: skyGradient; colorTop: #353449; colorBottom: #BC483E; side: back"),
        aframeEntity(ground = ""),
        aframeEntity(light = "type: point; color: #f4f4f4; intensity: 0.2; distance: 0",
                     position = "8 10 18"),
        aframeEntity(light = "type: point; color: #f4f4f4; intensity: 0.6; distance: 0",
                     position = "-8 10 -18"),
        aframeEntity(light = "type: ambient; color: #f4f4f4; intensity: 0.4;",
                     position = "-8 10 -18"),
        # ground collision layer (not really necessary w/o gravity)
        aframeEntity(geometry = "primitive: plane; height: 20; width: 20",
                     material = "color: white;",
                     `static-body` = "",
                     rotation = "-90 0 0", position = "0 -0.05 0",
                     id = "floorcollider")

      )
    )
  )
))
