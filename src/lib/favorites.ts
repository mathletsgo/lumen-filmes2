import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { toggleDbFavorite, syncUserFavorites } from "@/services/dbService";

const KEY = "lumen_favorites_v2";

export interface FavoriteItem {
  id: string;
  type: "movie" | "tv";
}

function readLocal(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLocal(items: FavoriteItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function useFavorites() {
  const { user, requireAuth } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const toggleDbFavFn = useServerFn(toggleDbFavorite);
  const syncDbFavFn = useServerFn(syncUserFavorites);

  const loadLocal = useCallback(() => {
    setItems(readLocal());
  }, []);

  // Synchronization on session changes
  useEffect(() => {
    let active = true;
    if (user) {
      const local = readLocal();
      syncDbFavFn({ data: { userEmail: user.email, items: local } })
        .then((res) => {
          if (active && res.success) {
            const mapped = res.favorites.map((f: any) => ({
              id: f.mediaId,
              type: f.mediaType as "movie" | "tv",
            }));
            writeLocal(mapped);
            setItems(mapped);
          }
        })
        .catch(console.error);
    } else {
      loadLocal();
    }

    const channel = new BroadcastChannel("lumen_favorites_channel");
    const handleChannelMessage = () => {
      loadLocal();
    };
    channel.addEventListener("message", handleChannelMessage);

    const handleStorageEvent = () => {
      loadLocal();
    };
    window.addEventListener("favorites-changed", handleStorageEvent);

    return () => {
      active = false;
      channel.removeEventListener("message", handleChannelMessage);
      channel.close();
      window.removeEventListener("favorites-changed", handleStorageEvent);
    };
  }, [user, syncDbFavFn, loadLocal]);

  const toggle = useCallback((id: string, type: "movie" | "tv") => {
    requireAuth(async () => {
      // Guaranteed to have a logged-in user at this point
      const savedUser = localStorage.getItem("lumen_user_session");
      const currentUser = user || (savedUser ? JSON.parse(savedUser) : null);
      if (!currentUser) return;

      try {
        const res = await toggleDbFavFn({
          data: { mediaId: id, mediaType: type, userEmail: currentUser.email },
        });

        if (res.success) {
          const current = readLocal();
          const exists = current.some((x) => x.id === id && x.type === type);
          const next = exists
            ? current.filter((x) => !(x.id === id && x.type === type))
            : [...current, { id, type }];

          writeLocal(next);
          setItems(next);

          // Dispatch cross-tab
          const channel = new BroadcastChannel("lumen_favorites_channel");
          channel.postMessage("changed");
          channel.close();

          window.dispatchEvent(new Event("favorites-changed"));
        }
      } catch (err) {
        console.error("Erro ao favoritar no servidor:", err);
      }
    });
  }, [user, requireAuth, toggleDbFavFn]);

  const has = useCallback(
    (id: string, type: "movie" | "tv") => {
      return items.some((x) => x.id === id && x.type === type);
    },
    [items],
  );

  return { items, toggle, has };
}
