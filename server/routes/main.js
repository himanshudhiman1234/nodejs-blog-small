const express = require("express");
const router = express.Router();
const Post = require("../models/Post")

router.get('', async (req, res) => {  
    const locals = {
        title: "Nodejs Blog",
        description: "Simple Blog created with Node.js, Express.js & MongoDB"
    };

    let perPage = 2;
    let page = parseInt(req.query.page) || 1;

    try {
        // Retrieve paginated posts
        const data = await Post.aggregate([
            { $sort: { createdAt: -1 } }
        ])
        .skip(perPage * (page - 1))
        .limit(perPage);

        // Get total count of posts for pagination
        const count = await Post.countDocuments();
        const nextPage = page + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', { locals, data, current: page, nextPage: hasNextPage ? nextPage : null });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error retrieving posts");
    }
});



function insertPostData(){
    Post.insertMany([
        {
            title:"hiding a slug",
            body :"this is body exist"
        }
    ])
}

insertPostData();


router.get('/posts/:id', async (req, res) => {
    try {
        const locals = {
            title: "Nodejs Blog",
            description: "Simple Blog created with Nodejs, Expressjs & Mongodb"
        };

        let slug = req.params.id;
        const data = await Post.findById(slug);  // Pass `slug` directly

        res.render('post', { locals, data });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving the post");
    }
});


router.post('/search',async(req,res)=>{


    try {
        const locals = {
            title: "Search",
            description: "Simple Blog"
        };
    
        let searchTerm = req.body.searchTerm;
    
        const htmlSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, ""); // Fixed regex to allow only letters and numbers
        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(htmlSpecialChar, 'i') } },
                { body: { $regex: new RegExp(htmlSpecialChar, 'i') } }
            ]
        });
    
        res.render("search", {
            data,
            locals
        });
    } catch (error) {
        console.log(error);
    }
    
})



router.get('/about',(req,res)=>[
    res.render("about")
])
module.exports = router;