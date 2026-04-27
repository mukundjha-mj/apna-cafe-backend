import { Router } from 'express';
import { getMenuItems, createMenuItem } from '../controllers/menu.controller';

const router = Router();

router.get('/', getMenuItems);
router.post('/', createMenuItem);

export default router;
