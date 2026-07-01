// Dev seed: a handful of sample responses so the /admin dashboard has data
// to render (averages, distributions, and Q7 write-ins). Plain ESM so it runs
// on Node directly with no extra tooling. Idempotent: clears the table first.
//
// Run with:  npx prisma db seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Values are 1..5 (array index + 1). Some rows intentionally skip ratings or
// contact fields to mirror real launch-day guests who fill only part of the form.
const samples = [
  {
    q1: 5, q2: 4, q3: 5, q4: 4, q5: 5, q6: 5,
    orderNote: "چیزبرگر دوبل با سیب‌زمینی سرخ‌کرده — عالی بود.",
    name: "سارا محمدی",
    phone: "09121234567",
  },
  {
    q1: 4, q2: 4, q3: 4, q4: 3, q5: 4, q6: 4,
    orderNote: "برگر مخصوص لنو، گوشت خیلی خوش‌طعم بود.",
    name: "امیر رضایی",
    phone: "09351112233",
  },
  {
    q1: 3, q2: 3, q3: 4, q4: 2, q5: 3, q6: 3,
    orderNote: "کمی برای آماده شدن سفارش معطل شدیم.",
    name: null,
    phone: null,
  },
  {
    q1: 5, q2: 5, q3: 5, q4: 5, q5: 5, q6: 5,
    orderNote: "بهترین برگری که تا حالا خوردم!",
    name: "نگار احمدی",
    phone: "09901234567",
  },
  {
    q1: 2, q2: 2, q3: 3, q4: 2, q5: 2, q6: 2,
    orderNote: "اندازه‌ی پرس می‌توانست بزرگ‌تر باشد.",
    name: "حسین کریمی",
    phone: null,
  },
  {
    q1: 4, q2: 3, q3: 5, q4: 4, q5: 4, q6: 5,
    orderNote: null,
    name: null,
    phone: null,
  },
  {
    q1: 5, q2: 4, q3: 4, q4: 5, q5: 5, q6: 5,
    orderNote: "فضای دنج و برخورد گرم کارکنان. حتماً دوباره می‌آیم.",
    name: "مریم موسوی",
    phone: "09121110000",
  },
  {
    q1: 1, q2: 2, q3: 2, q4: 1, q5: 2, q6: 1,
    orderNote: "سفارش من سرد سرو شد.",
    name: null,
    phone: "09122223344",
  },
  {
    q1: 4, q2: 5, q3: 4, q4: 4, q5: 3, q6: 4,
    orderNote: "سیب‌زمینی‌ها فوق‌العاده بودند.",
    name: "پارسا نوری",
    phone: null,
  },
];

async function main() {
  await prisma.response.deleteMany();
  for (const data of samples) {
    await prisma.response.create({
      data: { ...data, userAgent: "seed-script" },
    });
  }
  console.log(`Seeded ${samples.length} sample responses.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
