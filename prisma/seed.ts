import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function dateOnly(daysAgo: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: "seed-only-not-a-real-hash",
    },
  });

  console.log(`✅ User created/found:`, user.email);

  const today = dateOnly(0);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Get Fit",
      startDate: monthStart,
      endDate: monthEnd,
    },
  });

  console.log(`✅ Goal created:`, goal.title);

  // SUM habit: "Run 100km this month"
  const runHabit = await prisma.habit.create({
    data: {
      goalId: goal.id,
      userId: user.id,
      name: "Run",
      unit: "km",
      goalType: "SUM",
      targetValue: 100,
      frequencyDays: [1, 3, 5], // Mon/Wed/Fri
      defaultTaskValue: 5,
    },
  });

  // THRESHOLD_COUNT habit: "Sleep 8h, 30 days"
  const sleepHabit = await prisma.habit.create({
    data: {
      goalId: goal.id,
      userId: user.id,
      name: "Sleep",
      unit: "hours",
      goalType: "THRESHOLD_COUNT",
      dailyMinValue: 8,
      targetDays: 30,
      frequencyDays: [0, 1, 2, 3, 4, 5, 6], // every day
      defaultTaskValue: 8,
    },
  });

  console.log(`✅ Habits created:`, runHabit.name, sleepHabit.name);

  // A few days of sample tasks for the Run habit (completed, done)
  for (let i = 0; i < 3; i++) {
    const date = dateOnly(i);
    await prisma.task.upsert({
      where: { habitId_date: { habitId: runHabit.id, date } },
      update: {},
      create: {
        habitId: runHabit.id,
        date,
        value: 5,
        status: "DONE",
        completedAt: new Date(),
      },
    });
  }
  await prisma.habit.update({
    where: { id: runHabit.id },
    data: { currentStreak: 3, longestStreak: 3 },
  });

  console.log("\n✅ Database seeding completed successfully!");
  console.log(`\n📝 Test User Details:`);
  console.log(`   Email: ${user.email}`);
  console.log(`   ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
