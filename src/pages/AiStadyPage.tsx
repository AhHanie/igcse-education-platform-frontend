import React from "react";
import "../assets/css/Ai-Chatpot.css"
import ChatInput from "@/components/ui/chatpot";
import CustomDropdown from "@/components/ui/dropDown";


type ModeType = "explain" | "solve" | "quiz" | "simplify" | "summarize";

export interface DropdownOption {
  id: number | string;
  subjectName: string;
  icon?: string;
}

const subjectList: DropdownOption[] = [
  { id: 1, subjectName: "Biology" , icon: "🧬"},
  { id: 2, subjectName: "Chemistry", icon: "⚗️" },
  { id: 3, subjectName: "Physics", icon: "⚡" },
  { id: 4, subjectName: "Mathematics", icon: "📐" },
  { id: 5, subjectName: "English", icon: "📚" },
  { id: 6, subjectName: "History", icon: "🏛️" },
  { id: 7, subjectName: "Geography", icon: "🌍" },
  { id: 8, subjectName: "Economics", icon: "📊" },
];

const AiStadyPage: React.FC = () => {
const [currentSubject, setCurrentSubject] = React.useState<DropdownOption | null>(subjectList[0]);
  const askQuestion = (question: string) => {
    console.log(`User asked: ${question}`);
    // Here you would integrate with your AI backend to get a response
  }
console.log("Current Subject:", currentSubject);
  const handleSend = (message: string, mode: ModeType) => {
  console.log("Mode:", mode);
  console.log("Message:", message);
  }
  const handleSelect = (option: DropdownOption) => {
  setCurrentSubject(option);
};
console.log("Selected Subject:", currentSubject);
  return (
    <div className="h-full">
      <div className="header-right">
    <div className="w-[165px]">
    <CustomDropdown
      options={subjectList}
      subjectId={currentSubject?.id}
      subjectName={currentSubject?.subjectName}
      icon={currentSubject?.icon}
      selected={handleSelect}
    />
      </div>
    </div>
    <div className="chat-area" id="chatArea">
    <div className="welcome-message" id="welcomeMessage">
      <div className="welcome-icon">🤖</div>

      <h2>Hi! I'm your IGCSE Study Companion</h2>

      <p>
        Ask me anything about your IGCSE subjects. I'll explain concepts,
        solve problems step-by-step, and help you prepare for exams.
      </p>

      <div className="quick-actions">
        <button
          className="quick-action"
          onClick={() =>
            askQuestion("Explain photosynthesis step by step")
          }
        >
          🌱 Explain photosynthesis
        </button>
        <button
          className="quick-action"
          onClick={() =>
            askQuestion("What is the quadratic formula and when do I use it?")
          }
        >
          📐 Quadratic formula
        </button>
        <button
          className="quick-action"
          onClick={() =>
            askQuestion("Explain Newton's 3 laws of motion with examples")
          }
        >
          ⚡ Newton's laws
        </button>

        <button
          className="quick-action"
          onClick={() =>
            askQuestion("How do I balance chemical equations?")
          }
        >
          ⚗️ Balance equations
        </button>
      </div>
    </div>
    <ChatInput onSend={handleSend} />         
      </div>
      </div>
  );
};

export default AiStadyPage;
