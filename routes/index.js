var express = require('express');
var router = express.Router();

var userModel = require('./users')
var passport = require('passport')
var localStrategy = require('passport-local')
passport.use(new localStrategy(userModel.authenticate()))
const transactionModel = require('./transaction')
const multer = require('multer');
const upload = multer();




function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/login');
}


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.post('/register', (req, res, next) => {
  var newUser = {
    //user data here
    username: req.body.username,
    email: req.body.email
    //user data here
  };
  userModel
    .register(newUser, req.body.password)
    .then((result) => {
      passport.authenticate('local')(req, res, () => {
        //destination after user register
        res.redirect('/home');
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get('/home', isloggedIn, async (req, res, next) => {

  const loggedInUser = await userModel.findOne({
    username: req.session.passport.user
  })

  const userTransactions = await transactionModel.find({
    user: loggedInUser._id
  })

  console.log(userTransactions)

  res.render('home', { loggedInUser, userTransactions })
})

router.get('/login', (req, res, next) => {
  res.render('login')
})

router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
  }),
  (req, res, next) => { }
);

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});


router.post('/updateBudget', isloggedIn, async (req, res, next) => {

  const loggedInUser = await userModel.findOne({
    username: req.session.passport.user
  })

  loggedInUser.monthlyBudget += Number(req.body.budget)

  await loggedInUser.save()

  res.json({ message: 'budget updated', newBudget: loggedInUser.monthlyBudget })
})


router.post("/createTransaction", isloggedIn, upload.none(), async (req, res) => {

  console.log(req.body)

  return

  const loggedInUser = await userModel.findOne({
    username: req.session.passport.user
  })

  const newTransaction = await transactionModel.create({
    amount: Number(req.body.amount),
    transactionType: req.body.transactionType,
    description: req.body.description,
    user: req.user._id
  })

  if (newTransaction.transactionType == 'incoming') {
    loggedInUser.monthlyBudget += Number(newTransaction.amount)
  }
  else {
    loggedInUser.monthlyBudget -= Number(newTransaction.amount)
  }

  await loggedInUser.save()

  // res.redirect('/home')


})






module.exports = router;
