import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';

export const getCafeDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    console.log('Fetching details for cafe:', id);
    const cafe = await prisma.cafe.findUnique({
      where: { id },
    });

    if (!cafe) {
       res.status(404).json({ success: false, message: 'Cafe not found' });
       return;
    }

    res.status(200).json({ success: true, data: cafe });
  } catch (error) {
    next(error);
  }
};

export const getAllCafes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cafes = await prisma.cafe.findMany();
    res.status(200).json({ success: true, data: cafes });
  } catch (error) {
    next(error);
  }
};

export const createCafe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, address, latitude, longitude, phone } = req.body;
    const newCafe = await prisma.cafe.create({
      data: {
        name,
        address,
        latitude,
        longitude,
        phone,
      },
    });

    res.status(201).json({ success: true, data: newCafe });
  } catch (error) {
    next(error);
  }
};

export const updateCafe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { isOpen } = req.body;
    console.log(`[DEBUG] Attempting to update cafe ${id}. New isOpen: ${isOpen}`);
    
    // Use updateMany to see how many records actually changed
    const updateResult = await prisma.cafe.updateMany({
      where: { id },
      data: {
        isOpen: isOpen === true || isOpen === 'true'
      },
    });

    console.log(`[DEBUG] Update result:`, updateResult);

    if (updateResult.count === 0) {
      console.warn(`[DEBUG] No cafe found with ID: ${id}`);
      res.status(404).json({ success: false, message: 'Cafe not found in database' });
      return;
    }

    const updatedCafe = await prisma.cafe.findUnique({ where: { id } });
    res.status(200).json({ success: true, data: updatedCafe });
  } catch (error) {
    console.error(`[DEBUG] Error in updateCafe:`, error);
    next(error);
  }
};
