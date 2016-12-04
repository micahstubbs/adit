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
#source("aframe.R")

# Define UI for application that draws a histogram
shinyUI(fluidPage(
  
  # AFRAME scripts
  tags$head(
    tags$script(src = "aframe.js"),
    tags$script(src = "cannon.js"),
    tags$script(src = "components/ground.js"),
    tags$script(src = "shaders/skyGradient.js"),
    tags$script(src = "components/aframe-layout-component.js"),
    #tags$script(src = "components/aframe-bmfont-text-component.js"),
    tags$script(src = "components/aframe-draw-component.js"),
    tags$script(src = "components/aframe-textwrap-component.js"),
    tags$script(src = "components/data-frame.js"),
    tags$script(src = "components/data-frame-column.js"),
    tags$script(src = "components/aframe-physics-system.js"),
    tags$script(src = "components/aframe-extras.js"),
    tags$script(src = "components/aframe-physics-sleepy.js")

  ),
  # Application title
  titlePanel("VR Data Explorer"),
  
  # Sidebar with a slider input for number of bins 
  sidebarLayout(
    sidebarPanel(
       radioButtons("datasource", "Select your data",
                          c("iris", "mtcars", "diamonds"),
                          selected = "iris"),
       tableOutput("dataset")
    ),
    
    mainPanel(
      aframeScene(
        physics = "debug: true; gravity: 0;",
        fog = "color: #bc483e; near: 0; far: 65;",
        aframeAssets(
          aframeMixin(id = "cube",
                      geometry = "primitive: box; height: 0.5; width: 0.5; depth: 0.5",
                      material = "color: #EF2D5E; transparent: true; opacity: 0.2"),
          aframeMixin(id = "cube-collided",
                      material = "color: #F2E646;"),
          aframeMixin(id = "cube-grabbed",
                      material = "color: #F2E646;"),
          atags$mixin(id = "point", class = "point",
                      geometry = "primitive: sphere; radius: 0.01",
                      material = "color: yellow;")
        ),
        aframeEntity(
          `static-body`="shape: sphere; sphereRadius: 0.02;",
          `vive-controls`="hand: left",
          `sphere-collider`="objects: .cube;",
          grab = ""
        ),
        aframeEntity(
          `static-body`="shape: sphere; sphereRadius: 0.02;",
          `vive-controls`="hand: right",
          `sphere-collider`="objects: .cube;",
          grab = ""
        ),
        aframeEntity(
          position= "0 0 -1", 
          aframeEntity(
            position = "0 1.5 0"#,
            # aframeEntity(class = "cube", mixin = "cube",
            #              position = "0.30 1.65 0"),
            #aScatter3dOutput("myplot")
          ),
          aframeEntity(
            position = ".5 1.5 0",
            aDataFrameOutput("mydat")
          ),
          aframeEntity(
            position = "-0.5 1.5 0",
            aframeSphere(`dynamic-body` = "",
              position = "0 .25 0",
              color = "yellow",
              radius = ".08",
              class = "draggable"
            ),
            aframeBox(
              `dynamic-body` = "",
              position = "0 -.25 0",
              depth = ".25", width = ".25",
              height = ".25",
              color = "blue",
              `drop-target` = "",
              class = "draggable"
            )
          ),
          aframeEntity(id = "sky", geometry = "primitive: sphere; radius: 65;",
                       material = "shader: skyGradient; colorTop: #353449; colorBottom: #BC483E; side: back"),
          aframeEntity(ground = ""),
          aframeBox(position = "0 1.5 -.5", color = "green", 
                    `dynamic-body` = "", sleepy = "grabbed",
                    class = "cube",
                    width = "0.25", height = "0.25", depth = "0.25"),
          aframeBox(position = "-0.5 1.5 -0.5", color = "yellow", 
                    `dynamic-body` = "mass: 10000;", 
                    class = "cube",
                    width = "0.25", height = "0.25", depth = "0.25"),
          aframeBox(position = "0.5 1.5 -.5", color = "red", 
                    `dynamic-body` = "linearDamping: 0.05; angularDamping: 0.05; mass: 100;", 
                    class = "cube",
                    width = "0.25", height = "0.25", depth = "0.25"),
          aframeEntity(geometry = "primitive: plane; height: 10; width: 10",
                       material = "color: white;",
                       `static-body` = "",
                       rotation = "-90 0 0", position = "0 -0.05 0"),
          aframeEntity(light = "type: point; color: #f4f4f4; intensity: 0.2; distance: 0",
                       position = "8 10 18"),
          aframeEntity(light = "type: point; color: #f4f4f4; intensity: 0.6; distance: 0",
                       position = "-8 10 -18"),
          aframeEntity(light = "type: ambient; color: #f4f4f4; intensity: 0.4;",
                       position = "-8 10 -18")
        )
      )
    )
  )
))
