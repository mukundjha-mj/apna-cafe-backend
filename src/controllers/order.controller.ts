import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';
import { getIO } from '../lib/socket';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      userId, 
      cafeId, 
      type, 
      tableNumber, 
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

    const order = await prisma.order.create({
      data: {
        userId,
        cafeId,
        type,
        tableNumber,
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
      },
    });

    // Emit socket event to cafe dashboard
    const io = getIO();
    io.to(`cafe-${cafeId}`).emit('new-order', order);

    res.status(201).json({ success: true, data: order });
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
      },
    });

    // Emit socket event to user tracking the order
    const io = getIO();
    io.to(`order-${id}`).emit('order-update', updatedOrder);

    res.status(200).json({ success: true, data: updatedOrder });
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json({ success: true, data: orders });
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
    
    res.status(200).json({ success: true, data: orders });
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
        cafe: true
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
