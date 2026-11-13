const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration & synchronization...");

  // 1. Restore Projects if missing
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    console.log("Seeding 4 core projects...");
    await prisma.project.createMany({
      data: [
        {
          id: "proj-1",
          title: "AuraOS — Spatial 3D Web Operating Environment",
          slug: "aura-os-spatial-web",
          order: 1,
          displayNumber: "01",
          category: "3D & WebGL",
          shortDesc: "Browser-native spatial computing workstation with interactive WebGL shaders, window management, and real-time audio visualizers.",
          fullDesc: "AuraOS explores the intersection of spatial web user interfaces and browser-based 3D computing. Engineered with Three.js, WebGL GLSL shaders, and Next.js, it offers an immersive desktop experience directly inside modern browsers with zero external plugins.",
          objectives: "Deliver an ultra-fluid spatial desktop environment with custom GLSL shaders and reactive window tiling.",
          problem: "Traditional web interfaces are constrained by flat 2D viewport rectangles, limiting expressiveness.",
          solution: "Architected a custom scenegraph pipeline on top of Three.js rendering virtual interactive desktop monitors with realistic glass dispersion.",
          keyFeatures: JSON.stringify([
            "Dynamic GLSL volumetric raymarched background shaders",
            "Draggable, resizable 3D glassmorphic window system",
            "Web Audio API fast-Fourier-transform visualizer",
            "Multi-threaded Web Workers for physics calculations",
            "Full keyboard shortcut navigation and accessibility mode"
          ]),
          challenges: "Maintaining steady performance on mobile GPUs while calculating real-time post-processing and glass refractions.",
          techStack: "Three.js, WebGL, GLSL, TypeScript, Next.js, Tailwind CSS, Web Audio API",
          thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
          liveUrl: "https://github.com",
          githubUrl: "https://github.com",
          status: "Completed",
          featured: true,
          published: true,
        },
        {
          id: "proj-2",
          title: "PulseFlow — Enterprise Cloud Analytics & Telemetry Engine",
          slug: "pulseflow-cloud-analytics",
          order: 2,
          displayNumber: "02",
          category: "Full-Stack SaaS",
          shortDesc: "Real-time distributed telemetry dashboard processing over 50,000 events/second with sub-second visual rendering.",
          fullDesc: "PulseFlow is a high-throughput observability platform designed to monitor microservices and serverless infrastructure with real-time stream processing, anomaly detection, and interactive charts.",
          objectives: "Provide sub-second query latency across tens of millions of telemetry logs while maintaining a responsive UI.",
          problem: "Existing enterprise analytics tools suffer from slow page loads and poor data density in visual dashboards.",
          solution: "Implemented an ultra-optimized frontend architecture using virtualized canvas data rendering paired with a streaming WebSocket backend.",
          keyFeatures: JSON.stringify([
            "Live telemetry stream via WebSocket pipelines",
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
          id: "proj-3",
          title: "Nexus Collab — Multi-User Infinite Canvas & Design Hub",
          slug: "nexus-collab-canvas",
          order: 3,
          displayNumber: "03",
          category: "Web Applications",
          shortDesc: "Multiplayer infinite whiteboard with CRDT conflict resolution, live cursors, and AI-assisted design generation.",
          fullDesc: "Nexus Collab allows distributed engineering and design teams to ideate, diagram system architectures, and prototype user experiences on an unbounded zoomable canvas.",
          objectives: "Enable seamless multiplayer co-authoring with zero lock contention and immediate local optimistic updates.",
          problem: "Collaborative whiteboards frequently encounter state divergence when multiple concurrent users edit the same board.",
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
          id: "proj-4",
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
        }
      ]
    });
  }

  // 2. Seed Skills into Database
  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    console.log("Seeding skills into database...");
    await prisma.skill.createMany({
      data: [
        // Frontend Development
        { name: "Next.js 16 & React 19", category: "Frontend Development", level: "Expert", icon: "Layout", order: 1 },
        { name: "TypeScript & JavaScript", category: "Frontend Development", level: "Expert", icon: "Code2", order: 2 },
        { name: "Tailwind CSS & Motion", category: "Frontend Development", level: "Expert", icon: "Palette", order: 3 },
        { name: "HTML5 / Semantic Web", category: "Frontend Development", level: "Expert", icon: "Globe", order: 4 },

        // 3D & WebGL / UI/UX
        { name: "Three.js & WebGL", category: "UI/UX Design", level: "Expert", icon: "Box", order: 5 },
        { name: "GLSL Fragment Shaders", category: "UI/UX Design", level: "Advanced", icon: "Sparkles", order: 6 },
        { name: "Spatial Design Systems", category: "UI/UX Design", level: "Advanced", icon: "Cpu", order: 7 },
        { name: "Figma Prototyping", category: "UI/UX Design", level: "Advanced", icon: "Layout", order: 8 },

        // Backend Development
        { name: "Node.js & Express / Fastify", category: "Backend Development", level: "Advanced", icon: "Server", order: 9 },
        { name: "REST & GraphQL APIs", category: "Backend Development", level: "Advanced", icon: "Globe", order: 10 },
        { name: "Microservices Architecture", category: "Backend Development", level: "Advanced", icon: "Server", order: 11 },

        // Programming Languages
        { name: "Python", category: "Programming Languages", level: "Advanced", icon: "Terminal", order: 12 },
        { name: "C++ / Systems Basics", category: "Programming Languages", level: "Proficient", icon: "Code", order: 13 },
        { name: "SQL & Relational Logic", category: "Programming Languages", level: "Advanced", icon: "Database", order: 14 },

        // Database Management
        { name: "PostgreSQL", category: "Database Management", level: "Advanced", icon: "Database", order: 15 },
        { name: "Prisma ORM", category: "Database Management", level: "Expert", icon: "Database", order: 16 },
        { name: "SQLite & Embedded DBs", category: "Database Management", level: "Advanced", icon: "Database", order: 17 },
        { name: "Redis Caching", category: "Database Management", level: "Proficient", icon: "Database", order: 18 },

        // Tools & Technologies
        { name: "Docker & Containerization", category: "Tools & Technologies", level: "Proficient", icon: "Cloud", order: 19 },
        { name: "Git & Automated CI/CD", category: "Tools & Technologies", level: "Expert", icon: "Wrench", order: 20 },
        { name: "Linux & Shell Automation", category: "Tools & Technologies", level: "Advanced", icon: "Terminal", order: 21 },
      ]
    });
  }

  // 3. Seed Experience & Education
  const expCount = await prisma.experience.count();
  if (expCount === 0) {
    console.log("Seeding experience and education records...");
    await prisma.experience.createMany({
      data: [
        {
          type: "work",
          role: "Lead Creative Technologist & Full-Stack Architect",
          organization: "Independent Consultant / High-Performance Studios",
          location: "Remote / Hybrid",
          period: "2023 — Present",
          description: "Architecting immersive 3D WebGL user experiences, interactive web applications, and scalable cloud backends for visionary venture startups and global brands.",
          skills: "Three.js, WebGL, Next.js 16, React 19, TypeScript, GLSL, Tailwind CSS, Prisma",
          order: 1,
        },
        {
          type: "work",
          role: "Full-Stack Software Engineer",
          organization: "NextGen Digital Solutions",
          location: "India",
          period: "2022 — 2023",
          description: "Engineered performant full-stack web applications, dynamic real-time dashboard systems, and micro-frontend architectures with high uptime.",
          skills: "React, Node.js, TypeScript, PostgreSQL, REST APIs, Redis, Docker",
          order: 2,
        },
        {
          type: "education",
          role: "Bachelor of Technology — Computer Science & Engineering",
          organization: "GLA University / Technical University",
          location: "Mathura, Uttar Pradesh, India",
          period: "2020 — 2024",
          description: "Specialized in Computer Science, Software Architecture, High-Performance Graphics, Operating Systems, and Distributed Computing Systems.",
          skills: "Computer Graphics, Algorithms, System Design, Database Management, Data Structures",
          order: 3,
        }
      ]
    });
  }

  // 4. Seed Services
  const servCount = await prisma.service.count();
  if (servCount === 0) {
    console.log("Seeding services...");
    await prisma.service.createMany({
      data: [
        {
          title: "3D Interactive Web Development",
          description: "Immersive WebGL and Three.js web applications, spatial product presentations, and bespoke interactive digital experiences.",
          icon: "Box",
          features: JSON.stringify(["Custom Three.js WebGL scenes", "GLSL custom shaders", "Mobile GPU optimization", "Interactive camera controls"]),
          order: 1,
        },
        {
          title: "Full-Stack Next.js Architecture",
          description: "Scalable enterprise web applications built with Next.js 16, React 19, TypeScript, and modern relational or document databases.",
          icon: "Layout",
          features: JSON.stringify(["Server-side rendering (SSR)", "Type-safe Prisma ORM", "Microservices integration", "Sub-second page speeds"]),
          order: 2,
        },
        {
          title: "UI/UX Design Systems & Engineering",
          description: "Atomic design systems, custom component libraries, fluid responsive typography, and tactile micro-interactions.",
          icon: "Palette",
          features: JSON.stringify(["Design token systems", "Framer Motion & Lenis animations", "WCAG accessibility", "Cross-browser testing"]),
          order: 3,
        }
      ]
    });
  }

  // 5. Seed Certifications
  const certCount = await prisma.certification.count();
  if (certCount === 0) {
    console.log("Seeding certifications...");
    await prisma.certification.createMany({
      data: [
        {
          title: "Full-Stack Web Architecture Certification",
          issuer: "Meta / Coursera Professional",
          issueDate: "2024",
          credentialUrl: "https://coursera.org",
          skills: "React, Node.js, System Architecture, Databases",
          order: 1,
        },
        {
          title: "Creative WebGL & Three.js Specialization",
          issuer: "Three.js Journey / Bruno Simon",
          issueDate: "2023",
          credentialUrl: "https://threejs-journey.com",
          skills: "Three.js, WebGL, Shaders, Physics, Post-Processing",
          order: 2,
        },
        {
          title: "Cloud Infrastructure & DevOps Associate",
          issuer: "AWS / Google Cloud Certified",
          issueDate: "2023",
          credentialUrl: "https://aws.amazon.com",
          skills: "Docker, CI/CD, Containerization, Serverless",
          order: 3,
        }
      ]
    });
  }

  // 6. Seed Testimonials
  const testCount = await prisma.testimonial.count();
  if (testCount === 0) {
    console.log("Seeding testimonials...");
    await prisma.testimonial.createMany({
      data: [
        {
          author: "Alex Morgan",
          role: "VP of Product",
          company: "VentureCraft Studio",
          quote: "Kartik transformed our digital presence with a bespoke 3D WebGL web platform that exceeded every expectation. His attention to detail and engineering quality are exceptional.",
          rating: 5,
          featured: true,
          order: 1,
        },
        {
          author: "Elena Rostova",
          role: "Co-Founder & CTO",
          company: "HyperScale Cloud",
          quote: "Working with Kartik was seamless. He architected our full-stack dashboard with Next.js and delivered an intuitive, blazing-fast experience. A true professional.",
          rating: 5,
          featured: true,
          order: 2,
        }
      ]
    });
  }

  console.log("Data migration completed successfully!");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
