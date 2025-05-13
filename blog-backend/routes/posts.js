const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

const router = express.Router();

// ─── Multer Setup ────────────────────────────────────────────────────────────
// Store uploads in /uploads, naming files uniquely
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ─── Create Post (with optional image upload) ────────────────────────────────
router.post(
  '/',
  auth,
  upload.single('image'),  // <formData key="image">
  async (req, res) => {
    try {
      // Extract fields
      const { title, content, tags } = req.body;
      // tags come in as JSON-stringified array
      const tagsArray = tags ? JSON.parse(tags) : [];

      // Build imageUrl if file was uploaded
      let imageUrl = null;
      if (req.file) {
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      }

      // Create the post record
      const post = await Post.create({
        title,
        content,
        tags: tagsArray,
        imageUrl,
        userId: req.user.id
      });
      res.json(post);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// ─── Read All Posts ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const posts = await Post.findAll({
    include: 'author',
    order: [['createdAt', 'DESC']]
  });
  res.json(posts);
});

// ─── Read Single Post ─────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const post = await Post.findByPk(req.params.id, { include: 'author' });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// ─── Update Post ──────────────────────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await post.update(req.body);
  res.json(post);
});

// ─── Delete Post ──────────────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  await post.destroy();
  res.json({ message: 'Post deleted' });
});

module.exports = router;
