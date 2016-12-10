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
  mappings <- c(x = "Sepal.Length",
                y = "Sepal.Width",
                z = "Petal.Length",
                color = "Petal.Width",
                shape = "Species")
  # mappings <- c(x = "wt",
  #               y = "mpg",
  #               z = "hp")
  map_message <- reactiveValues()
  dummy <- reactiveValues(x = 0)
  mappings_string <- reactive({
    dummy$x
    input$mapppings
    cat("mappings_aes\n")
    reactiveValuesToList(map_message)
    if(!is.null(map_message$variable)) {
      mappings[map_message$mapping] <- map_message$variable
    }
    mappings
  })
  
  observeEvent(input$mappings, {
    lapply(input$mappings, function(x)cat(paste0(x, "\n")))
    map_message$variable <- input$mappings$variable
    map_message$mapping <- input$mappings$mapping
    map_message$chart <- map_message$chart
    dummy$x <- dummy$x + 1
    cat(dummy$x, "\n")
  })
  # observe({
  #   mappings <- mappings[mappings %in% names(selected_data())]
  #   })
  
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
    cat("plot", dummy$x, "\n")
    input$mappings
    dummy$x
    mappings <- mappings_string()
    mappings <- mappings[mappings %in% names(selected_data())]
    req(length(mappings) > 0)
    mappings_aes <- do.call(aes_string, as.list(mappings))
    
    
    plt <- ggplot(selected_data(), mappings_aes) +
      geom_point()
    aScatter3d(plt)
  })
  
  output$mydat <- renderADataFrame({
    aDataFrame(selected_data())
  })
  
})
