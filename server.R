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
  mappings <- list(x = "Sepal.Length",
                y = "Sepal.Width",
                z = "Petal.Length",
                color = "Petal.Width",
                shape = "Species")
  
  mappings_aes <- reactive({
    if(!is.null(input$mappings$variable)) {
      mappings[input$mappings$mapping] <- input$mappings$variable
    }
      mappings <- mappings[mappings %in% names(selected_data())]
      do.call(aes_string, mappings)
  })
  
  selected_data <- reactive({
    switch(input$datasource, 
           "iris" = iris,
           "mtcars" = mtcars,
           "diamonds" = as.data.frame(diamonds))
  }) 
  
  output$dataset <- renderTable({
    head(selected_data())
  })
  

  output$myplot <- renderAScatter3d({
    # setup plot in ggplot and the aScatter3d widget will translate it into
    # aframe
    #cat(names(as.character(mappings_aes())), as.character(mappings_aes()))
    req(length(mappings_aes()) > 0)
    
    plt <- ggplot(iris, mappings_aes()) +
      geom_point()
    aScatter3d(plt)
  })
  
  output$mydat <- renderADataFrame({
    aDataFrame(selected_data())
  })
  
})
