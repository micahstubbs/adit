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
    cat("plot update\n")
    update <- input$mappings
    if(!is.null(update$variable)) {
      cat(paste("mapping update:", update$mapping, update$variable, "\n"))
      mappings[update$mapping] <<- update$variable
    }
    usable_mappings <- mappings[mappings %in% names(selected_data())]
    cat(paste(names(mappings), mappings, sep = ": "), "\n")
    cat(usable_mappings[c("x", "y", "z")])
    req(!anyNA(usable_mappings[c("x", "y", "z")]), 
        cancelOutput = TRUE)
    cat("plotting\n")
    mappings_aes <- do.call(aes_string, as.list(usable_mappings))
    plt <- ggplot(selected_data(), mappings_aes) +
      geom_point()
    aScatter3d(plt)
  })
  
  output$mydat <- renderADataFrame({
    aDataFrame(selected_data())
  })
  
})
