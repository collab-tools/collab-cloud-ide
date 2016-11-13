import config from 'config';
import express from 'express';
import jwt from 'express-jwt';
import gitCtrl from '../controllers/git.controller';

const router = express.Router(); // eslint-disable-line new-cap
const auth = jwt({
  secret: config.jwt_secret,
});
router.use(auth);

router.route('/tree')
  .get(gitCtrl.getFileTree);

router.route('/file')
  .get(gitCtrl.getFile)
  .post(gitCtrl.createFile)
  .put(gitCtrl.upsertFile)
  .delete(gitCtrl.deleteFile);

export default router;
