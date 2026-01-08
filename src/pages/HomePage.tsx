import React from "react";
import "../assets/css/HomePage.css";
import ExamCard from "../components/ExamCard";

const HomePage: React.FC = () => {
  return (
    <div className="">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon orange">🔥</div>
          <div>
            <div className="stat-value">7</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⚡</div>
          <div>
            <div className="stat-value">2,450</div>
            <div className="stat-label">Total XP</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🏆</div>
          <div>
            <div className="stat-value">Level 12</div>
            <div className="stat-label">Current Rank</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">🎯</div>
          <div>
            <div className="stat-value">76%</div>
            <div className="stat-label">Avg. Score</div>
          </div>
        </div>
      </div>
      <h3 className="mb-[16px] text-[18px] font-bold">Upcoming Exams</h3>
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
          onStart={() => {
            console.log("Exam started");
          }}
        />
        <ExamCard
          icon="⚗️"
          iconClass="chem"
          title="Atomic Structure Test"
          subject="Chemistry"
          teacher="Mr. Hassan Ali"
          details="5 questions • 10 minutes"
          date="Dec 15, 10 AM"
          status="info"
          badgeText=""
          onStart={() => {
            console.log("Exam started");
          }}
        />
      </div>
    </div>
  );
};

export default HomePage;
