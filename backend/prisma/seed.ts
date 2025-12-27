import { PrismaClient, UserRole, LocationType, VehicleType, RouteStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed an admin user for the admin panel login
  const adminPhone = "9999999999"; // Dev-only admin phone

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      name: "Town Admin",
      phone: adminPhone,
      role: UserRole.ADMIN,
    },
  });

  // Seed a few common locations for a small Indian town
  const railwayStation = await prisma.location.upsert({
    where: { name: "Railway Station" },
    update: {},
    create: {
      name: "Railway Station",
      type: LocationType.LANDMARK,
      lat: 19.8762,
      lng: 75.3433,
    },
  });

  const mainBusStand = await prisma.location.upsert({
    where: { name: "Main Bus Stand" },
    update: {},
    create: {
      name: "Main Bus Stand",
      type: LocationType.BUS_STOP,
      lat: 19.8772,
      lng: 75.3393,
    },
  });

  const college = await prisma.location.upsert({
    where: { name: "Government College" },
    update: {},
    create: {
      name: "Government College",
      type: LocationType.LANDMARK,
      lat: 19.8901,
      lng: 75.3451,
    },
  });

  const market = await prisma.location.upsert({
    where: { name: "Old Market" },
    update: {},
    create: {
      name: "Old Market",
      type: LocationType.AREA,
      lat: 19.8815,
      lng: 75.338,
    },
  });

  // Seed an approved shared auto route from Railway Station to Government College
  const route1 = await prisma.route.create({
    data: {
      fromLocationId: railwayStation.id,
      toLocationId: college.id,
      vehicleType: VehicleType.SHARED_AUTO,
      autoColor: "Green",
      status: RouteStatus.APPROVED,
      via: [
        { name: "Main Bus Stand", lat: mainBusStand.lat, lng: mainBusStand.lng },
        { name: "Old Market", lat: market.lat, lng: market.lng },
      ],
      fares: {
        create: {
          minFare: 15,
          maxFare: 20,
          notes: "Morning and evening peak hours can be crowded.",
        },
      },
      submissions: {
        create: {
          status: "APPROVED",
          userId: admin.id,
        },
      },
    },
  });

  // Seed an approved bus route from Main Bus Stand to Government College
  await prisma.route.create({
    data: {
      fromLocationId: mainBusStand.id,
      toLocationId: college.id,
      vehicleType: VehicleType.BUS,
      status: RouteStatus.APPROVED,
      via: [
        { name: "Old Market", lat: market.lat, lng: market.lng },
      ],
      fares: {
        create: {
          minFare: 10,
          maxFare: 15,
          notes: "Last bus around 9:30 PM.",
        },
      },
      submissions: {
        create: {
          status: "APPROVED",
          userId: admin.id,
        },
      },
    },
  });

  console.log("Seed data created. Example route id:", route1.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
