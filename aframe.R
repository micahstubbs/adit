library(shiny)
aframeScene <- function(...) {
  tag("a-scene", list(...))  
}

aframeAssets <- function(...) {
  tag("a-assets", list(...))
}

aframeMixin <- function(...) {
  tag("a-mixin", list(...))
}

aframeEntity <- function(...) {
  tag("a-entity", list(...))
}

aframeSphere <- function(...) {
  tag("a-sphere", list(...))
}

aframeBox <- function(...) {
  tag("a-box", list(...))
}