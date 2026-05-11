import React from "react";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
  /** Menos espacio entre el nav y el contenido */
  compactTop?: boolean;
  /** Aún menos aire arriba/abajo (p. ej. landing con hero + video) */
  shellTight?: boolean;
};

/** Contenedor homogéneo para el contenido de cada página */
export default function PageShell({
  children,
  className = "",
  compactTop = false,
  shellTight = false,
}: PageShellProps) {
  const vertical = shellTight
    ? "pt-2 pb-5 sm:pt-3 sm:pb-6"
    : compactTop
      ? "pt-4 pb-10 sm:pt-5 sm:pb-12"
      : "py-10 sm:py-12";

  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${vertical} ${className}`}
    >
      {children}
    </div>
  );
}
