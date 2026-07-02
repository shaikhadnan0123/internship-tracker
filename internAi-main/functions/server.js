var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  app: () => app
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
var GEMINI_API_KEY = process.env.GEMINI_API_KEY || "MY_GEMINI_API_KEY";
app.use(import_express.default.json());
var aiClient = null;
var isApiKeyAvailable = !!GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
function getAiClient() {
  if (!isApiKeyAvailable) {
    return null;
  }
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.post("/api/ai/post-assistant", async (req, res) => {
  const { prompt, tone = "professional" } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }
  const client = getAiClient();
  if (!client) {
    const fallbacks = {
      professional: [
        `Excited to share that I'm taking on a new challenge! Let's connect, share experiences, and collaborate. High energy, team first! #${prompt.replace(/\s+/g, "")} #Networking #CareerGrowth`,
        `Leadership isn't about being in charge. It's about taking care of those in our charge. Today, we discussed how to scale systems while maintaining positive culture. What are your thoughts? #${prompt.replace(/\s+/g, "")} #Leadership #TechHub`
      ],
      insightful: [
        `Reflecting on our latest launch, key lesson learned: iterative scaling works better than big-bang updates. Start small, validate fast, iterate. What's your project management philosophy? #${prompt.replace(/\s+/g, "")} #Productivity #Insights`,
        `The intersection of design and robust engineering is where true value resides. Here are my top 3 takeaways from bridging that gap this quarter... #${prompt.replace(/\s+/g, "")} #TechTalk #Innovation`
      ],
      casual: [
        `Spent the morning refactoring code and sipping coffee. \u2615\uFE0F There's something highly satisfying about cleaning up stale endpoints. How is your workweek looking? #Developers #Refactoring #DevLife #${prompt.replace(/\s+/g, "")}`
      ]
    };
    const options = fallbacks[tone] || fallbacks.professional;
    const selected = options[Math.floor(Math.random() * options.length)];
    return res.json({ draft: selected });
  }
  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a LinkedIn post about: "${prompt}".
      The tone should be: "${tone}".
      Keep it professional, engaging, scannable, and include 3 relevant hashtags. Ensure it sounds natural and authentic. Limit the post to 150-200 words. Do not use markdown backticks in the response.`
    });
    res.json({ draft: response.text });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to generate post. Please try again later." });
  }
});
app.post("/api/ai/chat-response", async (req, res) => {
  const { messages, partnerName, partnerHeadline } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }
  const client = getAiClient();
  if (!client) {
    const lastUserMsg = [...messages].reverse().find((m) => m.senderId === "me")?.text || "";
    let fallbackText = `Hi there! Thanks for reaching out. That sounds extremely interesting. Let me check my calendar for next week and I'll get back to you!`;
    if (lastUserMsg.toLowerCase().includes("resume") || lastUserMsg.toLowerCase().includes("apply") || lastUserMsg.toLowerCase().includes("job")) {
      fallbackText = `Thanks for sending that over! I've shared your details with our engineering leads. They are reviewing the pipeline tomorrow and I'll reach out once we have feedback! Let's stay in touch.`;
    } else if (lastUserMsg.toLowerCase().includes("hello") || lastUserMsg.toLowerCase().includes("hi")) {
      fallbackText = `Hello! Great to connect with you. I'm always looking to expand my network with talented professionals in the field. How is everything going with you?`;
    }
    return res.json({ response: fallbackText });
  }
  try {
    const conversationHistory = messages.slice(-6).map((m) => {
      return `${m.senderId === "me" ? "User" : partnerName}: ${m.text}`;
    }).join("\n");
    const prompt = `You are ${partnerName}, working as "${partnerHeadline}".
    Generate a short, professional, conversational chat reply to the user.
    Here is the recent conversation history:
    ${conversationHistory}
    
    Guidelines:
    - Respond strictly as ${partnerName}.
    - Keep the reply conversational, encouraging, and natural for an instant messenger (1-3 sentences max).
    - Do not include system text or label the response like "${partnerName}:" in the output. Just output the reply.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    res.json({ response: response.text?.trim() });
  } catch (error) {
    console.error("Gemini API chat error:", error);
    res.status(500).json({ error: "Unable to reply at the moment." });
  }
});
app.post("/api/ai/cover-letter", async (req, res) => {
  const { jobTitle, company, jobDescription, profile } = req.body;
  if (!jobTitle || !company) {
    return res.status(400).json({ error: "Job title and company are required." });
  }
  const client = getAiClient();
  if (!client) {
    const fallbackLetter = `Dear Hiring Team at ${company},

I am writing to express my enthusiastic interest in the ${jobTitle} position. With my background as a ${profile?.headline || "Professional"}, combined with hands-on skills in ${profile?.skills?.slice(0, 4).join(", ") || "software development"}, I am eager to contribute to your mission.

Throughout my career, I have focused on solving complex problems and collaborating with cross-functional teams to deliver highly scalable applications. I am drawn to ${company} because of your commitment to excellence and innovation, and I am confident that my experience aligns well with the requirements of this role.

Thank you for your time and consideration. I look forward to discussing how my experience can benefit ${company}.

Sincerely,
${profile?.name || "Applicant"}`;
    return res.json({ coverLetter: fallbackLetter });
  }
  try {
    const prompt = `Write a polished, professional, and personalized Cover Letter for a job application.
    
    Job Details:
    - Title: ${jobTitle}
    - Company: ${company}
    - Description: ${jobDescription || "N/A"}
    
    Applicant Profile:
    - Name: ${profile?.name || "Applicant"}
    - Headline: ${profile?.headline || "Professional"}
    - About: ${profile?.about || "N/A"}
    - Skills: ${profile?.skills?.join(", ") || "N/A"}
    - Experience: ${JSON.stringify(profile?.experience || [])}
    
    Formatting Guidelines:
    - Return a clean, professional letter layout.
    - Tailor the letter to match how the applicant's experience and skills solve the job requirements.
    - Limit the word count to 250-300 words.
    - Do not use markdown backticks or system codes in the response.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    res.json({ coverLetter: response.text });
  } catch (error) {
    console.error("Gemini API cover letter error:", error);
    res.status(500).json({ error: "Failed to generate cover letter." });
  }
});
app.post("/api/ai/optimize-profile", async (req, res) => {
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: "Profile details are required." });
  }
  const client = getAiClient();
  if (!client) {
    const fallbackSuggestions = {
      headline: "\u{1F4A1} Try including your core tech stack or unique impact. E.g., 'Software Engineer | React, Node, Cloud Solutions' instead of just a generic title.",
      about: "\u{1F4A1} Your 'About' section should start with a strong hook: tell your career story, highlight your biggest technical achievements, and state what drives you.",
      experience: "\u{1F4A1} For your experience list, focus on metrics. Instead of 'built dashboard', use 'Designed responsive analytical dashboard with React, boosting team data monitoring efficiency by 30%'.",
      skills: "\u{1F4A1} Add more emerging technical skills. Your profile would benefit from calling out: Cloud Infrastructure, API Design, System Architecture."
    };
    return res.json({ suggestions: fallbackSuggestions });
  }
  try {
    const prompt = `You are a world-class professional career coach and LinkedIn profile optimizer.
    Analyze the following applicant profile and provide targeted, constructive, high-impact suggestions for each section:
    
    Profile Details:
    - Name: ${profile.name}
    - Headline: ${profile.headline}
    - About: ${profile.about}
    - Skills: ${profile.skills?.join(", ")}
    - Experience: ${JSON.stringify(profile.experience)}
    
    Provide your output in a structured JSON object with exactly these four keys:
    - "headline": (A specific headline recommendation with explanation)
    - "about": (An optimized brief summary or tips to restructure the about section)
    - "experience": (Advice on how to write impact-focused experience descriptions)
    - "skills": (Recommendations on key in-demand skills to add based on their background)
    
    Ensure suggestions are highly actionable, specific to their background, and supportive. Use professional, clear language. Do not output anything other than raw, valid JSON.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({ suggestions: parsed });
  } catch (error) {
    console.error("Gemini API profile optimization error:", error);
    res.status(500).json({ error: "Failed to generate profile suggestions." });
  }
});
app.post("/api/ai/resume-question", async (req, res) => {
  const { resumeText, question } = req.body;
  if (!resumeText || !question) {
    return res.status(400).json({ error: "Resume text and question are required." });
  }
  const client = getAiClient();
  if (!client) {
    let answer = `Here is a custom simulated response based on your resume:

- **Key Highlights**: Based on your credentials, you demonstrate excellent professional potential.
- **Specific Recommendation for "${question}"**: Ensure you emphasize hands-on projects, list modern toolchains (Vite, React, Node, Tailwind), and format accomplishment bullets using the STAR methodology (Situation, Task, Action, Result).
- **Pro Tip**: Keep your resume to a single page and align the technical skills list with the targeted internship job description.`;
    const q = question.toLowerCase();
    if (q.includes("skill") || q.includes("tech")) {
      answer = `### \u{1F6E0}\uFE0F Technical Skills Assessment

Based on your uploaded resume, here are the core skill groupings you should highlight:

1. **Frontend Core**: Modern JavaScript/TypeScript, React 18, and responsive styling via Tailwind CSS.
2. **Backend & Tooling**: Node.js ecosystem (Express, npm), bundled compilation via Vite, and database integration.
3. **Best Practices**: Version control, component modularization, and clean architectural patterns.

*Tip: Consider adding more cloud or DevOps exposure (e.g. AWS, Docker) to broaden your applicability for full-stack internship positions!*`;
    } else if (q.includes("interview") || q.includes("prep") || q.includes("question")) {
      answer = `### \u{1F3AF} Targeted Interview Preparation Questions

Based on your resume, prepare to answer these 3 customized questions:

1. **Technical**: *"You highlighted experience with React. Can you explain how you manage state and avoid unnecessary re-renders in a highly dynamic view?"*
2. **Behavioral**: *"Tell me about a time you encountered a complex technical bug under a tight deadline. How did you triage and solve it?"*
3. **Architectural**: *"Why did you select Vite over other bundlers for your frontend builds, and how does your Express server handle incoming API requests?"*

*Prepare 2-minute answers using the STAR method (Situation, Task, Action, Result) for maximum impact!*`;
    } else if (q.includes("improve") || q.includes("format") || q.includes("review")) {
      answer = `### \u{1F4DD} Recommended Resume Improvements

Here are 3 concrete ways to make your CV stand out immediately:

1. **Quantify Accomplishments**: Instead of *"developed dashboard"*, write *"Engineered responsive administrative dashboard in React, reducing load latencies by 35% and improving team tracking workflows."*
2. **Modernize Your Tech Stack Header**: Arrange skills into logical columns (Languages, Frameworks, Developer Tools) and put the most relevant ones for the specific role first.
3. **Incorporate Active Verbs**: Begin every experience bullet point with strong active verbs like *Spearheaded, Architected, Engineered, Optimized,* or *Consolidated*.`;
    }
    return res.json({ answer });
  }
  try {
    const prompt = `You are an expert HR Specialist, Senior Technical Recruiter, and Career Coach.
    
    Analyze the following resume/CV text:
    ---
    ${resumeText}
    ---
    
    Answer the user's specific question: "${question}".
    
    Guidelines:
    - Provide a practical, concrete, and highly actionable response tailored specifically to the skills and experiences present in the resume.
    - Write in an encouraging, expert professional tone.
    - Organize your response using clean formatting (bullet points, numbered lists, sub-headers) so it is highly readable and professional.
    - Do not use markdown backticks or block code blocks. Keep the response around 150-250 words.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    res.json({ answer: response.text });
  } catch (error) {
    console.error("Gemini API resume question error:", error);
    res.status(500).json({ error: "Failed to process your question. Please try again." });
  }
});
app.post("/api/ai/resume-internships", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: "Resume text is required to recommend internships." });
  }
  const client = getAiClient();
  if (!client) {
    const textLower = resumeText.toLowerCase();
    let isFrontend = textLower.includes("react") || textLower.includes("html") || textLower.includes("css") || textLower.includes("frontend");
    let isAi = textLower.includes("ai") || textLower.includes("python") || textLower.includes("ml") || textLower.includes("machine");
    let recs = [
      {
        roleTitle: isFrontend ? "Frontend Development Intern" : "Software Engineering Intern",
        company: "Lumina Systems",
        suitabilityScore: 94,
        matchReason: "Matches your proficiency in React, modular UI state design, and elegant CSS styling.",
        skillsToShowcase: ["React.js", "Tailwind CSS", "Vite", "TypeScript"]
      },
      {
        roleTitle: isAi ? "AI & Machine Learning Engineering Intern" : "Full-Stack Development Intern",
        company: "Nebula Labs",
        suitabilityScore: 88,
        matchReason: "Aligns with your solid foundation in server-side Node.js routing and modern data manipulation pipelines.",
        skillsToShowcase: ["Node.js", "Express", "API Design", "internAi API integration"]
      },
      {
        roleTitle: "Cloud Solutions & DevOps Intern",
        company: "Apex Cloud Services",
        suitabilityScore: 81,
        matchReason: "Strong fit for practicing deployment pipelines, containerization scripts, and backend performance optimizations.",
        skillsToShowcase: ["Docker", "Linux Shell", "GitHub Actions", "CI/CD Setup"]
      }
    ];
    return res.json({ recommendations: recs });
  }
  try {
    const prompt = `You are a career placement officer and matching system.
    Analyze the following resume/CV text:
    ---
    ${resumeText}
    ---
    
    Recommend exactly 3 highly relevant technology internship roles that are the best matches for this candidate's skill set and experience.
    
    Return your recommendations as a valid JSON array of objects. Each object must have these exactly:
    - "roleTitle": The title of the internship role (e.g. "React Developer Intern", "Cloud Infrastructure Intern", etc.)
    - "company": A plausible premium technology company name (e.g. "Lumina Systems", "GridSync", "DevCore", "Synapse Labs")
    - "suitabilityScore": An integer match percentage from 50 to 98 based on skill alignment.
    - "matchReason": A concise 1-sentence description explaining why this candidate is a strong fit for this internship based on their background.
    - "skillsToShowcase": An array of 3-4 specific technical skills from their resume (or adjacent in-demand skills) they should highlight when applying.
    
    Format the response strictly as raw JSON matching the schema. Do not wrap the JSON in backticks or code block indicators.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.ARRAY,
          items: {
            type: import_genai.Type.OBJECT,
            properties: {
              roleTitle: { type: import_genai.Type.STRING },
              company: { type: import_genai.Type.STRING },
              suitabilityScore: { type: import_genai.Type.INTEGER },
              matchReason: { type: import_genai.Type.STRING },
              skillsToShowcase: {
                type: import_genai.Type.ARRAY,
                items: { type: import_genai.Type.STRING }
              }
            },
            required: ["roleTitle", "company", "suitabilityScore", "matchReason", "skillsToShowcase"]
          }
        }
      }
    });
    const parsed = JSON.parse(response.text || "[]");
    res.json({ recommendations: parsed });
  } catch (error) {
    console.error("Gemini API internship matching error:", error);
    res.status(500).json({ error: "Failed to generate internship recommendations." });
  }
});
app.post("/api/ai/resume-analysis", async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) {
    return res.status(400).json({ error: "Resume text is required for analysis." });
  }
  const client = getAiClient();
  if (!client) {
    const textLower = resumeText.toLowerCase();
    const isFrontend = textLower.includes("react") || textLower.includes("html") || textLower.includes("css") || textLower.includes("frontend");
    const isAi = textLower.includes("ai") || textLower.includes("python") || textLower.includes("ml") || textLower.includes("machine");
    let score = 78;
    let summary = "Strong background in standard modern web development. Shows good internship and personal project practice, but could make accomplishments significantly more metric-driven and highlight modern bundler/ecosystem depth.";
    let vibe = "Modern Product & Client Focus";
    let strengths = [
      "Demonstrates practical hands-on experience building interactive web applications using React and JavaScript.",
      "Clear organization of skills into understandable technology columns and sections.",
      "Shows continuous learning with self-initiated side projects and internships."
    ];
    let improvements = [
      "Quantify your accomplishments: Add concrete numbers, metrics, or percentage improvements to highlight actual impact.",
      "Broaden cloud/backend experience to include tools like AWS, Docker, or SQL databases to unlock more fullstack paths.",
      "Start experience bullet points with more dynamic action verbs like 'Spearheaded', 'Architected', or 'Optimized'."
    ];
    let roles = ["Frontend Engineer Intern", "Full-Stack Web Intern"];
    if (isAi) {
      score = 85;
      summary = "Excellent emerging AI/ML and software engineering profile. Solid grasp of data processing pipelines, python modeling, and modern AI integration APIs. Ready for hands-on labs or product integration roles.";
      vibe = "Data-Driven AI Research & Product Engineering";
      strengths = [
        "Strong foundation in python engineering and modern artificial intelligence tooling.",
        "Excellent showcase of AI-guided app integrations or prompt orchestration libraries.",
        "Clear alignment with current high-growth tech industry vectors."
      ];
      improvements = [
        "Include more details on model evaluation, data scale (MB/GB processed), or execution performance metrics.",
        "Demonstrate stronger front-end deployment proficiency to complement server-side model pipelines.",
        "Ensure clear description of collaboration frameworks or team environments in project roles."
      ];
      roles = ["AI/ML Research Intern", "Python Backend Intern", "AI Engineer Intern"];
    }
    const fallbackAnalysis = {
      overallScore: score,
      summary,
      industryVibe: vibe,
      categories: [
        { name: "Impact & Metrics", score: score - 12, feedback: "Most experience items focus on responsibilities rather than quantified outcomes. Aim to state what you achieved, not just what you did." },
        { name: "Skills Relevance", score: score + 8, feedback: "Great inclusion of in-demand modern tools (React, Node, Python, Git) that match top tech recruiters' search filters." },
        { name: "Structure & Flow", score: score + 5, feedback: "Highly readable layout, clean sections, and logical progression from personal bio to professional experiences." },
        { name: "ATS Compatibility", score: score + 2, feedback: "Highly parseable standard formatting with clear section headers, minimizing the risk of indexing failures on corporate portals." }
      ],
      strengths,
      improvements,
      suggestedRoles: roles
    };
    return res.json({ analysis: fallbackAnalysis });
  }
  try {
    const prompt = `You are an elite Technical Recruiter, HR Tech Product Manager, and Applicant Tracking System (ATS) Architect.
    Analyze the following resume/CV text:
    ---
    ${resumeText}
    ---
    
    Evaluate this candidate's resume and generate a highly detailed, professional performance analysis and scoring.
    
    Provide your evaluation strictly as a valid JSON object with exactly the following schema. Make sure all scores are integers between 1 and 100:
    {
      "overallScore": (Overall resume score from 1 to 100, where 90+ is excellent, 75-89 is strong, and <75 has major improvement areas),
      "summary": (A 2-3 sentence expert, executive summary of the candidate's career readiness, technical narrative, and professional value proposition),
      "industryVibe": (A 2-4 word branding description of their professional persona, e.g. "Modern Product Front-End", "Data-Driven Machine Learning", "Robust Infrastructure Backend", "High-Velocity Full-Stack Engineer"),
      "categories": [
        {
          "name": "Impact & Metrics",
          "score": (Score out of 100),
          "feedback": (1-2 sentences of specific advice on how to improve this dimension)
        },
        {
          "name": "Skills Relevance",
          "score": (Score out of 100),
          "feedback": (1-2 sentences of specific advice)
        },
        {
          "name": "Structure & Flow",
          "score": (Score out of 100),
          "feedback": (1-2 sentences of specific advice)
        },
        {
          "name": "ATS Compatibility",
          "score": (Score out of 100),
          "feedback": (1-2 sentences of specific advice)
        }
      ],
      "strengths": [
        (3 specific, high-quality, encouraging bullets of what they did exceptionally well)
      ],
      "improvements": [
        (3 specific, highly actionable, realistic steps they can take immediately to boost their score)
      ],
      "suggestedRoles": [
        (2-3 specific software engineering or product role titles they are ready for)
      ]
    }
    
    Do not include markdown backticks or formatting outside the JSON object. Just return raw JSON.`;
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            overallScore: { type: import_genai.Type.INTEGER },
            summary: { type: import_genai.Type.STRING },
            industryVibe: { type: import_genai.Type.STRING },
            categories: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  name: { type: import_genai.Type.STRING },
                  score: { type: import_genai.Type.INTEGER },
                  feedback: { type: import_genai.Type.STRING }
                },
                required: ["name", "score", "feedback"]
              }
            },
            strengths: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            improvements: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            },
            suggestedRoles: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING }
            }
          },
          required: ["overallScore", "summary", "industryVibe", "categories", "strengths", "improvements", "suggestedRoles"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({ analysis: parsed });
  } catch (error) {
    console.error("Gemini API resume analysis error:", error);
    res.status(500).json({ error: "Failed to generate resume analysis." });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}
if (!process.env.FIREBASE_CONFIG && !process.env.FUNCTIONS_EMULATOR) {
  startServer();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
//# sourceMappingURL=server.js.map
