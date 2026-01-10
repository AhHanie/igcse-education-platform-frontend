import "../assets/css/Sidebar.css"
import React from "react";
import Links from "./Links";
import routes from "../routes";

const Sidebar = (props: {
  open: boolean;
  onClose: React.MouseEventHandler<HTMLSpanElement>;
}) => {
  const { open, onClose } = props;
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
        <Links routes={routes} />
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
