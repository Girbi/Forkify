import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { MODAL_CLOSE_SEC } from './config.js'

import * as model from './model.js'
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js'
import addRecipeView from './views/addRecipeView.js'

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
if (module.hot) module.hot.accept()

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1)
    if (!id) return

    recipeView.renderSpinner()

    // 0. Update results view to mark selected search result
    bookmarksView.update(model.state.bookmarks)
    resultsView.update(model.getSearchResultsPage())

    // 1. Loading recipe
    await model.loadRecipe(id)

    // 2. Rendering recipe
    recipeView.render(model.state.recipe)
  } catch (error) {
    console.error(error)
    recipeView.renderError()
  }
}

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner()

    // Get query
    const query = searchView.getQuery()
    if (!query) return

    // Load search results
    await model.loadSearchResults(query)

    // Render search results
    resultsView.render(model.getSearchResultsPage())

    // Render init pagination buttons
    paginationView.render(model.state.search)
  } catch (error) {
    console.log(error)
  }
}

const controlServings = function (newServings) {
  // update recipe servings (in state)
  model.updateServings(newServings)

  // update the recipeView
  recipeView.update(model.state.recipe)
}

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage))
  paginationView.render(model.state.search)
}

const controlAddBookmark = function () {
  // Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe)
  else model.deleteBookmark(model.state.recipe.id)
  // Update recipeView
  recipeView.update(model.state.recipe)

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function (newRecipe) {
  try {
    // Render spinner
    addRecipeView.renderSpinner()

    // Upload new recipe
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe)

    // Render recipe
    recipeView.render(model.state.recipe)

    // Success message
    addRecipeView.renderMessage()

    // Render bookmarks view
    bookmarksView.render(model.state.bookmarks)

    // Change ID in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`)
    // window.history.back() going back to last page

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (error) {
    console.log(error)
    addRecipeView.renderError(error.message)
  }
}
;(() => {
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
  console.log('Welcome!')
})()
