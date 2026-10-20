"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { notifyError } from "@/lib/notify";
import type { PublicationKind } from "@/lib/types";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  kind: PublicationKind;
  slug: string;
  likeCount: number;
  likedByMe: boolean;
  isMine: boolean;
}

type LikeState = { likeCount: number; likedByMe: boolean };

export function LikeButton({
  kind,
  slug,
  likeCount,
  likedByMe,
  isMine,
}: LikeButtonProps) {
  const [state, setState] = useState<LikeState>({ likeCount, likedByMe });
  const [pending, setPending] = useState(false);

  const label = `${state.likeCount} me gusta`;

  if (isMine) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Heart className="w-4 h-4" aria-hidden />
        {label}
      </span>
    );
  }

  const toggle = async () => {
    if (pending) return;
    const previous = state;
    const liked = !previous.likedByMe;
    setState({
      likedByMe: liked,
      likeCount: previous.likeCount + (liked ? 1 : -1),
    });
    setPending(true);
    try {
      const endpoint = routes.api.explore.like(kind, slug);
      setState(
        liked
          ? await api.put<LikeState>(endpoint)
          : await api.delete<LikeState>(endpoint),
      );
    } catch (e) {
      console.error("Error toggling like:", e);
      setState(previous);
      notifyError("No se pudo guardar tu me gusta");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={state.likedByMe}
      aria-label={state.likedByMe ? "Quitar me gusta" : "Me gusta"}
      className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-bold transition-all active:scale-90 ${
        state.likedByMe
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-input text-muted-foreground hover:text-foreground"
      }`}
    >
      <Heart
        key={String(state.likedByMe)}
        className={`w-4 h-4 ${state.likedByMe ? "fill-current animate-pop" : ""}`}
        aria-hidden
      />
      {label}
    </button>
  );
}
