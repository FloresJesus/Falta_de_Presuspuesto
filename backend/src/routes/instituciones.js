const express = require('express');
const { supabaseAnon } = require('../supabase');
const asyncHandler = require('../middleware/async-handler');

const router = express.Router();

// Lectura pública: usa el cliente anónimo para que se apliquen las políticas RLS.
router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAnon
    .from('instituciones')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })
    .limit(50);

  if (error) throw error;
  res.json({ data });
}));

module.exports = router;
