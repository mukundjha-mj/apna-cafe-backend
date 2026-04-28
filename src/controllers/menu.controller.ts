import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';
import { redis } from '../lib/redis';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cafeId, all } = req.query;
    if (!cafeId) {
       res.status(400).json({ success: false, message: 'cafeId is required' });
       return;
    }

    const cacheKey = `menu:${cafeId}:${all === 'true' ? 'all' : 'available'}`;
    
    // 1. Try to get from Redis
    try {
      const cachedMenu = await redis.get(cacheKey);
      if (cachedMenu) {
        res.status(200).json({ success: true, data: JSON.parse(cachedMenu), source: 'cache' });
        return;
      }
    } catch (err) {
      console.warn('Redis read failed, falling back to DB');
    }

    const where: any = { cafeId: String(cafeId) };
    if (all !== 'true') {
      where.isAvailable = true;
    }

    const menuItems = await (prisma as any).menuItem.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    // 2. Save to Redis for future requests (Expires in 1 hour)
    try {
      await redis.set(cacheKey, JSON.stringify(menuItems), 'EX', 3600);
    } catch (err) {
      console.warn('Redis write failed');
    }

    res.status(200).json({ success: true, data: menuItems, source: 'database' });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cafeId, name, description, price, category, imageUrl, isVeg, sizes, isBestseller, isNew, isCombo, comboContents } = req.body;
    const newItem = await prisma.menuItem.create({
      data: {
        cafeId,
        name,
        description,
        price,
        category,
        imageUrl,
        isVeg,
        sizes,
        isBestseller,
        isNew,
        isCombo,
        comboContents,
      },
    });

    // Clear Cache
    await redis.del(`menu:${cafeId}:all`);
    await redis.del(`menu:${cafeId}:available`);

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const { cafeId, name, description, price, category, imageUrl, isVeg, sizes, isBestseller, isNew, isCombo, comboContents, isAvailable } = req.body;
    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
        isVeg,
        sizes,
        isBestseller,
        isNew,
        isCombo,
        comboContents,
        isAvailable,
      },
    });

    // Clear Cache
    if (cafeId) {
      await redis.del(`menu:${cafeId}:all`);
      await redis.del(`menu:${cafeId}:available`);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
