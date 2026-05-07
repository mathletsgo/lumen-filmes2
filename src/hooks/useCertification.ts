import { useQuery } from "@tanstack/react-query";
import { getCertification } from "@/services/api/certifications";

export function useCertification(id: string | number | undefined | null) {
  return useQuery({
    queryKey: ["tmdb", "certification", String(id)],
    queryFn: () => getCertification(id as string | number),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 1000 * 60 * 60, // 1h — certifications rarely change
  });
}
