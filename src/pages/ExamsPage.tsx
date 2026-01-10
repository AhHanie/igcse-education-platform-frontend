import React, { useState } from "react";
import "../assets/css/Exams.css";
import ExamCard from "../components/examCard";

type TabType = "pending" | "completed";

const ExamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending <span className="tab-count">(3)</span>
        </button>

        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed <span className="tab-count">(2)</span>
        </button>
      </div>

      {/* Pending */}
      {activeTab === "pending" && (
        <div className="exam-list">
          <ExamCard
            icon="🧬"
            iconClass="bio"
            title="Cell Structure Quiz"
            subject="Biology"
            teacher="Dr. Amira Hassan"
            details="5 questions • 10 minutes"
            date="Tomorrow, 9 AM"
            status="danger"
            badgeText="Due Soon"
            onStart={() => console.log("Exam started")}
          />
        </div>
      )}

      {/* Completed */}
      {activeTab === "completed" && (
        <div className="exam-list">
          <p>No completed exams yet</p>
        </div>
      )}
    </div>
  );
};

export default ExamsPage;
