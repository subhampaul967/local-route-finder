import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { normalizePlaceName } from '../services/ai/placeNormalization';

const router = Router();

// GET all locations with city information
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const locations = await prisma.location.findMany({
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

    // Add city information to locations (based on known city mappings)
    const locationsWithCity = locations.map(location => ({
      ...location,
      city: getCityFromLocation(location.name)
    }));

    return res.json({ locations: locationsWithCity });
  } catch (err: any) {
    console.error('Get locations error:', err);
    return res.status(500).json({ 
      error: "Failed to fetch locations",
      details: process.env.NODE_ENV === 'development' ? err.message : "Internal server error"
    });
  }
});

// Helper function to determine city from location name
function getCityFromLocation(locationName: string): string {
  const name = locationName.toLowerCase();
  
  // Durgapur locations
  if (name.includes('bengal college') || name.includes('prantika') || 
      name.includes('railway station') || name.includes('durgapur') ||
      name.includes('bidhannagar') || name.includes('benachity') ||
      name.includes('city centre') || name.includes('fuljhore')) {
    return 'Durgapur';
  }
  
  // Pune locations
  if (name.includes('pune') || name.includes('shivaji') || 
      name.includes('koregaon') || name.includes('camp') ||
      name.includes('swargate') || name.includes('katraj')) {
    return 'Pune';
  }
  
  // Kolkata locations
  if (name.includes('kolkata') || name.includes('howrah') || 
      name.includes('salt lake') || name.includes('park street') ||
      name.includes('newtown') || name.includes('garia')) {
    return 'Kolkata';
  }
  
  // Default to unknown
  return 'Unknown';
}

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
