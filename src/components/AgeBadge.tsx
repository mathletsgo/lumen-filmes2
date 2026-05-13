import type { CertificationCode } from "@/services/api/certifications";

interface Props {
  code: CertificationCode | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const STYLES: Record<string, { bg: string; label: string; ring: string }> = {
  L: { bg: "bg-emerald-500", label: "L", ring: "ring-emerald-300/30" },
  "10": { bg: "bg-sky-500", label: "10", ring: "ring-sky-300/30" },
  "12": { bg: "bg-amber-500", label: "12", ring: "ring-amber-300/30" },
  "14": { bg: "bg-orange-500", label: "14", ring: "ring-orange-300/30" },
  "16": { bg: "bg-rose-600", label: "16", ring: "ring-rose-300/30" },
  "18": { bg: "bg-zinc-900", label: "18", ring: "ring-zinc-100/20" },
};

const SIZES = {
  xs: "w-5 h-5 text-[8px] rounded-[4px]",
  sm: "w-7 h-7 text-[10px] rounded-md",
  md: "w-9 h-9 text-xs rounded-lg",
  lg: "w-12 h-12 text-base rounded-xl",
};

export function AgeBadge({ code, size = "md", className = "" }: Props) {
  if (!code) return null;
  const style = STYLES[code] ?? {
    bg: "bg-muted-foreground/40",
    label: code,
    ring: "ring-foreground/10",
  };
  return (
    <span
      title={
        code === "L"
          ? "Livre para todos os públicos"
          : `Não recomendado para menores de ${code} anos`
      }
      aria-label={`Classificação indicativa ${style.label}`}
      className={`inline-grid place-items-center font-black tracking-tight text-white shadow-md ring-1 ring-inset ${style.ring} ${style.bg} ${SIZES[size]} ${className}`}
    >
      {style.label}
    </span>
  );
}
