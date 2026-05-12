"use client";

import { useCallback, useRef } from "react";

type HeroAutoplayVideoProps = {
  src: string;
  className?: string;
  /** En bucle: no se pausa el último frame; útil para landing con reproducción continua. */
  loop?: boolean;
  "aria-label"?: string;
};

/**
 * Autoplay sin controles. Sin `loop`, al terminar queda en el último fotograma.
 */
export default function HeroAutoplayVideo({
  src,
  className = "",
  loop = false,
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
        if (!loop && el.ended) return;
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
        if ((!loop && el.ended) || attempts > maxAttempts) {
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
    [freezeLastFrame, loop],
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
      loop={loop}
      onEnded={(e) => {
        if (!loop) freezeLastFrame(e.currentTarget);
      }}
      onLoadedData={(e) => {
        const el = e.currentTarget;
        el.muted = true;
        void el.play().catch(() => {});
      }}
      aria-label={ariaLabel}
    />
  );
}
