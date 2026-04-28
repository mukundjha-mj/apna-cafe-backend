import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';

export const syncProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, name, phone, referredByCode } = req.body;

    if (!id) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }

    // Check if profile exists
    const existing = await prisma.profile.findUnique({ where: { id } });

    let referredById: string | null = null;
    if (!existing && referredByCode) {
      const referrer = await prisma.profile.findUnique({
        where: { referralCode: referredByCode }
      });
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        name: name || undefined,
        phone: phone || undefined,
      },
      create: {
        id,
        name: name || 'Guest User',
        phone: phone || '',
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredById: referredById
      },
    });

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};
