import { Router } from 'express';
import { getWalletData } from '../controllers/wallet.controller';

const router = Router();

router.get('/:userId', getWalletData);

export default router;
