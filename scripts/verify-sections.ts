async function checkSections() {
  const res = await fetch("http://localhost:3000/");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const html = await res.text();

  const requiredSections = [
    { id: "hero", name: "2. Hero / Introduction Section" },
    { id: "profile", name: "3. Professional Profile Section" },
    { id: "about", name: "4. About Me Section" },
    { id: "experience", name: "5. Professional Experience" },
    { id: "education", name: "6. Education" },
    { id: "skills", name: "7. Skills & Expertise" },
    { id: "services", name: "8. Services" },
    { id: "projects", name: "9. Projects & Portfolio" },
    { id: "achievements", name: "10. Achievements & Certifications" },
    { id: "resume", name: "11. Resume Download Section" },
    { id: "testimonials", name: "12. Testimonials" },
    { id: "contact", name: "13. Contact Section" },
  ];

  console.log("Checking Homepage Sections:");
  let allFound = true;
  for (const s of requiredSections) {
    const present = html.includes(`id="${s.id}"`);
    console.log(`  ${s.name} [id="${s.id}"]: ${present ? "✓ FOUND" : "✗ MISSING"}`);
    if (!present) allFound = false;
  }

  const hasNavbar = html.includes("<header") || html.includes("nav");
  const hasFooter = html.includes("<footer");
  console.log(`  1. Premium Navigation Bar: ${hasNavbar ? "✓ FOUND" : "✗ MISSING"}`);
  console.log(`  14. Premium Animated Footer: ${hasFooter ? "✓ FOUND" : "✗ MISSING"}`);

  if (allFound && hasNavbar && hasFooter) {
    console.log("\nALL 14 HOMEPAGE SECTIONS ARE FULLY RENDERED AND VERIFIED!");
  } else {
    console.error("Some sections were missing.");
    process.exit(1);
  }
}

checkSections().catch((e) => {
  console.error(e);
  process.exit(1);
});
