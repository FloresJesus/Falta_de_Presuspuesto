const express = require('express');
const { supabaseService } = require('../supabase');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../middleware/async-handler');

const router = express.Router();

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { data, error } = await supabaseService
    .from('perfiles')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) throw error;
  res.json({ data });
}));

module.exports = router;
