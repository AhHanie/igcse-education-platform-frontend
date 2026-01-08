import "../assets/css/Sidebar.css"

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = (props: {
  collapsed: boolean;
  onToggle: () => void;
}) => {
  const { collapsed, onToggle } = props;

    const showScreen = (id: string) => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(id)?.classList.add('active');
      document.querySelectorAll('.nav-item').forEach((n, i) => {
        n.classList.remove('active');
        const screens = ['dashboard', 'tools', 'subjects', 'exams', 'progress'];
        if (screens[i] === id) n.classList.add('active');
      });
    }

  return (
    <div className={`sidebar font-primary ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="collapse-toggle"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      <div className="logo">
        <div className="logo-icon">✨</div>
        {!collapsed && (
          <div>
            <h1>StudyAI</h1>
            <span>Student Companion</span>
          </div>
        )}
      </div>
      {/* Nav item */}

      <ul className="nav">
        {/* <Links routes={routes} /> */}
        <li className="nav-item active" onClick={() => {showScreen('dashboard')}} title="Dashboard">
          <span className="nav-icon">📊</span>
          {!collapsed && <span className="nav-text">Dashboard</span>}
        </li>
        <li className="nav-item" onClick={() => {showScreen('tools')}} title="AI Tools">
          <span className="nav-icon">🤖</span>
          {!collapsed && <span className="nav-text">AI Tools</span>}
        </li>
        <li className="nav-item" onClick={() => {showScreen('subjects')}} title="Subjects">
          <span className="nav-icon">📚</span>
          {!collapsed && <span className="nav-text">Subjects</span>}
        </li>
        <li className="nav-item" onClick={() => {showScreen('exams')}} title="Exams">
          <span className="nav-icon">📝</span>
          {!collapsed && <span className="nav-text">Exams</span>}
        </li>
        <li className="nav-item" onClick={() => {showScreen('progress')}} title="Progress">
          <span className="nav-icon">📈</span>
          {!collapsed && <span className="nav-text">Progress</span>}
        </li>
      </ul>

      <div className="user-card">
        <div className="avatar">OA</div>
        {!collapsed && (
          <div>
            <h4>Omar Ahmed</h4>
            <p>Grade 10</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
