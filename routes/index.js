const express = require('express');
const router = express.Router();
const { fetchPosts } = require('../services/googleDocs');

// Home page
router.get('/', async (req, res) => {
    const posts = await fetchPosts();
    
    res.render('home', {
        title: 'MedPharm Hub',
        description: 'Clinical Pharmacy Knowledge Sharing | 臨床藥學知識分享',
        posts: posts.slice(0, 10)
    });
});

// Single post page
router.get('/post/:id', async (req, res) => {
    const posts = await fetchPosts();
    const post = posts.find(p => p.id === req.params.id);
    
    if (post) {
        res.render('post', {
            title: post.title,
            post: post
        });
    } else {
        res.status(404).send('Post not found');
    }
});

// All posts page
router.get('/posts', async (req, res) => {
    const posts = await fetchPosts();
    
    res.render('home', {
        title: 'All Posts',
        description: '所有文章 | All Articles',
        posts: posts
    });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About'
    });
});

module.exports = router;