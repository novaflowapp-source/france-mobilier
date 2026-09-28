"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { IconArrow } from "@/components/icons";

const AUTOPLAY_MS = 4500;

export function ProductGallery({
  images,
  name,
  index,
  onIndexChange,
  autoplayIndexes,
}: {
  images: string[];
  name: string;
  index: number;
  onIndexChange: (index: number) => void;
  autoplayIndexes?: number[];
}) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const thumbsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [canHover, setCanHover] = useState(false);
  const current = images[index] ?? images[0];
  const hasMany = images.length > 1;
  const sequence = useMemo(
    () => (autoplayIndexes?.length ? autoplayIndexes : images.map((_, imageIndex) => imageIndex)),
    [autoplayIndexes, images],
  );

  const go = useCallback(
    (next: number) => {
      if (images.length === 0) return;
      onIndexChange((next + images.length) % images.length);
    },
    [images.length, onIndexChange],
  );

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const thumb = thumbsRef.current[index];
    const row = thumb?.parentElement;
    if (!thumb || !row) return;
    const left = thumb.offsetLeft - row.clientWidth / 2 + thumb.clientWidth / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    if (!hasMany || paused || !inView || !canHover || sequence.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const position = sequence.indexOf(index);
      const next = sequence[(position >= 0 ? position + 1 : 0) % sequence.length];
      onIndexChange(next);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [canHover, hasMany, index, inView, onIndexChange, paused, sequence]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
    startY.current = event.clientY;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current == null || startY.current == null || !hasMany) return;
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    startX.current = null;
    startY.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dy) >= Math.abs(dx)) return;
    go(dx > 0 ? index - 1 : index + 1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!hasMany) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(index + 1);
    }
  }

  if (!current) return null;

  return (
    <div className="product-gallery w-full min-w-0 max-w-full">
      <div
        ref={frameRef}
        className="product-gallery-frame group rounded-[var(--radius)] bg-white"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startX.current = null;
          startY.current = null;
        }}
        onPointerEnter={() => {
          if (canHover) setPaused(true);
        }}
        onPointerLeave={() => {
          if (canHover) setPaused(false);
        }}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={onKeyDown}
        tabIndex={hasMany ? 0 : undefined}
        role={hasMany ? "region" : undefined}
        aria-roledescription={hasMany ? "carrousel" : undefined}
        aria-label={hasMany ? `Photos de ${name}` : undefined}
      >
        <div
          className="product-gallery-track motion-reduce:!transition-none"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {images.map((src, imageIndex) => (
            <div key={`${src}-${imageIndex}`} className="product-gallery-slide">
              <Image
                src={src}
                alt={`${name} — image ${imageIndex + 1}`}
                fill
                className={`object-cover select-none ${canHover ? "transition-transform duration-500 md:group-hover:scale-[1.06]" : ""}`}
                priority={imageIndex === 0}
                sizes="(max-width:768px) 100vw, 50vw"
                draggable={false}
              />
            </div>
          ))}
        </div>
        {hasMany ? (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm"
              aria-label="Previous photo"
              onClick={(event) => {
                event.stopPropagation();
                go(index - 1);
              }}
            >
              <IconArrow className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-sm"
              aria-label="Next photo"
              onClick={(event) => {
                event.stopPropagation();
                go(index + 1);
              }}
            >
              <IconArrow className="h-5 w-5" />
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-navy/80 px-2.5 py-1 text-xs text-white">
              {index + 1}/{images.length}
            </p>
          </>
        ) : null}
      </div>
      {hasMany ? (
        <div className="mt-3 flex gap-2 overflow-x-auto overscroll-x-contain p-1.5">
          {images.map((src, imageIndex) => {
            const selected = imageIndex === index;
            return (
              <button
                key={`${src}-${imageIndex}`}
                ref={(node) => {
                  thumbsRef.current[imageIndex] = node;
                }}
                type="button"
                onClick={() => onIndexChange(imageIndex)}
                aria-label={`View image ${imageIndex + 1}`}
                aria-current={selected ? "true" : undefined}
                className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-md bg-white sm:w-[4.5rem] ${
                  selected ? "ring-2 ring-navy ring-offset-2 ring-offset-white" : "ring-1 ring-border"
                }`}
              >
                <Image src={src} alt="" fill className="object-contain" sizes="72px" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
