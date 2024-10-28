const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const User = require("../models/User");
const adminLayout = '../views/layouts/admin';
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const jwtSecret = process.env.JWT_SECRET;  // Make sure this value is properly loaded


const authMiddleware = (req,res,next) =>{
    const token =  req.cookies.token;

    if(!token){
        return res.status(401).json({message : "Unauthorized"})
    }

    try{
        const decoded = jwt.verify(token ,jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch(error){
        res.status(401).json({message:"unauthorized message"})
    }
}



router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "NodeJS Blog",
            description: "Simple Blog"
        };

        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});

router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        console.log(user);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Sign the token with the secret key
        const token = jwt.sign({ userId: user._id }, jwtSecret);

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

router.get('/dashboard', authMiddleware , async (req, res) => {

    try{
     const locals = {
        title: "NodeJS Blog",
        description: "Simple Blog"
    };

    const data = await Post.find();
    console.log(data)
    res.render('admin/dashboard',{
        locals,
        data
    })
   
    }catch(error) {
        console.log(error);
    }
});


/**
 * GET /
 * Admin - Create New Post
*/
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
      const locals = {
        title: 'Add Post',
        description: 'Simple Blog created with NodeJs, Express & MongoDb.'
      }
  
      const data = await Post.find();
      res.render('admin/add-post', {
        locals,
        layout: adminLayout
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });

  /**
 * POST /
 * Admin - Create New Post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});


router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      const locals = {
        title: "Edit Post",
        description: "Free NodeJs User Management System",
      };
  
      const data = await Post.findOne({ _id: req.params.id });
  
      res.render('admin/edit-post', {
        locals,
        data,
        layout: adminLayout
      })
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  /**
   * PUT /
   * Admin - Create New Post
  */
  router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
  
      await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now()
      });
  
      res.redirect(`/edit-post/${req.params.id}`);
  
    } catch (error) {
      console.log(error);
    }
  
  });
  
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User created' });
        } catch (error) {
            res.status(409).json({ message: 'Username already in use' });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
        console.log(error);
    }
});


router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

    try {
      await Post.deleteOne( { _id: req.params.id } );
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }
  
  });
  
  
  /**
   * GET /
   * Admin Logout
  */
  router.get('/logout', (req, res) => {
    res.clearCookie('token');
    //res.json({ message: 'Logout successful.'});
    res.redirect('/');
  });
  
  
module.exports = router;
