import React from "react";
import "../assets/css/ExamCard.css"


type ExamStatus = "danger" | "success" | "info";

type ExamCardProps = {
  icon: React.ReactNode;
  iconClass?: string;
  title: string;
  subject: string;
  teacher: string;
  details: string;
  date: string;
  onStart: () => void;
  status?: ExamStatus;
  badgeText?: string;
};

const ExamCard: React.FC<ExamCardProps> = ({
  icon,
  iconClass = "",
  title,
  subject,
  teacher,
  details,
  date,
  onStart,
  status,
  badgeText,
}) => {
  return (
    <div className={`exam-card ${status ? status : ""}`}>
      <div className={`exam-icon ${iconClass}`}>{icon}</div>

      <div className="exam-info">
        <div className="exam-title">
          {title}
          {badgeText && (
            <span className={`badge badge-${status}`}>
              {badgeText}
            </span>
          )}
        </div>

        <div className="exam-meta">
          {subject} • {teacher}
        </div>

        <div className="exam-details">{details}</div>
      </div>

      <div className="exam-right">
        <div className="exam-date">{date}</div>
      </div>

      <button className="btn btn-primary bg-primary" onClick={onStart}>
        Start
      </button>
    </div>
  );
};

export default ExamCard;
