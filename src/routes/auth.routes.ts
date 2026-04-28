import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/role/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Check if user is a Cafe Admin
    const cafe = await prisma.cafe.findUnique({
      where: { id: userId }
    });
    
    if (cafe) {
      return res.json({ role: 'ADMIN' });
    }
    
    // Check if user is a Customer (Profile exists)
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    });
    
    if (profile) {
      return res.json({ role: 'CUSTOMER' });
    }
    
    res.json({ role: 'UNKNOWN' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to determine user role' });
  }
});

router.post('/admin/verify', async (req, res) => {
  const { userId } = req.body;
  
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { id: userId }
    });
    
    if (cafe) {
      return res.json({ success: true, role: 'ADMIN' });
    }
    
    res.status(403).json({ success: false, error: 'Access denied. Only owner can login here.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
});

export default router;
