const express = require('express');
const { supabaseService } = require('../supabase');
const asyncHandler = require('../middleware/async-handler');

const router = express.Router();

router.get('/health', asyncHandler(async (req, res) => {
  const { error, count } = await supabaseService
    .from('categorias_educativas')
    .select('id', { count: 'exact', head: true });

  if (error) {
    return res.status(503).json({ status: 'error', database: false, detalle: error.message });
  }

  return res.json({ status: 'ok', database: true, categorias_educativas: count });
}));

module.exports = router;
