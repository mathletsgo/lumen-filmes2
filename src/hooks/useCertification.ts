import { useQuery } from "@tanstack/react-query";
import { getCertification, getTVCertification } from "@/services/api/certifications";

export function useCertification(id: string | number | undefined | null, type: "movie" | "tv" = "movie") {
  return useQuery({
    queryKey: ["tmdb", "certification", type, String(id)],
    queryFn: () => type === "movie" ? getCertification(id as string | number) : getTVCertification(id as string | number),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 1000 * 60 * 60, // 1h — certifications rarely change
  });
}
