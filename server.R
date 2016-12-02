#
# This is the server logic of a Shiny web application. You can run the 
# application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
# 
#    http://shiny.rstudio.com/
#

library(shiny)
library(shinyaframe)
library(ggplot2)

# Define server logic required to draw a histogram
shinyServer(function(input, output) {
   
  output$dataset <- renderTable({
    
    head(switch(input$datasource, 
           "iris" = iris,
           "mtcars" = mtcars,
           "diamonds" = as.data.frame(diamonds)))
  })
  
  output$myplot <- renderAScatter3d({
    x <- scales::rescale(iris[[1]], to = c(-0.25, 0.25))
    y <- scales::rescale(iris[[2]], to = c(-0.25, 0.25))
    z <- scales::rescale(iris[[3]], to = c(-0.25, 0.25))
    aScatter3d(list(
      parentTheme = "cube",
      x = x, y = y, z = z, 
      color = rgb(colorRamp(RColorBrewer::brewer.pal(5, "Spectral"))(scales::rescale(iris$Petal.Width)), maxColorValue = 255),
      geom = c("sphere", "box", 
               "torus")[as.integer(as.factor(iris$Species))]))
  })
  # output$vrplot <- renderUI({
  #   x <- scales::rescale(iris[[1]], to = c(-0.5, 0.5))
  #   y <- scales::rescale(iris[[2]], to = c(-0.5, 0.5))
  #   z <- scales::rescale(iris[[3]], to = c(-0.5, 0.5))
  #   points <- paste(x, y, z)
  #   makeGeom <- function(p) {
  #     list(aframeSphere(color = "yellow", radius = ".01",
  #                  position = p))
  #   }
  #   geoms <- unname(Map(makeGeom, points))
  #   do.call(aframeEntity, geoms)
  # })
  
})
