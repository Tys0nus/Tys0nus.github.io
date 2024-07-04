import React from 'react';

function Progress({ text, percentage }) {
  return (
    <div className="progress">
      <span>{text}</span>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage * 100}%` }}
        />
      </div>
    </div>
  );
}

export default Progress;
