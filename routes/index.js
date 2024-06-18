var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const localStrategy = require("passport-local")
const upload = require("./multer")

passport.use(new localStrategy(userModel.authenticate()))


router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});


router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});


router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate('posts')

  res.render('profile', { user, nav: true });
});


router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  const user = await userModel
    .findOne({ username: req.session.passport.user })
    .populate('posts')

  res.render('show', { user, nav: true });
});

router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('add', { user, nav: true });
});


router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.find()
    .populate("user")
  res.render('feed', { posts, user, nav: true });
});


// router.get('/edit', isLoggedIn, async function (req, res, next) {
//   const user = await userModel.findOne({ username: req.session.passport.user })
//   res.render('edit', { user,nav:true});
// });

// Route to render edit form
// router.get('/edit', async (req, res) => {
//   const user = await userModel.findOne({ username: req.session.passport.user })
//   res.render('edit', { user, nav: true });
// });

// // router for submission
// router.post('/edit/rename', async (req, res) => {
//   const user = await userModel.findOne({ username: req.session.passport.user })
//   user.username = req.body.newName;
//   await user.save();
//   res.redirect("/edit")
// });

// Route to render edit form
router.get('/edit', async (req, res) => {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });

    if (!user) {
      // Handle case where user is not found
      return res.status(404).send('User not found');
    }

    res.render('edit', { user, nav: true });
  } catch (error) {
    // Handle errors, e.g., database errors
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Route for form submission
router.post('/edit/rename', async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { username: req.session.passport.user },
      { $set: { username: req.body.newName } },
      { new: true } // Returns the updated document
    );

    if (!user) {
      return res.status(404).send('User not found');
    }

    req.session.passport.user = user.username;
    res.redirect("/edit");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});





router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })
  user.posts.push(post._id)
  await user.save()
  res.redirect("/profile")

});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  user.profileImage = req.file.filename
  await user.save()
  // res.redirect('/profile')

  // Check if the referer contains "/edit"
  if (req.headers.referer && req.headers.referer.includes("/edit")) {
    res.redirect('/edit');
  } else {
    res.redirect('/profile');
  }
});



router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact,
  })

  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile")
      })
    })
});


router.post('/login', passport.authenticate("local",
  {
    failureRedirect: '/',
    successRedirect: '/profile'
  }
),
  function (req, res, next) { }
);

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err) }
    res.redirect('/')
  })
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

module.exports = router;
