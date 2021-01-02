const express = require('express');
const authRouter = require('../../modules/users/auth_router');

const router = express.Router();

router.use('/auth', authRouter);

module.exports = router;
