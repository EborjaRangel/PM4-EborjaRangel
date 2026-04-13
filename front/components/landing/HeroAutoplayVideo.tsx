"use client";

import { useCallback, useRef } from "react";

type HeroAutoplayVideoProps = {
  src: string;
  className?: string;
  "aria-label"?: string;
};

/**
 * Autoplay sin controles, una sola vez; al terminar queda en el último fotograma.
 * Ref callback: en la primera carga full-page el useEffect a veces corre antes de que
 * el <video> esté listo para play(); enganchamos listeners en el mismo commit del nodo.
 */
export default function HeroAutoplayVideo({
  src,
  className = "",
  "aria-label": ariaLabel = "Video de presentación",
}: HeroAutoplayVideoProps) {
  const cleanupRef = useRef<(() => void) | null>(null);

  const freezeLastFrame = useCallback((el: HTMLVideoElement) => {
    el.pause();
    try {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        el.currentTime = Math.max(0, el.duration - 0.04);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      cleanupRef.current?.();
      cleanupRef.current = null;

      if (!el) return;

      const tryPlay = () => {
        if (el.ended) return;
        if (!el.paused) return;
        el.muted = true;
        el.defaultMuted = true;
        el.setAttribute("muted", "");
        el.playsInline = true;
        void el.play().catch(() => {});
      };

      const onAnyReady = () => tryPlay();
      const events = [
        "loadedmetadata",
        "loadeddata",
        "canplay",
        "canplaythrough",
      ] as const;
      events.forEach((e) => el.addEventListener(e, onAnyReady));

      let attempts = 0;
      const maxAttempts = 50;
      const interval = window.setInterval(() => {
        attempts += 1;
        if (el.ended || attempts > maxAttempts) {
          window.clearInterval(interval);
          return;
        }
        if (!el.paused) {
          window.clearInterval(interval);
          return;
        }
        tryPlay();
      }, 100);

      const onVis = () => {
        if (document.visibilityState === "visible") tryPlay();
      };
      document.addEventListener("visibilitychange", onVis);

      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) tryPlay();
        },
        { threshold: 0.05 },
      );
      io.observe(el);

      tryPlay();
      requestAnimationFrame(() => tryPlay());

      cleanupRef.current = () => {
        events.forEach((e) => el.removeEventListener(e, onAnyReady));
        window.clearInterval(interval);
        document.removeEventListener("visibilitychange", onVis);
        io.disconnect();
      };
    },
    [],
  );

  return (
    <video
      key={src}
      ref={setVideoRef}
      className={className}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      controlsList="nodownload noremoteplayback"
      onEnded={(e) => freezeLastFrame(e.currentTarget)}
      onLoadedData={(e) => {
        const el = e.currentTarget;
        el.muted = true;
        void el.play().catch(() => {});
      }}
      aria-label={ariaLabel}
    />
  );
}
