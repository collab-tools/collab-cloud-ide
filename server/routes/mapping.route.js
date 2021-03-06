import config from 'config';
import express from 'express';
import jwt from 'express-jwt';
import mappingCtrl from '../controllers/mapping.controller';

const router = express.Router(); // eslint-disable-line new-cap
const auth = jwt({
  secret: config.jwt_secret,
});
router.use(auth);

router.route('/')
  .get(mappingCtrl.getMappings)
  .put(mappingCtrl.setMappings)
  .delete(mappingCtrl.deleteMapping);

export default router;
