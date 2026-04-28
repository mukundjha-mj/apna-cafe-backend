import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prismaClient';

export const getWalletData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId as string;
    
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletBalance: true,
        referralCode: true,
      }
    });

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    // Auto-generate referral code for existing users if missing
    if (!profile.referralCode) {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      profile = await prisma.profile.update({
        where: { id: userId },
        data: { referralCode: newCode },
        select: {
          id: true,
          walletBalance: true,
          referralCode: true,
        }
      });
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
