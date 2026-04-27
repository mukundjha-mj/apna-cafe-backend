import { Router } from 'express';
import { createOrder, updateOrderStatus, getOrdersByCafe, getOrdersByUser, getOrderById } from '../controllers/order.controller';

const router = Router();

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.get('/cafe/:cafeId', getOrdersByCafe);
router.get('/user/:userId', getOrdersByUser);

export default router;
