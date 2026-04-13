import React from "react";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

/** Contenedor homogéneo para el contenido de cada página */
export default function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 ${className}`}>
      {children}
    </div>
  );
}
