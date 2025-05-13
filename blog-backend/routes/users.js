const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');

const router = express.Router();

// Get own profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: ['id','name','email','bio','avatar'] });
  const posts = await Post.findAll({ where: { userId: req.user.id }, order: [['createdAt','DESC']] });
  res.json({ user, posts });
});

module.exports = router;
