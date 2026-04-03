const express = require('express');
const router = express.Router();
const Group = require('../models/group');
const auth = require('../middleware/auth');

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find().populate('creator', 'name email year branch');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a group
router.post('/', auth, async (req, res) => {
  try {
    const { name, subject, description, year, branch } = req.body;
    const group = new Group({
      name, subject, description, year, branch,
      creator: req.user.id,
      members: [req.user.id]
    });
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Join a group
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    if (group.members.includes(req.user.id))
      return res.status(400).json({ msg: 'Already a member' });
    group.members.push(req.user.id);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add resource to group
router.post('/:id/resources', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ msg: 'Group not found' });
    group.resources.push(req.body);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;