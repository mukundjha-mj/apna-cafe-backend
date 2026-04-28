import { Router } from 'express';
import multer from 'multer';
import { getMenuItems, createMenuItem, updateMenuItem } from '../controllers/menu.controller';
import { uploadImage } from '../controllers/upload.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', getMenuItems);
router.post('/upload', upload.single('file'), uploadImage);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);

export default router;
