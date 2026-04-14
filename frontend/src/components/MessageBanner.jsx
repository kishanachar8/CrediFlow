import React from 'react';

export function MessageBanner({ message }) {
  if (!message.text) {
    return null;
  }

  return <div className={`message ${message.type}`}>{message.text}</div>;
}
