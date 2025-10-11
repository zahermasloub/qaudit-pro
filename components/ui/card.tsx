import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded shadow p-4 bg-white">{children}</div>;
}
