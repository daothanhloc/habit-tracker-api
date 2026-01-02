import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Create or find test user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  console.log(`✅ User created/found:`, user);

  // Create sample habits
  const habit1 = await prisma.habit.upsert({
    where: { userId_name: { userId: user.id, name: "Morning Exercise" } },
    update: {},
    create: {
      userId: user.id,
      name: "Morning Exercise",
      description: "30 min workout at the gym",
      frequency: "DAILY",
      category: "health",
      color: "#3B82F6",
    },
  });

  console.log(`✅ Habit 1 created/found:`, habit1);

  const habit2 = await prisma.habit.upsert({
    where: { userId_name: { userId: user.id, name: "Read" } },
    update: {},
    create: {
      userId: user.id,
      name: "Read",
      description: "30 pages or 1 hour",
      frequency: "DAILY",
      category: "learning",
      color: "#10B981",
    },
  });

  console.log(`✅ Habit 2 created/found:`, habit2);

  const habit3 = await prisma.habit.upsert({
    where: { userId_name: { userId: user.id, name: "Meditate" } },
    update: {},
    create: {
      userId: user.id,
      name: "Meditate",
      description: "10-15 min meditation",
      frequency: "DAILY",
      category: "wellness",
      color: "#8B5CF6",
    },
  });

  console.log(`✅ Habit 3 created/found:`, habit3);

  // Create sample goal
  const goal = await prisma.habitGoal.upsert({
    where: { habitId_goalType: { habitId: habit1.id, goalType: "WEEKLY" } },
    update: {},
    create: {
      habitId: habit1.id,
      userId: user.id,
      targetFrequency: 5,
      goalType: "WEEKLY",
    },
  });

  console.log(`✅ Goal created/found:`, goal);

  // Create sample tracking records
  const today = new Date();
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(18, 30, 0, 0);

    const tracking = await prisma.habitTracking.upsert({
      where: { habitId_completedAt: { habitId: habit1.id, completedAt: date } },
      update: {},
      create: {
        habitId: habit1.id,
        userId: user.id,
        completedAt: date,
        notes: `Great workout! Completed on ${date.toLocaleDateString()}`,
        streak: 3 - i,
      },
    });

    console.log(
      `✅ Tracking record created/found for ${date.toLocaleDateString()}:`,
      tracking.id
    );
  }

  console.log("\n✅ Database seeding completed successfully!");
  console.log(`\n📝 Test User Details:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}`);
  console.log(
    `\n💡 Use this user ID in the routes (or update the hardcoded cmjpxvspj0000wavckybybye3)`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
