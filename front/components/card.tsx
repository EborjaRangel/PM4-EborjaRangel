// src/components/Card.tsx
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({ children, className, style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        padding: 16,
        borderRadius: 8,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        backgroundColor: '#fff',
        marginBottom: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}