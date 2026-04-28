import { Request, Response } from 'express';
import prisma from '../lib/prismaClient';

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { type, address, isDefault } = req.body;

    if (!type || !address) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if this is the user's first address
    const existingCount = await prisma.address.count({ where: { userId } });
    const shouldBeDefault = isDefault || existingCount === 0;

    // If this new one is default, unset any existing defaults
    if (shouldBeDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        type,
        address,
        isDefault: shouldBeDefault
      }
    });

    res.status(201).json({ success: true, data: newAddress });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const setDefaultAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const id = req.params.id as string;

    // Unset current default
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    // Set new default
    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const id = req.params.id as string;

    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });

    // If we deleted the default, make the most recent one default if any exist
    if (address.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true }
        });
      }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
