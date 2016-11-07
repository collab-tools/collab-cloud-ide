import express from 'express';
import mappingRoutes from './mapping.route';
import authRoutes from './auth.route';
import gitRoutes from './git.route';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount mapping routes at /mappings
router.use('/mapping', mappingRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount github routes at /git
router.use('/git', gitRoutes);

export default router;
