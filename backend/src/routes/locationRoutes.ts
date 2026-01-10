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

// Create new location endpoint
router.post('/', async (req: any, res: any, next: any) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Location name is required" });
    }

    if (!type) {
      return res.status(400).json({ error: "Location type is required" });
    }

    // Normalize the location name
    const normalized = await normalizePlaceName(name.trim());
    
    // Check if location already exists
    const existingLocation = await prisma.location.findFirst({
      where: {
        OR: [
          { name: normalized.normalized },
          { name: { contains: name.trim(), mode: 'insensitive' } }
        ]
      }
    });

    if (existingLocation) {
      return res.status(409).json({ 
        error: "Location already exists",
        existingLocation: {
          id: existingLocation.id,
          name: existingLocation.name,
          type: existingLocation.type
        }
      });
    }

    // Create new location
    const newLocation = await prisma.location.create({
      data: {
        name: normalized.normalized,
        type: type as any,
      },
    });

    console.log('✅ New location created:', newLocation.name);
    
    return res.status(201).json({
      id: newLocation.id,
      name: newLocation.name,
      type: newLocation.type,
      message: "Location created successfully"
    });
  } catch (err: any) {
    console.error('Create location error:', err);
    return res.status(500).json({ 
      error: "Failed to create location",
      details: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
});

export default router;
