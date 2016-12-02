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
    #tags$script(src = "aframe.js"),
    tags$script(src = "components/aabb-collider.js"),
    tags$script(src = "components/grab.js"),
    tags$script(src = "components/ground.js"),
    tags$script(src = "shaders/skyGradient.js")
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
        aframeEntity(`hand-controls` = "left", 
                     `aabb-collider` = "objects: .cube, .aScatter3d;", 
                     grab = ""),
        aframeEntity(`hand-controls` = "right", 
                     `aabb-collider` = "objects: .cube, .aScatter3d;", 
                     grab = ""),
        aframeEntity(
          position="0 0 -1", 
          aframeEntity(class = "cube", mixin = "cube", 
                      position = "0.30 1.65 0"),
          # aframeBox(
          #   class = "cube", size = "1 1 1",
          #   position = "0 1.5 0", transparent = "true",
          #   opacity = ".25",
          #   aScatter3dOutput("myplot")
          # ),
          aScatter3dOutput("myplot"),
          aframeEntity(id = "sky", geometry = "primitive: sphere; radius: 65;",
                       material = "shader: skyGradient; colorTop: #353449; colorBottom: #BC483E; side: back"),
          aframeEntity(ground = ""),
          aframeEntity(light = "type: point; color: #f4f4f4; intensity: 0.2; distance: 0",
                       position = "8 10 18"),
          aframeEntity(light = "type: point; color: #f4f4f4; intensity: 0.6; distance: 0",
                       position = "-8 10 -18"),
          aframeEntity(light = "type: ambient; color: #f4f4f4; intensity: 0.4;",
                       position = "-8 10 -18")
        )
      )
       # HTML(paste(
       #   '<a-scene fog="color: #bc483e; near: 0; far: 65;">
       #     <a-assets>
       #     <a-mixin id="cube"
       #   geometry="primitive: box; height: 0.30; width: 0.30; depth: 0.30"
       #   material="color: #EF2D5E;"></a-mixin>
       #     <a-mixin id="cube-collided"
       #   material="color: #F2E646;"></a-mixin>
       #     <a-mixin id="cube-grabbed"
       #   material="color: #F2E646;"></a-mixin>
       #     </a-assets>
       #     <!-- Hands -->
       #     <a-entity ></a-entity>
       #     <a-entity hand-controls="right" aabb-collider="objects: .cube;" grab></a-entity>
       #     
       #     <!-- A-Frame cubes -->
       #     <a-entity position="0 0 -1">
       #     <a-entity class="cube" mixin="cube" position="0.30 1.65 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="0 1.95 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="-0.30 1.65 0"></a-entity>
       #     
       #     <a-entity class="cube" mixin="cube" position="0.60 1.35 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="0.60 1.05 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="0.60 0.75 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="0.60 0.45 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="0.60 0.15 0"></a-entity>
       #     
       #     <a-entity class="cube" mixin="cube" position="0.30 0.75 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="0 0.75 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="-0.30 0.75 0"></a-entity>
       #     
       #     <a-entity class="cube" mixin="cube" position="-0.60 1.35 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="-0.60 1.05 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="-0.60 0.75 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="-0.60 0.45 0"></a-entity>
       #     <a-entity class="cube" mixin="cube" position="-0.60 0.15 0"></a-entity>
       #     
       #     <!-- Environment -->
       #     <a-entity id="sky"
       #   geometry="primitive: sphere; radius: 65;"
       #   material="shader: skyGradient; colorTop: #353449; colorBottom: #BC483E; side: back"></a-entity>
       #     <a-entity ground></a-entity>
       #     <a-entity light="type: point; color: #f4f4f4; intensity: 0.2; distance: 0" position="8 10 18"></a-entity>
       #     <a-entity light="type: point; color: #f4f4f4; intensity: 0.6; distance: 0" position="-8 10 -18"></a-entity>
       #     <a-entity light="type: ambient; color: #f4f4f4; intensity: 0.4;" position="-8 10 -18"></a-entity>
       #     </a-entity>
       #     </a-scene>',
       #   sep = "\n"))
    )
  )
))
