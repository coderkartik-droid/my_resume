import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding premium portfolio content...");

  // 1. Theme Configuration
  const existingTheme = await prisma.themeConfig.findFirst();
  if (!existingTheme) {
    await prisma.themeConfig.create({
      data: {
        id: "active_theme_config",
        activeThemeId: "midnight-dark",
        draftThemeId: null,
        previousThemeId: null,
        customOverrides: null,
        animationSettings: JSON.stringify({
          enabled: true,
          intensity: "normal",
          pageTransitions: "fade",
          scrollAnimations: "reveal",
          hoverEffects: "3d-tilt",
          backgroundStyle: "interactive-canvas",
          speed: 1.0,
          delay: 0.1,
          parallaxIntensity: 0.5,
          cursorEffects: true,
          particleEffects: true,
          threeDEffects: true,
          sectionOverrides: {},
        }),
      },
    });
    console.log("✓ ThemeConfig created");
  }

  // 2. Projects
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "AuraOS — Spatial 3D Web Operating Environment",
          slug: "aura-os-spatial-web",
          order: 1,
          displayNumber: "01",
          category: "3D & WebGL",
          shortDesc: "Browser-native spatial computing workstation with interactive WebGL shaders, window management, and real-time GPU audio visualizers.",
          fullDesc: "AuraOS explores the intersection of spatial web user interfaces and browser-based 3D computing. Engineered with Three.js, WebGL GLSL shaders, and Next.js, it offers an immersive desktop experience directly inside standard modern browsers with zero external plugins.",
          objectives: "Deliver an ultra-fluid 60FPS spatial desktop environment with custom GLSL shaders, reactive window tiling, and low-latency audio visualization.",
          problem: "Traditional web interfaces are constrained by flat 2D viewport rectangles, limiting expressiveness and tactile immersion for advanced creative tools.",
          solution: "Architected a custom scenegraph pipeline on top of Three.js that renders virtual interactive desktop monitors with realistic glass dispersion and perspective tilt.",
          keyFeatures: JSON.stringify([
            "Dynamic GLSL volumetric raymarched background shaders",
            "Draggable, resizable 3D glassmorphic window system",
            "Web Audio API fast-Fourier-transform realtime visualizer",
            "Multi-threaded Web Workers for physics calculations",
            "Full keyboard shortcut navigation and accessibility mode"
          ]),
          challenges: "Maintaining steady 60FPS on low-end mobile GPUs while calculating real-time post-processing bloom and glass refractions.",
          techStack: "Three.js, WebGL, GLSL, TypeScript, Next.js, Tailwind CSS, Web Audio API",
          thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
          liveUrl: "https://github.com",
          githubUrl: "https://github.com",
          status: "Completed",
          featured: true,
          published: true,
        },
        {
          title: "PulseFlow — Enterprise Cloud Analytics & Telemetry Engine",
          slug: "pulseflow-cloud-analytics",
          order: 2,
          displayNumber: "02",
          category: "Full-Stack SaaS",
          shortDesc: "Real-time distributed telemetry dashboard processing over 50,000 events/second with sub-second OLAP visual rendering.",
          fullDesc: "PulseFlow is a high-throughput observability platform designed to monitor microservices and serverless infrastructure with real-time stream processing, anomaly detection, and interactive visual charts.",
          objectives: "Provide sub-second query latency across tens of millions of telemetry logs while maintaining a responsive, zero-jank UI.",
          problem: "Existing enterprise analytics tools suffer from slow page loads, clunky navigation, and poor data density in visual dashboards.",
          solution: "Implemented an ultra-optimized frontend architecture using virtualized canvas data rendering paired with a streaming WebSocket backend.",
          keyFeatures: JSON.stringify([
            "Zero-latency live telemetry stream via WebSocket pipelines",
            "Interactive timeline scrubber with millisecond precision",
            "Automated anomaly detection alerts and Slack webhooks",
            "Granular role-based team access controls (RBAC)",
            "Automated CSV/JSON export and synthetic trace generation"
          ]),
          challenges: "Handling rapid bursts of incoming socket packets without choking the React component reconciliation cycle.",
          techStack: "React 19, TypeScript, Node.js, ClickHouse, Redis, Tailwind CSS, Turbopack",
          thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
          liveUrl: "https://github.com",
          githubUrl: "https://github.com",
          status: "Completed",
          featured: true,
          published: true,
        },
        {
          title: "Nexus Collab — Multi-User Infinite Canvas & Design Hub",
          slug: "nexus-collab-canvas",
          order: 3,
          displayNumber: "03",
          category: "Web Applications",
          shortDesc: "Multiplayer infinite whiteboard with CRDT conflict resolution, live cursors, and AI-assisted design generation.",
          fullDesc: "Nexus Collab allows distributed engineering and design teams to ideate, diagram system architectures, and prototype user experiences on an unbounded 2D/3D zoomable canvas.",
          objectives: "Enable seamless multiplayer co-authoring with zero lock contention and immediate local optimistic updates.",
          problem: "Collaborative whiteboards frequently encounter state divergence and lag when more than 20 concurrent users edit the same board.",
          solution: "Integrated state-of-the-art Conflict-free Replicated Data Types (CRDTs) over WebRTC mesh networking for peer-to-peer latency under 15ms.",
          keyFeatures: JSON.stringify([
            "CRDT-powered zero-conflict synchronized infinite canvas",
            "Real-time cursor broadcasting with user presence avatars",
            "Smart vector path smoothing and shape snapping",
            "Embedded Markdown notes, code snippets, and wireframes",
            "AI Copilot for auto-generating architecture sequence diagrams"
          ]),
          challenges: "Ensuring stable vector bezier path interpolation during erratic network packet loss.",
          techStack: "TypeScript, Canvas API, WebSockets, WebRTC, Yjs, Framer Motion, Next.js",
          thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
          liveUrl: "https://github.com",
          githubUrl: "https://github.com",
          status: "Completed",
          featured: true,
          published: true,
        },
        {
          title: "Synapse AI — Contextual Neural Knowledge Copilot",
          slug: "synapse-ai-copilot",
          order: 4,
          displayNumber: "04",
          category: "AI & Machine Learning",
          shortDesc: "Intelligent document retrieval and semantic search engine powered by vector embeddings and local LLM orchestration.",
          fullDesc: "Synapse AI is a private enterprise knowledge retrieval platform that indexes internal documentation, GitHub repositories, and Notion spaces to answer technical questions with verified source citations.",
          objectives: "Create a private, citation-grounded RAG agent that eliminates hallucinations while executing in under 800ms.",
          problem: "Teams waste hours searching through disparate wikis and repositories to find engineering documentation.",
          solution: "Constructed a high-accuracy vector indexing pipeline utilizing hybrid dense-sparse semantic retrieval and streaming token delivery.",
          keyFeatures: JSON.stringify([
            "Hybrid BM25 and vector semantic search retrieval",
            "Streaming token rendering with markdown syntax highlighting",
            "Direct inline source citations with clickable document previews",
            "Local embedding model support for complete data sovereignty",
            "Extensible plugin architecture for Jira, GitHub, and Slack"
          ]),
          challenges: "Optimizing chunking strategies for multi-language code files containing complex AST hierarchies.",
          techStack: "Python, FastAPI, Next.js, LangChain, Pinecone, Tailwind CSS, Docker",
          thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
          liveUrl: "https://github.com",
          githubUrl: "https://github.com",
          status: "Completed",
          featured: true,
          published: true,
        },
      ],
    });
    console.log("✓ Projects seeded (4 showcase projects)");
  }

  // 3. Experience (Work, Education, Achievements)
  const expCount = await prisma.experience.count();
  if (expCount === 0) {
    await prisma.experience.createMany({
      data: [
        // Work
        {
          type: "work",
          role: "Senior Full-Stack & Creative Developer",
          organization: "Independent Software Consultant",
          location: "India / Remote",
          period: "2024 - Present",
          description: "Architecting high-performance web applications, interactive 3D WebGL experiences, and scalable cloud solutions for international clients and high-growth startups.",
          skills: "Next.js, Three.js, TypeScript, Tailwind CSS, Prisma, Node.js, WebGL",
          order: 1,
        },
        {
          type: "work",
          role: "Frontend Engineer & UI/UX Specialist",
          organization: "Digital Product Studio",
          location: "Hybrid",
          period: "2023 - 2024",
          description: "Led frontend development for multi-tenant SaaS dashboards, engineered design systems with strict accessibility compliance, and built interactive data visualization tools.",
          skills: "React, TypeScript, Framer Motion, GraphQL, WebSockets, Figma",
          order: 2,
        },
        {
          type: "work",
          role: "Software Developer Intern",
          organization: "Tech Innovations Lab",
          location: "India",
          period: "2022 - 2023",
          description: "Engineered responsive full-stack modules, optimized database query performance with PostgreSQL indexing, and implemented automated end-to-end testing pipelines.",
          skills: "JavaScript, Node.js, Express, PostgreSQL, REST APIs, Git",
          order: 3,
        },

        // Education
        {
          type: "education",
          role: "Bachelor of Technology in Computer Science & Engineering",
          organization: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
          location: "Uttar Pradesh, India",
          period: "2020 - 2024",
          description: "Graduated with honors. Focused on Computer Graphics, Distributed Systems, Data Structures & Algorithms, and Cloud Computing Architecture.",
          skills: "Computer Graphics, Operating Systems, Algorithms, Database Systems",
          order: 1,
        },
        {
          type: "education",
          role: "Senior Secondary (Physics, Chemistry, Mathematics & CS)",
          organization: "Central Board of Secondary Education (CBSE)",
          location: "Mathura, India",
          period: "2018 - 2020",
          description: "Completed higher secondary education with distinction in Computer Science and Mathematics, laying the algorithmic foundation for graphics programming.",
          skills: "Mathematics, Computer Science, C++, Physics",
          order: 2,
        },

        // Achievements
        {
          type: "achievement",
          role: "1st Place Winner — National Web3 & Creative Tech Hackathon",
          organization: "National Innovation Summit",
          location: "New Delhi",
          period: "2024",
          description: "Designed and built an interactive 3D decentralized storage visualizer within 36 hours, awarded 1st place out of 120+ participating engineering teams.",
          skills: "Three.js, WebGL, Innovation, Rapid Prototyping",
          order: 1,
        },
        {
          type: "achievement",
          role: "Open Source Contributor & Graphics Advocate",
          organization: "Web Development Community",
          location: "Global",
          period: "2023 - Present",
          description: "Authored reusable UI primitives and WebGL shader snippets downloaded over 15,000+ times by developers worldwide.",
          skills: "Open Source, GLSL, Shaders, Community Mentorship",
          order: 2,
        },
      ],
    });
    console.log("✓ Experiences & Education seeded");
  }

  // 4. Testimonials
  const testCount = await prisma.testimonial.count();
  if (testCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          author: "Marcus Vance",
          role: "VP of Product",
          company: "Aetheric Labs (San Francisco)",
          quote: "Kartik transformed our product vision into an extraordinarily fluid, interactive web experience. His mastery over both WebGL graphics and rock-solid full-stack architecture is truly rare in the industry.",
          rating: 5,
          featured: true,
          order: 1,
        },
        {
          author: "Elena Rostova",
          role: "Lead Creative Director",
          company: "Studio Continuum (Berlin)",
          quote: "Working with Kartik felt like working with a seasoned design engineer at Apple. Every motion detail, micro-interaction, and shader animation was tuned to absolute perfection.",
          rating: 5,
          featured: true,
          order: 2,
        },
        {
          author: "Dr. Arvind Sharma",
          role: "Chief Technology Officer",
          company: "Apex Telemetry Cloud",
          quote: "Not only is Kartik's UI craft world-class, but his code architecture is clean, type-safe, and deeply maintainable. He delivered our enterprise dashboard ahead of schedule with zero compromises.",
          rating: 5,
          featured: true,
          order: 3,
        },
        {
          author: "Sarah Jenkins",
          role: "Co-Founder & CEO",
          company: "Kinetix Digital Media",
          quote: "The 3D portfolio and interactive platforms Kartik builds stop people in their tracks. Our conversion rate jumped over 40% after rolling out his redesign.",
          rating: 5,
          featured: true,
          order: 4,
        },
      ],
    });
    console.log("✓ Testimonials seeded (4 client endorsements)");
  }

  // 5. Certifications
  const certCount = await prisma.certification.count();
  if (certCount === 0) {
    await prisma.certification.createMany({
      data: [
        {
          title: "Meta Certified Frontend Developer Professional",
          issuer: "Meta (Facebook)",
          issueDate: "2024",
          credentialUrl: "https://coursera.org",
          skills: "React, Advanced JavaScript, Web Performance, UI/UX Architecture",
          order: 1,
        },
        {
          title: "Three.js Journey & Advanced WebGL Shader Masterclass",
          issuer: "Bruno Simon / Three.js Guild",
          issueDate: "2024",
          credentialUrl: "https://threejs-journey.com",
          skills: "Three.js, GLSL, Shaders, Raymarching, Post-Processing, Physics",
          order: 2,
        },
        {
          title: "AWS Certified Solutions Architect — Associate",
          issuer: "Amazon Web Services",
          issueDate: "2023",
          credentialUrl: "https://aws.amazon.com",
          skills: "Cloud Architecture, Serverless, DynamoDB, CloudFront, Scalability",
          order: 3,
        },
        {
          title: "Full-Stack Web Development & Microservices Architecture",
          issuer: "freeCodeCamp / Certified Program",
          issueDate: "2023",
          credentialUrl: "https://freecodecamp.org",
          skills: "Node.js, Express, PostgreSQL, Docker, Security, API Design",
          order: 4,
        },
      ],
    });
    console.log("✓ Certifications seeded (4 recognized credentials)");
  }

  console.log("Database successfully seeded with world-class portfolio content!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
