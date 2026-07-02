import { Profile, Post, Job, Connection, Conversation, Notification } from "./types";

export const initialProfile: Profile = {
  name: "Somnath Das",
  headline: "Frontend Architect & Full Stack Engineer | React & TypeScript Expert",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
  banner: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&h=250&q=80",
  location: "San Francisco Bay Area, CA",
  connectionsCount: 1420,
  about: "Passionate Frontend Developer and software engineer with over 5 years of experience building scalable, robust web applications. Specialize in modern frameworks (React, Next.js), TypeScript, state management systems, and high-performance Tailwind CSS styling. Enthusiastic about creating highly polished UI designs, responsive layouts, and integrating smart AI models into everyday developer workflows.",
  experience: [
    {
      id: "exp_1",
      company: "TechNexus Solutions",
      role: "Senior React Engineer",
      duration: "Jan 2024 - Present",
      description: "Architect and deliver core enterprise frontend applications with a focus on web performance, advanced design systems, and responsive layouts. Collaborate closely with product leads and AI researchers to ship interactive dashboards and predictive workflows. Optimized bundle sizes by 35% through code-splitting and memoization strategies."
    },
    {
      id: "exp_2",
      company: "InnovateLabs",
      role: "Full Stack Developer",
      duration: "Jun 2021 - Dec 2023",
      description: "Designed, engineered, and maintained key developer tools and microservices using React, Node.js, and Express. Created secure backend OAuth integration flows and engineered server-side REST APIs. Built clean, animated interactions which improved user retention by 20%."
    }
  ],
  education: [
    {
      id: "edu_1",
      school: "Stanford University",
      degree: "Master of Science in Computer Science",
      duration: "2019 - 2021"
    },
    {
      id: "edu_2",
      school: "Indian Institute of Technology (IIT)",
      degree: "Bachelor of Technology in Computer Science",
      duration: "2015 - 2019"
    }
  ],
  skills: [
    "TypeScript",
    "React.js",
    "Tailwind CSS",
    "Node.js",
    "Express.js",
    "State Management",
    "RESTful APIs",
    "internAi SDK",
    "Next.js",
    "System Architecture",
    "UI/UX Design"
  ]
};

export const initialPosts: Post[] = [
  {
    id: "post_3",
    authorName: "Diana Prince",
    authorHeadline: "AI Research Lead at Anthropic",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    content: "We just rolled out our developer workspace updates. Over the last month, we tested integrating automated model feedback for profile writing, post draft generation, and resume review inside our workflow tools.\n\nThe results? Users saved 40% of their drafting time while achieving higher structural alignment with recruiter standards. Full-stack LLM integration is no longer a luxury—it is the modern baseline. 🤖✨",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&h=450&q=80",
    likes: ["Sarah Connor", "Somnath Das"],
    comments: [],
    sharesCount: 22,
    timestamp: "2d ago",
    tags: ["ArtificialIntelligence", "ViteFullStack", "SoftwareDesign"]
  }
];

export const initialJobs: Job[] = [
  {
    id: "job_1",
    title: "Senior React Developer",
    company: "Google",
    logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=80&h=80&q=80",
    location: "Mountain View, CA",
    workplaceType: "Hybrid",
    jobType: "Full-time",
    salary: "$160,000 - $210,000",
    description: "Google is looking for a Senior React Developer to join the core Workspace developer workspace team. You will lead the development of highly interactive interfaces, optimize web performance metrics, and build reusable UI design kits.",
    requirements: [
      "5+ years of experience with React, TypeScript, and state management systems.",
      "Proven track record of optimizing high-traffic React single-page applications.",
      "Strong understanding of responsive layouts and Tailwind CSS.",
      "Familiarity with server-side proxy architectures and API caching."
    ],
    applied: false,
    postedAt: "1d ago"
  },
  {
    id: "job_2",
    title: "Frontend & AI Integration Engineer",
    company: "Stripe",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=80&h=80&q=80",
    location: "San Francisco, CA (Remote Friendly)",
    workplaceType: "Remote",
    jobType: "Full-time",
    salary: "$140,000 - $185,000",
    description: "Stripe's developer experience team is looking for an engineer to integrate large language model agents and responsive workflows into our billing dashboard ecosystem. Help build the future of AI-driven payment operations.",
    requirements: [
      "Strong coding foundation in Node.js, Express, React, and TypeScript.",
      "Experience calling LLM endpoints like internAi API server-side.",
      "A passion for developer tools, clean API design, and gorgeous UI styling."
    ],
    applied: false,
    postedAt: "3d ago"
  },
  {
    id: "job_3",
    title: "Product Designer & UI Engineer",
    company: "Airbnb",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=80&h=80&q=80",
    location: "San Francisco, CA",
    workplaceType: "On-site",
    jobType: "Full-time",
    salary: "$130,000 - $175,000",
    description: "Airbnb is looking for a designer-engineer who bridges the gap between design vision and responsive, accessible frontend layouts. Deliver pristine pixel experiences while building reusable design library modules.",
    requirements: [
      "Exceptional eye for typography, negative space, and layout design.",
      "Expert knowledge of Tailwind CSS, CSS animations, and browser graphics.",
      "Fluency in React and modern UI component patterns."
    ],
    applied: false,
    postedAt: "4d ago"
  }
];

