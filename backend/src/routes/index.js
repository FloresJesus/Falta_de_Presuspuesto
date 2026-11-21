const express = require('express');
const health = require('./health');
const instituciones = require('./instituciones');
const perfiles = require('./perfiles');

const router = express.Router();

router.use(health);
router.use('/instituciones', instituciones);
router.use('/perfiles', perfiles);

module.exports = router;
