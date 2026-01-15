import { useState } from "react";
import {
  Lightbulb,
  BookOpen,
  Target,
  PenTool,
  BookMarked,
  Sparkles,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Card } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { tools } from "@app/config/tools";

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
  const navigate = useNavigate();

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
                className="block group transition-transform hover:scale-105"
                onClick={() => {
                  navigate(`${tool.url}?toolId=${tool.id}`);
                }}
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
