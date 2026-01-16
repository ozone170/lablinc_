const router = require('express').Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime()
  });
});

module.exports = router;

