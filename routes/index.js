const express = require('express');
const router = express.Router();
const { fetchPosts } = require('../services/googleDocs');

// Home page
router.get('/', async (req, res, next) => {
    try {
        const lang = req.query.lang || 'en';
        const allPosts = await fetchPosts();
        const posts = allPosts.filter(p => p.lang === lang);

        res.render('home', {
            title: 'MedPharm Hub',
            description: 'Clinical Pharmacy Knowledge Sharing | 臨床藥學知識分享',
            posts: posts.slice(0, 10),
            currentLang: lang,
            isEnglish: lang === 'en',
            isChinese: lang === 'zh'
        });
    } catch (err) {
        next(err);
    }
});

// Single post page
router.get('/post/:id', async (req, res, next) => {
    try {
        const posts = await fetchPosts();
        const post = posts.find(p => p.id === req.params.id);

        if (post) {
            res.render('post', {
                title: post.title,
                post: post,
                currentLang: post.lang,
                isEnglish: post.lang === 'en',
                isChinese: post.lang === 'zh'
            });
        } else {
            res.status(404).render('404', { title: 'Post Not Found' });
        }
    } catch (err) {
        next(err);
    }
});

// All posts page
router.get('/posts', async (req, res, next) => {
    try {
        const lang = req.query.lang || 'en';
        const allPosts = await fetchPosts();
        const posts = allPosts.filter(p => p.lang === lang);

        res.render('home', {
            title: 'All Posts',
            description: '所有文章 | All Articles',
            posts: posts,
            currentLang: lang,
            isEnglish: lang === 'en',
            isChinese: lang === 'zh'
        });
    } catch (err) {
        next(err);
    }
});

// About page
router.get('/about', (req, res) => {
    const lang = req.query.lang || 'en';
    res.render('about', {
        title: 'About',
        currentLang: lang,
        isEnglish: lang === 'en',
        isChinese: lang === 'zh'
    });
});

module.exports = router;