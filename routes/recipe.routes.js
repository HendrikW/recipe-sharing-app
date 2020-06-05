const express = require('express');
const router = express.Router();

const Recipe = require('../models/Recipe.model');

const uploadCloud = require('../config/cloudinary.js');

//Show all recipes on recipe-overview
router.get('/', (req, res, next) => {
  // const level = req.query.level
  Recipe.find().then((data) => {

    // Filter
    const filteredData = data.filter((recipe) => {
      if (req.query.level && req.query.dishType && req.query.nutrition) {
        return (
          recipe.level === req.query.level &&
          recipe.dishType === req.query.dishType &&
          recipe.nutrition === req.query.nutrition
        );
      } else if (req.query.dishType && req.query.nutrition) {
        return (
          recipe.dishType === req.query.dishType &&
          recipe.nutrition === req.query.nutrition
        );
      } else if (req.query.nutrition && req.query.level) {
        return (
          recipe.nutrition === req.query.nutrition &&
          recipe.level === req.query.level
        );
      } else if (req.query.level && req.query.dishType) {
        return (
          recipe.level === req.query.level &&
          recipe.dishType === req.query.dishType
        );
      } else if (req.query.level) {
        return recipe.level === req.query.level;
      } else if (req.query.nutrition) {
        return recipe.nutrition === req.query.nutrition;
      } else if (req.query.dishType) {
        return recipe.dishType === req.query.dishType;
      } else {
        return recipe;
      }
    
    });

    let recipeCounter = filteredData.length;

    //TODO - apply all the filters before sending the data to the view

    // const result = words.filter(word => word.length > 6);

    // console.log('All my recipes:' + data + '========> recipeData');
    let uniqueNutrition = [];
    data.forEach((recipe) => {
      if (!uniqueNutrition.includes(recipe.nutrition)) {
        uniqueNutrition.push(recipe.nutrition);
      }
    });

    let uniqueDishtype = [];
    data.forEach((recipe) => {
      if (uniqueDishtype.includes(recipe.dishType) == false) {
        uniqueDishtype.push(recipe.dishType);
      }
    });

    res.render('recipes/recipe-overview', {
      //The value you give to "recipes:" is the one that the view is going to receive
      recipes: filteredData,
      count: recipeCounter,
      nutrition: uniqueNutrition,
      dishType: uniqueDishtype,
      user: req.user,
    });
  });
});

router.get('/neu', (req, res, next) => {
  res.render('recipes/add-recipe');
});

router.post('/', uploadCloud.single('photo'), (req, res, next) => {
  console.log('req.body', req.body); // access form infos
  console.log('req.file', req.file); //access picture infos, you can see all the infos from the picture

  let image = '';

  if (req.file) {
    image = req.file.url;
  }

  let ingredients = req.body.ingredients.split('\n'); // new line split
  let directions = req.body.directions.split('\n'); // split new line

  let user = req.user;
  console.log('Das ist der User', user)

  let recipe = new Recipe({
    title: req.body.title,
    image: image,
    ingredients: ingredients,
    directions: directions,
    level: req.body.level,
    nutrition: req.body.nutrition,
    portions: req.body.portions,
    dishType: req.body.dishType,
    duration: req.body.duration,
    author: user,
  });

  recipe
    .save()
    .then((recipe) => {
      // console.log("recipe",recipe)
      //res.redirect('/rezepte')
      res.redirect(`/rezepte/${recipe._id}`);
    })

    .catch((error) => {
      console.log('Error while getting the recipes from the DB: ', error);
    });
});

router.get('/:id', (req, res, next) => {
  Recipe.findById(req.params.id)
    .then((data) => {
      // let date = data.created_at.toString().slice(0,10);
      // console.log('date', date);
      res.render('recipes/recipe-details', data);
    })
    .catch((error) => {
      console.log('Error while getting the recipes from the DB: ', error);
    });
});

// EDIT GET
router.get('/:id/bearbeiten', (req, res, next) => {
  Recipe.findById(req.params.id)
    .then((mongoRecipe) => {
      console.log('mongoRecipe', mongoRecipe);
      let recipe = {
        title: mongoRecipe.title,
        image: mongoRecipe.image ? mongoRecipe.image : '',
        ingredients: mongoRecipe.ingredients.join('\n'),
        directions: mongoRecipe.directions.join('\n'),
        level: mongoRecipe.level,
        nutrition: mongoRecipe.nutrition ? mongoRecipe.nutrition : '',
        portions: mongoRecipe.portions ? mongoRecipe.portions : '',
        dishType: mongoRecipe.dishType,
        duration: mongoRecipe.duration ? mongoRecipe.duration : '',
        id: req.params.id,
      };
      console.log('newRecipe', recipe);
      res.render('recipes/edit-recipe', { recipe });
    })
    .catch((error) => {
      console.log('Error while editing the recipe from the DB: ', error);
    });
});

// DELETE
router.post('/:id/entfernen', (req, res) => {
  console.log(req.params.id);

  Recipe.findByIdAndDelete(req.params.id).then(() => {
    res.redirect('/rezepte');
  });
});

// EDIT POST

router.post(
  '/:id/bearbeiten',
  uploadCloud.single('photo'),
  (req, res, next) => {
    //console.log('req.body', req.body);

    console.log('ingredients', req.body.ingredients);
    //console.log('directions', req.body.directions);

    Recipe.findOne({ _id: req.params.id }, function (err, recipe) {
      recipe.title = req.body.title;
      recipe.image = req.file ? req.file.url : recipe.image;
      recipe.ingredients = req.body.ingredients.split('\n');
      recipe.directions = req.body.directions.split('\n');
      recipe.level = req.body.level;
      recipe.nutrition = req.body.nutrition;
      recipe.portions = req.body.portions;
      recipe.dishType = req.body.dishType;
      recipe.duration = req.body.duration;
      recipe.save(function (err) {
        if (err) {
          console.error('ERROR!', err);
        }
        res.redirect('/rezepte');
      });
    });

    // let ingredients = req.body.ingredients.split('\r'); // new line split

    // let directions = req.body.directions.split('\r'); // split new line

    // Recipe.findByIdAndUpdate(req.params.id, {
    //   title: req.body.title,
    //   image: image,
    //   ingredients: req.body.ingredients,
    //   directions: req.body.directions,
    //   level: req.body.level,
    //   cuisine: req.body.cuisine,
    //   portions: req.body.portions,
    //   dishType: req.body.dishType,
    //   duration: req.body.duration,
    // })
    //.then(() => {
    //  res.redirect('/rezepte');
    //});
  }
);

module.exports = router;
