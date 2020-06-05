const express = require('express');
const router = express.Router();

const User = require('../models/User.model');
const Recipe = require('../models/Recipe.model');

const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const passport = require('passport');

const nodemailer = require('nodemailer');

// SMTP
let transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'tester123.peterpan@gmail.com',
    pass: '89675rutitgzrvuz',
  },
});

router.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

//Google Signup
router.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/willkommen',
    failureRedirect: '/', // here you would redirect to the login page using traditional login approach
  })
);

router.post('/signup', (req, res, next) => {
  const email = req.body.email;

  // creates a 4 digit random token
  const tokenArr = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 10)
  ); // [ 1, 4, 5, 8 ]
  const token = tokenArr.join(''); // "1458"

  transporter
    .sendMail({
      from: '"Willkommen bei HelloCook " <myawesome@project.com>',
      to: email,
      subject: 'Bitte bestätige deine Anmeldung',
      text: `Guten Tag, vielen Dank für deine Anmeldung. Wir freuen uns, dass wir dich bei HelloCook begrüßen dürfen!
    Um Ihren Zugang zu bestätigen, klicken Sie einfach hier: ${process.env.EMAIL_LINK}${token}`,
      html: `Um Ihren Zugang zu bestätigen, klicken Sie einfach: <a href="${process.env.EMAIL_LINK}${token}">hier!</a>`,
    })
    .then(() => {
      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(req.body.password, salt);
      let user = new User({
        email: req.body.email,
        username: req.body.username,
        password: hashPass,
        token: token,
      });
      user.save().then(() => {
        req.logIn(user, () => {
          res.redirect('/willkommen');
        });
      });
    });
});

router.get('/verify-email-link/:token', (req, res) => {
  if (req.user.token === req.params.token) {
    req.user.verifiedEmail = true;
    req.user.save().then(() => {
      // more professional : res.redirect and set a flash message before
      req.flash(
        'message',
        'Super! Du hast deine E-Mail erfolgreich verifiziert.'
      );
      res.redirect('/willkommen');
    });
  }
});

// willkommen-seite
router.get('/willkommen', (req, res) => {
  const messages = req.flash('message');
  const verifiedEmail = req.user.verifiedEmail;

  Recipe.find().then((data) => {
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

    let sortedRecipes = [...filteredData].sort((a,b) => { if (a.createdAt < b.createdAt) { return 1 } else { return -1 } }).slice(0,5)



    console.log(sortedRecipes)
    // let sortedRecipes = Recipe.find().then((data) =>  {
    // }
    // )

    res.render('auth/personalized-page', {
      user: req.user,
      messages: messages,
      verifiedEmail: verifiedEmail,
      recipes: filteredData,
      count: recipeCounter,
      nutrition: uniqueNutrition,
      dishType: uniqueDishtype,
      sortedRecipe1: sortedRecipes[0],
      sortedRecipe2: sortedRecipes[1],
      sortedRecipe3: sortedRecipes[2],
      sortedRecipe4: sortedRecipes[3],
      sortedRecipe5: sortedRecipes[4]

    });
  });
});

router.get('/login', (req, res, next) => {
  res.render('auth/login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/willkommen', // pick up the redirectBackTo parameter and after login redirect the user there. ( default / )
    failureRedirect: '/login',
    failureFlash: true,
    passReqToCallback: true,
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
