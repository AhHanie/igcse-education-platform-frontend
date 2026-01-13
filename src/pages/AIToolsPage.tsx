import { useState } from "react";
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
  Sparkles,
} from "lucide-react";
import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tags: string[];
  category: string;
}

const tools: Tool[] = [
  {
    id: "concept-explainer",
    name: "Concept Explainer",
    description:
      "Break down complex topics into simple, easy-to-understand explanations",
    icon: Lightbulb,
    color: "bg-pink-100 text-pink-600",
    tags: ["All Subjects", "Beginner Friendly"],
    category: "all",
  },
  {
    id: "summary-generator",
    name: "Summary Generator",
    description: "Create concise summaries of chapters, topics, or your notes",
    icon: FileText,
    color: "bg-teal-100 text-teal-600",
    tags: ["Quick Review", "Exam Prep"],
    category: "study",
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
  },
  {
    id: "study-planner",
    name: "Study Planner",
    description: "Create personalized study schedules based on your exams and goals",
    icon: Calendar,
    color: "bg-blue-100 text-blue-600",
    tags: ["Organization", "Time Management"],
    category: "study",
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
  },
  {
    id: "past-paper-helper",
    name: "Past Paper Helper",
    description: "Get step-by-step solutions and tips for past exam questions",
    icon: FileCheck,
    color: "bg-indigo-100 text-indigo-600",
    tags: ["Exam Style", "Mark Schemes"],
    category: "revision",
  },
  {
    id: "problem-solver",
    name: "Problem Solver",
    description: "Solve problems step-by-step with detailed working and explanations",
    icon: Calculator,
    color: "bg-cyan-100 text-cyan-600",
    tags: ["Math", "Calculations"],
    category: "practice",
  },
  {
    id: "mistake-analyzer",
    name: "Mistake Analyzer",
    description: "Understand why your questions wrong and how to improve",
    icon: Search,
    color: "bg-orange-100 text-orange-600",
    tags: ["Error Analysis", "Improvement"],
    category: "study",
  },
  {
    id: "essay-helper",
    name: "Essay Helper",
    description: "Structure and improve your scientific essays and long answers",
    icon: PenTool,
    color: "bg-amber-100 text-amber-600",
    tags: ["Extended Writing", "Structure"],
    category: "writing",
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
  },
  {
    id: "answer-improver",
    name: "Answer Improver",
    description: "Take your answers from good to excellent with specific improvements",
    icon: Target,
    color: "bg-rose-100 text-rose-600",
    tags: ["Exam Technique", "Marks Boost"],
    category: "practice",
  },
  {
    id: "definition-master",
    name: "Definition Master",
    description: "Learn precise definitions that examiners expect",
    icon: BookMarked,
    color: "bg-violet-100 text-violet-600",
    tags: ["Terminology", "Key Words"],
    category: "revision",
  },
  {
    id: "diagram-explainer",
    name: "Diagram Explainer",
    description: "Understand and learn to draw scientific diagrams correctly",
    icon: BarChart3,
    color: "bg-sky-100 text-sky-600",
    tags: ["Visual Learning", "Diagrams"],
    category: "study",
  },
  {
    id: "equation-balancer",
    name: "Equation Balancer",
    description: "Balance chemical equations with step-by-step guidance",
    icon: Atom,
    color: "bg-lime-100 text-lime-600",
    tags: ["Chemistry", "Equations"],
    category: "practice",
  },
  {
    id: "formula-finder",
    name: "Formula Finder",
    description: "Find and understand the right formula for any problem",
    icon: Calculator,
    color: "bg-slate-100 text-slate-600",
    tags: ["Physics", "Math"],
    category: "study",
  },
  {
    id: "why-bot",
    name: "Why Bot",
    description: 'Get answers to all your "why" and "how" questions in science',
    icon: HelpCircle,
    color: "bg-orange-100 text-orange-600",
    tags: ["Curiosity", "Deep Learning"],
    category: "explain",
  },
  {
    id: "quick-revision",
    name: "Quick Revision",
    description: "Rapid-fire review of key concepts before your exam",
    icon: Zap,
    color: "bg-red-100 text-red-600",
    tags: ["Last Minute", "Speed Review"],
    category: "revision",
  },
  {
    id: "topic-connector",
    name: "Topic Connector",
    description: "See how different topics link together across your subjects",
    icon: Link2,
    color: "bg-fuchsia-100 text-fuchsia-600",
    tags: ["Connections", "Big Picture"],
    category: "explain",
  },
  {
    id: "weak-spot-finder",
    name: "Weak Spot Finder",
    description: "Identify your weak areas and get targeted revision suggestions",
    icon: AlertCircle,
    color: "bg-red-100 text-red-600",
    tags: ["Personalized", "Improvement"],
    category: "study",
  },
  {
    id: "exam-simulator",
    name: "Exam Simulator",
    description: "Practice under real exam conditions with timed questions",
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
    tags: ["Exam Practice", "Timed"],
    category: "practice",
  },
];

const categories = [
  { id: "all", name: "All Tools", icon: Sparkles },
  { id: "study", name: "Study", icon: BookOpen },
  { id: "practice", name: "Practice", icon: Target },
  { id: "writing", name: "Writing", icon: PenTool },
  { id: "explain", name: "Explain", icon: Lightbulb },
  { id: "revision", name: "Revision", icon: BookMarked },
];

export default function AIToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredTools = tools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <div className="max-w-7xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Tools</h1>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
              NEW
            </span>
          </div>
          <p className="text-muted-foreground">
            50+ AI-powered tools to supercharge your learning
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <a
                key={tool.id}
                href="#"
                className="block group transition-transform hover:scale-105"
              >
                <Card className="p-6 h-full flex flex-col gap-4 hover:shadow-md transition-shadow">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg leading-tight">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              </a>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
