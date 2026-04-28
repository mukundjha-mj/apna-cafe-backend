import { Router } from 'express';
import { getCafeDetails, getAllCafes, createCafe, updateCafe } from '../controllers/cafe.controller';

const router = Router();

router.get('/', getAllCafes);
router.get('/:id', getCafeDetails);
router.post('/', createCafe);
router.patch('/:id', updateCafe);

export default router;
