import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clean() {
  console.log("Cleaning fictional data...");

  // Remove fictional experiences
  const expDeleted = await prisma.experience.deleteMany({});
  console.log(`Deleted ${expDeleted.count} fictional experiences.`);

  // Remove fake/test messages
  const msgDeleted = await prisma.message.deleteMany({});
  console.log(`Deleted ${msgDeleted.count} test messages.`);

  // Ensure projects table is clean of any fake entries
  const projDeleted = await prisma.project.deleteMany({});
  console.log(`Deleted ${projDeleted.count} fictional projects.`);

  // Update profile to retain Kartik's authentic personal details while removing stock images & fake bios
  await prisma.profile.update({
    where: { id: "profile_default" },
    data: {
      avatarUrl: null,
      githubUrl: null,
      linkedinUrl: null,
      twitterUrl: null,
      aboutStory: null,
      bio: "Crafting high-impact interactive 3D web experiences, modern user interfaces, and scalable full-stack applications.",
      tagline: "Creative Developer | Full-Stack Software Engineer",
      footerText: "Designed & developed with precision, WebGL shaders & Next.js architecture.",
      websiteTitle: "Kartik Khajuria — Creative Developer & 3D Interactive Portfolio",
    },
  });

  const profile = await prisma.profile.findFirst();
  console.log("Cleaned Profile:", profile);
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

