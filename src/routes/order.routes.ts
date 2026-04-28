import { Router } from 'express';
import { createOrder, updateOrderStatus, getOrdersByCafe, getOrdersByUser, getOrderById, getDashboardStats, getSalesChartData } from '../controllers/order.controller';

const router = Router();

router.post('/', createOrder);
router.get('/analytics/:cafeId', getDashboardStats);
router.get('/sales-chart/:cafeId', getSalesChartData);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.get('/cafe/:cafeId', getOrdersByCafe);
router.get('/user/:userId', getOrdersByUser);

export default router;
