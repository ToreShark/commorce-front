import React from 'react';
import "@/app/dashboard/featured/CircularProgressbar.scss";

interface CircularProgressbarProps {
  value: number;
  text: string;
}

const CircularProgressbar: React.FC<CircularProgressbarProps> = ({ value, text }) => {
  const strokeDashoffset = 285 - (value / 100) * 285;

  return (
    <div className="circular-progressbar">
      <svg viewBox="0 0 100 100">
        <circle
          className="progress-background"
          cx="50"
          cy="50"
          r="45"
        />
        <circle
          className="progress-bar"
          cx="50"
          cy="50"
          r="45"
          strokeDasharray="285"
          strokeDashoffset={strokeDashoffset}
        />
        <text
          className="progress-text"
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {text}
        </text>
      </svg>
    </div>
  );
};

export default CircularProgressbar;