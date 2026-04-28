import { Router } from 'express';
import { syncProfile, getProfile } from '../controllers/profile.controller';

const router = Router();

router.post('/sync', syncProfile);
router.get('/:id', getProfile);

export default router;
