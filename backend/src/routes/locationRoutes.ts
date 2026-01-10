import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { normalizePlaceName } from '../services/ai/placeNormalization';

const router = Router();

// Location search endpoint for autocomplete
router.get('/search', async (req: any, res: any, next: any) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.json({ locations: [] });
    }

    const normalizedQuery = await normalizePlaceName(q);
    
    const locations = await prisma.location.findMany({
      where: {
        OR: [
          {
            name: {
              contains: normalizedQuery.normalized,
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 10,
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        type: true,
        lat: true,
        lng: true,
      },
    });

    return res.json({ locations });
  } catch (err: any) {
    console.error('Location search error:', err);
    return res.status(500).json({ 
      error: "Failed to search locations",
      details: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
});

export default router;
