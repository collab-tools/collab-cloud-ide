import config from 'config';
import express from 'express';
import jwt from 'express-jwt';
import authCtrl from '../controllers/auth.controller';

const router = express.Router(); // eslint-disable-line new-cap
const auth = jwt({
  secret: config.jwt_secret,
});
router.use(auth);

router.route('/verify')
  .post(authCtrl.verify);

export default router;
