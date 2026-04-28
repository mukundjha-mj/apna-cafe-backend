import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';

export const getWalletData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        walletBalance: true,
        referralCode: true,
      }
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: {
        balance: profile.walletBalance,
        referralCode: profile.referralCode,
        transactions
      }
    });
  } catch (error) {
    next(error);
  }
};
