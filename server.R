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
library(dplyr)
library(readr)
library(readxl)

mymtcars <- mtcars %>%
  mutate(wt = wt * 1000,
         vs = factor(vs, labels = c("V Engine", "Inline")),
         am = factor(am, labels = c("Automatic", "Manual"))) %>%
  rename("engine config" = vs, transmission = am, gears = gear, 
         carburetors = carb, "quarter mile (seconds)" = qsec, 
         cylinders = cyl, displacement = disp, 
         "drag ratio" = drat, horsepower = hp, "miles per gallon" = mpg,
         "weight (lbs)" = wt)

# Define server logic required to draw a histogram
shinyServer(function(input, output, session) {
  mappings <- c(x = "Sepal.Length",
                y = "Sepal.Width",
                z = "Petal.Length",
                color = "Petal.Width",
                size = "Petal.Width",
                shape = "Species")
 
  selected_data <- reactive({
    if(is.null(input$datafile)) {
      df <- switch(
        input$datasource, 
        "iris" = iris,
        "mtcars" = mymtcars,
        "diamonds" = diamonds
      ) 
    } else {
      ext <- strsplit(input$datafile$name, '.', fixed = TRUE)[[1]] %>%
        `[`(length(.)) %>%
        tolower()
      # add extenstion back to help read_excel determine type
      path <- paste(input$datafile$datapath, ext, sep = ".")
      file.rename(input$datafile$datapath, path)
      df <- switch(
        ext,
        csv = read_csv(path),
        xls = read_excel(path),
        xlsx = read_excel(path),
        rds = readRDS(path)
      )
    }
    df <- filter(df, complete.cases(df))
    updateSliderInput(session, "sample_limit", max = nrow(df))
    if(nrow(df) > input$sample_limit) sample_n(df, input$sample_limit) else df
  }) 
  
  output$myplot <- renderAScatter3d({
    # setup plot in ggplot and the aScatter3d widget will translate it into
    # aframe
    update <- input$mappings
    if(!is.null(update$variable)) {
      mappings[update$mapping] <<- update$variable
    }
    # clear out old mappings when the dataset changes
    mappings <<- mappings[mappings %in% names(selected_data())]
    positionals <- na.omit(mappings[c("x", "y", "z")])
    mappings %>% 
      as.list() %>%
      lapply(as.name) %>%
      do.call(what = aes) ->
      mappings_aes
    plt <- switch(
      length(positionals), 
      { #1
        ggplot(selected_data(), mappings_aes) + 
          geom_dotplot(method = "histodot")
      },
      { #2
        ggplot(selected_data(), mappings_aes) + geom_point()
      },
      { #3
        ggplot(selected_data(), mappings_aes) + geom_point()
      }
    ) 
    aScatter3d(plt)
  })
  
  output$mydat <- renderADataFrame({
    aDataFrame(selected_data())
  })
  
})
