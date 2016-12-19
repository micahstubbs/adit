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
    update <- input$mappings
    if(!is.null(update$variable)) {
      mappings[update$mapping] <<- update$variable
    }
    usable_mappings <- mappings[mappings %in% names(selected_data())]
    #req(!anyNA(usable_mappings[c("x", "y", "z")]), cancelOutput = TRUE)
    positionals <- na.omit(usable_mappings[c("x", "y", "z")])
    mappings_aes <- do.call(aes_string, as.list(usable_mappings))
    plt <- switch(
      length(positionals), 
      { #1
        mappings_aes <- do.call(aes_string, as.list(usable_mappings))
        ggplot(selected_data(), mappings_aes) + geom_dotplot()
      },
      { #2
        mappings_aes <- do.call(aes_string, as.list(usable_mappings))
        ggplot(selected_data(), mappings_aes) + geom_dotplot()
      },
      { #3
        mappings_aes <- do.call(aes_string, as.list(usable_mappings))
        ggplot(selected_data(), mappings_aes) + geom_point()
      }
    ) 
    aScatter3d(plt)
  })
  
  output$mydat <- renderADataFrame({
    aDataFrame(selected_data())
  })
  
})
