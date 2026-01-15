import {
  Lightbulb,
  FileText,
  BookOpen,
  Calendar,
  HelpCircle,
  FileCheck,
  Calculator,
  Search,
  PenTool,
  FlaskConical,
  Target,
  BookMarked,
  BarChart3,
  Atom,
  Zap,
  Link2,
  AlertCircle,
  Clock,
  MessageCircle,
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tags: string[];
  category: string;
  url: string;
}

export const tools: Tool[] = [
  {
    id: "main-chatbot",
    name: "Main Chatbot",
    description:
      "Chat with the core AI assistant for help across any subject or task",
    icon: MessageCircle,
    color: "bg-sky-100 text-sky-700",
    tags: ["All Subjects", "24/7 Help"],
    category: "all",
    url: "/chat",
  },
  {
    id: "concept_explainer",
    name: "Concept Explainer",
    description:
      "Break down complex topics into simple, easy-to-understand explanations",
    icon: Lightbulb,
    color: "bg-pink-100 text-pink-600",
    tags: ["All Subjects", "Beginner Friendly"],
    category: "all",
    url: "/chat",
  },
  {
    id: "summary-generator",
    name: "Summary Generator",
    description: "Create concise summaries of chapters, topics, or your notes",
    icon: FileText,
    color: "bg-teal-100 text-teal-600",
    tags: ["Quick Review", "Exam Prep"],
    category: "study",
    url: "/ai-tools",
  },
  {
    id: "flashcard-maker",
    name: "Flashcard Maker",
    description:
      "Generate flashcards automatically from any topic for efficient memorization",
    icon: BookOpen,
    color: "bg-purple-100 text-purple-600",
    tags: ["Memory", "Spaced Repetition"],
    category: "revision",
    url: "/ai-tools",
  },
  {
    id: "study-planner",
    name: "Study Planner",
    description:
      "Create personalized study schedules based on your exams and goals",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
    tags: ["Organization", "Time Management"],
    category: "study",
    url: "/ai-tools",
  },
  {
    id: "quiz-generator",
    name: "Quiz Generator",
    description:
      "Generate practice questions on any topic with instant feedback",
    icon: HelpCircle,
    color: "bg-yellow-100 text-yellow-600",
    tags: ["Self-Test", "All Levels"],
    category: "practice",
    url: "/ai-tools",
  },
  {
    id: "past-paper-helper",
    name: "Past Paper Helper",
    description: "Get step-by-step solutions and tips for past exam questions",
    icon: FileCheck,
    color: "bg-indigo-100 text-indigo-600",
    tags: ["Exam Style", "Mark Schemes"],
    category: "revision",
    url: "/ai-tools",
  },
  {
    id: "problem-solver",
    name: "Problem Solver",
    description:
      "Solve problems step-by-step with detailed working and explanations",
    icon: Calculator,
    color: "bg-cyan-100 text-cyan-600",
    tags: ["Math", "Calculations"],
    category: "practice",
    url: "/ai-tools",
  },
  {
    id: "mistake-analyzer",
    name: "Mistake Analyzer",
    description: "Understand why your questions wrong and how to improve",
    icon: Search,
    color: "bg-orange-100 text-orange-600",
    tags: ["Error Analysis", "Improvement"],
    category: "study",
    url: "/ai-tools",
  },
  {
    id: "essay-helper",
    name: "Essay Helper",
    description:
      "Structure and improve your scientific essays and long answers",
    icon: PenTool,
    color: "bg-amber-100 text-amber-600",
    tags: ["Extended Writing", "Structure"],
    category: "writing",
    url: "/ai-tools",
  },
  {
    id: "lab-report-writer",
    name: "Lab Report Writer",
    description:
      "Guide you through writing perfect lab reports with all sections",
    icon: FlaskConical,
    color: "bg-emerald-100 text-emerald-600",
    tags: ["Practical Work", "Format"],
    category: "writing",
    url: "/ai-tools",
  },
  {
    id: "answer-improver",
    name: "Answer Improver",
    description:
      "Take your answers from good to excellent with specific improvements",
    icon: Target,
    color: "bg-rose-100 text-rose-600",
    tags: ["Exam Technique", "Marks Boost"],
    category: "practice",
    url: "/ai-tools",
  },
  {
    id: "definition-master",
    name: "Definition Master",
    description: "Learn precise definitions that examiners expect",
    icon: BookMarked,
    color: "bg-violet-100 text-violet-600",
    tags: ["Terminology", "Key Words"],
    category: "revision",
    url: "/ai-tools",
  },
  {
    id: "diagram-explainer",
    name: "Diagram Explainer",
    description: "Understand and learn to draw scientific diagrams correctly",
    icon: BarChart3,
    color: "bg-sky-100 text-sky-600",
    tags: ["Visual Learning", "Diagrams"],
    category: "study",
    url: "/ai-tools",
  },
  {
    id: "equation-balancer",
    name: "Equation Balancer",
    description: "Balance chemical equations with step-by-step guidance",
    icon: Atom,
    color: "bg-lime-100 text-lime-600",
    tags: ["Chemistry", "Equations"],
    category: "practice",
    url: "/ai-tools",
  },
  {
    id: "formula-finder",
    name: "Formula Finder",
    description: "Find and understand the right formula for any problem",
    icon: Calculator,
    color: "bg-slate-100 text-slate-600",
    tags: ["Physics", "Math"],
    category: "study",
    url: "/ai-tools",
  },
  {
    id: "why-bot",
    name: "Why Bot",
    description: 'Get answers to all your "why" and "how" questions in science',
    icon: HelpCircle,
    color: "bg-orange-100 text-orange-600",
    tags: ["Curiosity", "Deep Learning"],
    category: "explain",
    url: "/ai-tools",
  },
  {
    id: "quick-revision",
    name: "Quick Revision",
    description: "Rapid-fire review of key concepts before your exam",
    icon: Zap,
    color: "bg-red-100 text-red-600",
    tags: ["Last Minute", "Speed Review"],
    category: "revision",
    url: "/ai-tools",
  },
  {
    id: "topic-connector",
    name: "Topic Connector",
    description: "See how different topics link together across your subjects",
    icon: Link2,
    color: "bg-fuchsia-100 text-fuchsia-600",
    tags: ["Connections", "Big Picture"],
    category: "explain",
    url: "/ai-tools",
  },
  {
    id: "weak-spot-finder",
    name: "Weak Spot Finder",
    description:
      "Identify your weak areas and get targeted revision suggestions",
    icon: AlertCircle,
    color: "bg-red-100 text-red-600",
    tags: ["Personalized", "Improvement"],
    category: "study",
    url: "/ai-tools",
  },
  {
    id: "exam-simulator",
    name: "Exam Simulator",
    description: "Practice under real exam conditions with timed questions",
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
    tags: ["Exam Practice", "Timed"],
    category: "practice",
    url: "/ai-tools",
  },
];

export const getToolById = (toolId: string): Tool | undefined => {
  return tools.find((tool) => tool.id === toolId);
};