export const initialConnections: Connection[] = [
  {
    id: "conn_1",
    name: "Sarah Connor",
    headline: "Principal Technical Recruiter at Google",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=600&h=200&q=80",
    status: 'connected',
    mutualConnections: 24,
    bio: "Recruiting premium software talent for Mountain View teams! Reach out for job updates in workspace technology."
  },
  {
    id: "conn_2",
    name: "Elon Mask",
    headline: "Lead Product Designer at Airbnb",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=600&h=200&q=80",
    status: 'connected',
    mutualConnections: 12,
    bio: "UX practitioner, visual arts enthusiast, and CSS animations lover."
  },
  {
    id: "conn_3",
    name: "Grace Hopper",
    headline: "Senior Staff Architect at Google",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    banner: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=200&q=80",
    status: 'pending_received',
    mutualConnections: 45,
    bio: "Connecting compiler technology, systems, and developer scaling."
  },
  {
    id: "conn_4",
    name: "Richard Feynman",
    headline: "Distinguished Researcher at Caltech",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    status: 'suggested',
    mutualConnections: 18
  },
  {
    id: "conn_5",
    name: "Ada Lovelace",
    headline: "Algorithms Lead at DeepMind",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80",
    status: 'suggested',
    mutualConnections: 31
  },
  {
    id: "conn_6",
    name: "Linus Torvalds",
    headline: "Founder and Principal Maintainer of Linux",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    status: 'suggested',
    mutualConnections: 104
  }
];

export const initialConversations: Conversation[] = [
  {
    id: "conv_1",
    participant: initialConnections[0], // Sarah Connor
    messages: [
      {
        id: "m_1",
        senderId: "conn_1",
        text: "Hi Somnath! I came across your profile and was really impressed by your experience with React performance optimizations. Are you open to discussing opportunities at Google?",
        timestamp: "Yesterday, 3:45 PM"
      },
      {
        id: "m_2",
        senderId: "me",
        text: "Hi Sarah, thank you for reaching out! I am always open to hearing about exciting frontend opportunities, especially in workspace technology. Google Workspace has been a favorite of mine.",
        timestamp: "Yesterday, 4:10 PM"
      },
      {
        id: "m_3",
        senderId: "conn_1",
        text: "That is fantastic to hear! Our engineering leads are reviewing profiles tomorrow. Would you mind sending your latest resume or summary over? We can set up a quick intro chat.",
        timestamp: "Yesterday, 4:15 PM"
      }
    ],
    unread: true
  },
  {
    id: "conv_2",
    participant: initialConnections[1], // Elon Mask
    messages: [
      {
        id: "m_4",
        senderId: "conn_2",
        text: "Hey Somnath! Love the post you shared last week about layout rendering and UI consistency. Spot on!",
        timestamp: "3 days ago"
      },
      {
        id: "m_5",
        senderId: "me",
        text: "Thanks Elon! Really appreciate your design write-ups too. The Airbnb components library is a huge inspiration.",
        timestamp: "3 days ago"
      }
    ],
    unread: false
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "n_1",
    type: 'connection_request',
    senderName: "Grace Hopper",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    senderHeadline: "Senior Staff Architect at Google",
    text: "sent you a connection invitation.",
    timestamp: "2h ago",
    read: false
  },
  {
    id: "n_2",
    type: 'like',
    senderName: "Sarah Connor",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    text: "liked your post regarding modern component spacing and typography metrics.",
    targetId: "post_1",
    timestamp: "4h ago",
    read: false
  },
  {
    id: "n_3",
    type: 'comment',
    senderName: "Grace Hopper",
    senderAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    text: "commented on a post you interacted with: 'This is a stellar opportunity...'",
    targetId: "post_1",
    timestamp: "5h ago",
    read: true
  }
];
