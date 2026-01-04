import "../assets/css/Sidebar.css"

import React from "react";

const Sidebar = (props: {
  open: boolean;
  onClose: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  const { open, onClose } = props;

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
    <div
      className={`sidebar font-primary ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
      </span>

    <div className="logo">
      <div className="logo-icon">✨</div>
      <div>
        <h1>StudyAI</h1>
        <span>Student Companion</span>
      </div>
    </div>
      {/* Nav item */}

      <ul className="nav">
        {/* <Links routes={routes} /> */}
      <li className="nav-item active" onClick={() => {showScreen('dashboard')}}>📊 Dashboard</li>
      <li className="nav-item" onClick={() => {showScreen('tools')}}>🤖 AI Tools</li>
      <li className="nav-item" onClick={() => {showScreen('subjects')}}>📚 Subjects</li>
      <li className="nav-item" onClick={() => {showScreen('exams')}}>📝 Exams</li>
      <li className="nav-item" onClick={() => {showScreen('progress')}}>📈 Progress</li>
      </ul>
    <div className="user-card">
      <div className="avatar">OA</div>
      <div>
        <h4>Omar Ahmed</h4>
        <p>Grade 10</p>
      </div>
    </div>
    </div>
  );
};

export default Sidebar;
