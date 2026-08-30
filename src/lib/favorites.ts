import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { toggleDbFavorite, syncUserFavorites } from "@/services/dbService";

const KEY = "lumen_favorites_v2";
const CHANNEL_NAME = "lumen_favorites_channel";

export interface FavoriteItem {
  id: string;
  type: "movie" | "tv";
}

function readLocal(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      id: String(item.id),
      type: item.type === "tv" ? "tv" : "movie",
    }));
  } catch {
    return [];
  }
}

function writeLocal(items: FavoriteItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (err) {
    console.error("Erro ao salvar favoritos no localStorage:", err);
  }
}

function notifyChange() {
  if (typeof window === "undefined") return;
  
  // Local window event
  window.dispatchEvent(new Event("favorites-changed"));

  // Cross-tab BroadcastChannel
  if ("BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage("changed");
      channel.close();
    } catch {
      // Fallback handled by 'storage' event listener
    }
  }
}

export function useFavorites() {
  const { user, requireAuth } = useAuth();
  const [items, setItems] = useState<FavoriteItem[]>(readLocal);
  const toggleDbFavFn = useServerFn(toggleDbFavorite);
  const syncDbFavFn = useServerFn(syncUserFavorites);

  const syncedUserEmailRef = useRef<string | null>(null);

  const loadLocal = useCallback(() => {
    setItems(readLocal());
  }, []);

  // Listen to cross-tab & local favorite changes
  useEffect(() => {
    loadLocal();

    const handleUpdate = () => {
      loadLocal();
    };

    // 1. Listen for same-window custom events
    window.addEventListener("favorites-changed", handleUpdate);

    // 2. Listen for native storage changes across browser windows/tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        loadLocal();
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Listen for BroadcastChannel messages across tabs
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener("message", handleUpdate);
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    return () => {
      window.removeEventListener("favorites-changed", handleUpdate);
      window.removeEventListener("storage", handleStorage);
      if (channel) {
        channel.removeEventListener("message", handleUpdate);
        channel.close();
      }
    };
  }, [loadLocal]);

  // Sync session favorites when user logs in or switches account
  useEffect(() => {
    let active = true;
    const userEmail = user?.email;

    if (userEmail && syncedUserEmailRef.current !== userEmail) {
      syncedUserEmailRef.current = userEmail;
      const local = readLocal();
      const payloadItems = local.map((x) => ({ mediaId: x.id, mediaType: x.type }));
      syncDbFavFn({ data: { userEmail, items: payloadItems } })
        .then((res) => {
          if (active && res?.success && Array.isArray(res.favorites)) {
            const mapped: FavoriteItem[] = res.favorites.map((f: any) => ({
              id: String(f.mediaId),
              type: f.mediaType === "tv" ? "tv" : "movie",
            }));
            writeLocal(mapped);
            setItems(mapped);
            notifyChange();
          }
        })
        .catch((err) => {
          console.error("Erro ao sincronizar favoritos do usuário:", err);
        });
    }

    return () => {
      active = false;
    };
  }, [user?.email, syncDbFavFn]);

  // Optimistic Toggle with instant UI update & server background sync/rollback
  const toggle = useCallback(
    (id: string | number, type: "movie" | "tv") => {
      const mediaId = String(id);

      // Instant optimistic local update
      const previous = readLocal();
      const exists = previous.some((x) => x.id === mediaId && x.type === type);
      const next = exists
        ? previous.filter((x) => !(x.id === mediaId && x.type === type))
        : [...previous, { id: mediaId, type }];

      writeLocal(next);
      setItems(next);
      notifyChange();

      // Async backend sync if authenticated
      requireAuth(async () => {
        const savedUser = localStorage.getItem("lumen_user_session");
        const currentUser = user || (savedUser ? JSON.parse(savedUser) : null);
        if (!currentUser?.email) return;

        try {
          const res = await toggleDbFavFn({
            data: { mediaId, mediaType: type, userEmail: currentUser.email },
          });

          if (!res?.success) {
            // Revert state on server failure
            writeLocal(previous);
            setItems(previous);
            notifyChange();
          }
        } catch (err) {
          console.error("Erro ao sincronizar alteração de favorito no servidor:", err);
          // Revert state on network/server exception
          writeLocal(previous);
          setItems(previous);
          notifyChange();
        }
      });
    },
    [user, requireAuth, toggleDbFavFn],
  );

  const has = useCallback(
    (id: string | number, type: "movie" | "tv") => {
      const mediaId = String(id);
      return items.some((x) => x.id === mediaId && x.type === type);
    },
    [items],
  );

  return { items, toggle, has };
}

