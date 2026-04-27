import { Router } from 'express';
import { getCafeDetails, getAllCafes, createCafe } from '../controllers/cafe.controller';

const router = Router();

router.get('/', getAllCafes);
router.get('/:id', getCafeDetails);
router.post('/', createCafe);

export default router;
