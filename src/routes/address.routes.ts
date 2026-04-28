import { Router } from 'express';
import { getAddresses, addAddress, setDefaultAddress, deleteAddress } from '../controllers/address.controller';

const router = Router();

// Address routes - prepended with /api/addresses in index.ts
router.get('/:userId', getAddresses);
router.post('/:userId', addAddress);
router.put('/:userId/:id/default', setDefaultAddress);
router.delete('/:userId/:id', deleteAddress);

export default router;
