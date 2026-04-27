import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cafeId } = req.query;
    if (!cafeId) {
       res.status(400).json({ success: false, message: 'cafeId is required' });
       return;
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { cafeId: String(cafeId), isAvailable: true },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({ success: true, data: menuItems });
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

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    next(error);
  }
};
