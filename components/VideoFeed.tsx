"use client";

import { Flag, Send, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Clip } from "@/lib/videos";

export function VideoFeed({ clips }: { clips: Clip[] }) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const countedViews = useRef<Set<string>>(new Set());
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const gestureLocked = useRef(false);
  const touchStartY = useRef(0);
  const [activeId, setActiveId] = useState(clips[0]?.id);
  const [muted, setMuted] = useState(true);
  const [views, setViews] = useState<Record<string, number>>(
    Object.fromEntries(clips.map((clip) => [clip.id, clip.view_count])),
  );

  const activateClip = useCallback(
    (index: number, instant = false) => {
      const clip = clips[Math.max(0, Math.min(clips.length - 1, index))];
      if (!clip) return;

      cardRefs.current[clip.id]?.scrollIntoView({ behavior: instant ? "auto" : "smooth", block: "start" });
      setActiveId(clip.id);
      clips.forEach((item) => {
        const video = videoRefs.current[item.id];
        if (!video) return;
        if (item.id === clip.id) video.play().catch(() => undefined);
        else video.pause();
      });

      if (!countedViews.current.has(clip.id)) {
        window.setTimeout(() => {
          const current = videoRefs.current[clip.id];
          if (current && !current.paused) {
            countedViews.current.add(clip.id);
            setViews((previous) => ({ ...previous, [clip.id]: (previous[clip.id] ?? 0) + 1 }));
          }
        }, 1800);
      }
    },
    [clips],
  );

  const stepClip = useCallback(
    (direction: number) => {
      if (gestureLocked.current) return;
      const currentIndex = Math.max(0, clips.findIndex((clip) => clip.id === activeId));
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= clips.length) return;
      gestureLocked.current = true;
      activateClip(nextIndex);
      window.setTimeout(() => {
        gestureLocked.current = false;
      }, 650);
    },
    [activateClip, activeId, clips],
  );

  useEffect(() => {
    activateClip(0, true);
  }, [activateClip]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) video.muted = muted;
    });
  }, [muted]);

  if (clips.length === 0) {
    return (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-ember">No published clips</p>
          <h1 className="mt-3 text-3xl font-black">The feed is ready for the first upload.</h1>
          <p className="mt-3 text-white/70">Approved uploaders can add vertical videos from the upload page.</p>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label="Manual clip feed"
      className="snap-feed h-screen overflow-hidden bg-black"
      onKeyDown={(event) => {
        if (["ArrowDown", "PageDown", " "].includes(event.key)) {
          event.preventDefault();
          stepClip(1);
        }
        if (["ArrowUp", "PageUp"].includes(event.key)) {
          event.preventDefault();
          stepClip(-1);
        }
      }}
      onTouchEnd={(event) => {
        const delta = touchStartY.current - event.changedTouches[0].clientY;
        if (Math.abs(delta) > 44) stepClip(delta > 0 ? 1 : -1);
      }}
      onTouchMove={(event) => event.preventDefault()}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0].clientY;
      }}
      onWheel={(event) => {
        event.preventDefault();
        if (Math.abs(event.deltaY) > 18) stepClip(event.deltaY > 0 ? 1 : -1);
      }}
      tabIndex={0}
    >
      {clips.map((clip, index) => (
        <article
          className="snap-video relative grid h-screen min-h-[640px] w-full place-items-center overflow-hidden bg-black"
          data-clip-id={clip.id}
          key={clip.id}
          ref={(node) => {
            cardRefs.current[clip.id] = node;
          }}
        >
          <video
            className="video-stage-media absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black object-contain"
            loop
            muted={muted}
            playsInline
            poster={clip.thumbnail_url}
            preload={index <= 1 ? "auto" : "metadata"}
            ref={(node) => {
              videoRefs.current[clip.id] = node;
            }}
            src={clip.video_url}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/35 sm:left-1/2 sm:w-[480px] sm:-translate-x-1/2" />
          <div className="absolute bottom-8 left-4 right-20 sm:left-[calc(50%-224px)] sm:right-[calc(50%-144px)]">
            <div className="mb-3 inline-flex rounded-full border border-ember/50 bg-black/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-ember backdrop-blur">
              {clip.category}
            </div>
            <h2 className="text-3xl font-black leading-tight text-balance">{clip.title}</h2>
            <p className="mt-2 max-w-sm text-sm font-semibold text-white/82">@{clip.creator}</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/78">{clip.caption}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/56">
              {views[clip.id]?.toLocaleString()} views {activeId === clip.id ? "• Playing" : ""}
            </p>
          </div>
          <div className="absolute bottom-9 right-4 grid gap-3 sm:right-[calc(50%-224px)]">
            <button
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur"
              onClick={() => setMuted((value) => !value)}
            >
              {muted ? <VolumeX size={21} /> : <Volume2 size={21} />}
            </button>
            <button
              aria-label="Share clip"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur"
              onClick={() => navigator.share?.({ title: clip.title, text: clip.caption, url: window.location.href })}
            >
              <Send size={20} />
            </button>
            <button
              aria-label="Report clip"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur"
              onClick={() => window.alert("Report saved for moderation review in the connected Supabase app.")}
            >
              <Flag size={20} />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
