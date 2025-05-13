// routes/posts.js
const express = require('express');
const auth = require('../middleware/auth');
const multer = require('multer');
const Post = require('../models/Post');
const supabase = require('../config/supabase');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Helper to normalize tags
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Create Post
router.post(
  '/',
  auth,
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      const tagsArray = parseTags(tags);

      let imageUrl = null;
      if (req.file) {
        const filename = `${uuidv4()}${path.extname(req.file.originalname)}`;
        const bucket = process.env.SUPABASE_BUCKET;

        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from(bucket)
          .upload(filename, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });
        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          return res.status(500).json({ message: 'Image upload failed' });
        }

        const { data: urlData, error: urlError } = supabase
          .storage
          .from(bucket)
          .getPublicUrl(filename);
        if (urlError) {
          console.error('Supabase getPublicUrl error:', urlError);
          return res.status(500).json({ message: 'Could not get image URL' });
        }
        imageUrl = urlData.publicUrl;
      }

      const post = await Post.create({
        title,
        content,
        tags: tagsArray,
        imageUrl,
        userId: req.user.id,
      });

      return res.json(post);
    } catch (err) {
      console.error('Error creating post:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// Read All
router.get('/', async (req, res) => {
  const posts = await Post.findAll({
    include: 'author',
    order: [['createdAt', 'DESC']],
  });
  res.json(posts);
});

// Read One
router.get('/:id', async (req, res) => {
  const post = await Post.findByPk(req.params.id, { include: 'author' });
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
});

// Update Post (with optional new image)
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    // Parse and normalize tags
    const tagsArray = parseTags(req.body.tags);

    // Handle optional new image
    let imageUrl = post.imageUrl;
    if (req.file) {
      const filename = `${uuidv4()}${path.extname(req.file.originalname)}`;
      const bucket = process.env.SUPABASE_BUCKET;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });
      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed' });
      }

      const { data: urlData, error: urlError } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(filename);
      if (urlError) {
        console.error('Supabase getPublicUrl error:', urlError);
        return res.status(500).json({ message: 'Could not get image URL' });
      }
      imageUrl = urlData.publicUrl;
    }

    // Update fields
    const { title, content } = req.body;
    await post.update({
      title,
      content,
      tags: tagsArray,
      imageUrl,
    });

    res.json(post);
  } catch (err) {
    console.error('Error updating post:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete Post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.userId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error deleting post:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
