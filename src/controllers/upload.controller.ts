import { Request, Response, NextFunction } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import s3Client from '../lib/s3Client';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const file = req.file;
    const bucketName = process.env.S3_BUCKET_NAME || 'images'; // Update with your actual default bucket
    const fileExtension = file.originalname.split('.').pop() || 'jpg';
    const key = `menu/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Depends on your bucket policy, Supabase usually handles public via policies
    });

    await s3Client.send(command);

    // Construct the public URL format for Supabase S3
    const endpoint = process.env.S3_ENDPOINT || '';
    const publicUrl = `${endpoint.replace('/s3', '/object/public')}/${bucketName}/${key}`;

    res.status(200).json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    next(error);
  }
};
