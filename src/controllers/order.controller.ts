import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';
import { getIO } from '../lib/socket';

const formatOrderNumber = (num: number) => num.toString().padStart(4, '0');

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      userId, 
      cafeId, 
      type, 
      tableNumber, 
      address,
      paymentMethod, 
      subtotal, 
      deliveryFee, 
      serviceFee, 
      discount, 
      totalAmount, 
      items 
    } = req.body;
    
    const orderItemsData = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem) {
        res.status(404).json({ success: false, message: `Menu item ${item.menuItemId} not found` });
        return;
      }
      
      orderItemsData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        itemName: menuItem.name,
        size: item.size || null,
        customNote: item.customNote || null,
      });
    }

    // Ensure user profile exists (fallback)
    await prisma.profile.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: 'Guest User',
        phone: '',
      },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        cafeId,
        type,
        tableNumber,
        address,
        paymentMethod: paymentMethod || 'cash',
        subtotal,
        deliveryFee: deliveryFee || 0,
        serviceFee: serviceFee || 0,
        discount: discount || 0,
        totalAmount,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        user: true
      },
    });

    const formattedOrder = { ...order, orderNumber: formatOrderNumber(order.orderNumber) };

    // Emit socket event to cafe dashboard
    const io = getIO();
    io.to(`cafe-${cafeId}`).emit('new-order', formattedOrder);

    res.status(201).json({ success: true, data: formattedOrder });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        user: true
      },
    });

    const formattedOrder = { ...updatedOrder, orderNumber: formatOrderNumber(updatedOrder.orderNumber) };

    // Emit socket event to user tracking the order AND to the cafe dashboard
    const io = getIO();
    io.to(`order-${id}`).emit('order-updated', formattedOrder);
    io.to(`cafe-${updatedOrder.cafeId}`).emit('order-updated', formattedOrder);

    res.status(200).json({ success: true, data: formattedOrder });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByCafe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cafeId = req.params.cafeId as string;
    const orders = await prisma.order.findMany({
      where: { cafeId },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedOrders = orders.map(o => ({ ...o, orderNumber: formatOrderNumber(o.orderNumber) }));
    res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        cafe: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formattedOrders = orders.map(o => ({ ...o, orderNumber: formatOrderNumber(o.orderNumber) }));
    res.status(200).json({ success: true, data: formattedOrders });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { menuItem: true }
        },
        cafe: true,
        user: true
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const formattedOrder = { ...order, orderNumber: formatOrderNumber(order.orderNumber) };
    res.status(200).json({ success: true, data: formattedOrder });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cafeId = req.params.cafeId as string;
    
    // 1. Total Revenue (Completed orders)
    const revenue = await prisma.order.aggregate({
      where: { 
        cafeId,
        status: 'COMPLETED'
      },
      _sum: { totalAmount: true }
    });

    // 2. Orders Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await prisma.order.count({
      where: {
        cafeId,
        createdAt: { gte: today }
      }
    });

    // 3. Active Orders
    const activeOrders = await prisma.order.count({
      where: {
        cafeId,
        status: { in: ['PENDING', 'ACCEPTED', 'PREPARING', 'READY'] }
      }
    });

    // 4. Popular Items (Top 5)
    const popularItemsRaw = await prisma.orderItem.groupBy({
      by: ['itemName'],
      where: {
        order: { cafeId }
      },
      _count: { itemName: true },
      orderBy: { _count: { itemName: 'desc' } },
      take: 5
    });

    const popularItems = popularItemsRaw.map(item => ({
      name: item.itemName,
      count: item._count.itemName
    }));

    // 5. Recent Activity (Last 5 orders)
    const recentActivity = await prisma.order.findMany({
      where: { cafeId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { orderItems: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenue._sum.totalAmount || 0,
        ordersToday,
        activeOrders,
        popularItems,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesChartData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cafeId = req.params.cafeId as string;
    const days = 7;
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);

      const end = new Date();
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - i);

      const dailyRevenue = await prisma.order.aggregate({
        where: {
          cafeId,
          status: 'COMPLETED',
          createdAt: { gte: start, lte: end }
        },
        _sum: { totalAmount: true }
      });

      const dailyOrders = await prisma.order.count({
        where: {
          cafeId,
          createdAt: { gte: start, lte: end }
        }
      });

      chartData.push({
        name: start.toLocaleDateString([], { weekday: 'short' }),
        sales: dailyRevenue._sum.totalAmount || 0,
        orders: dailyOrders
      });
    }

    res.status(200).json({ success: true, data: chartData });
  } catch (error) {
    next(error);
  }
};
