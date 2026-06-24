import Image from "next/image";
import { Team } from "@/lib/types";

interface TeamFlagProps {
  team: Team;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: { px: 20, class: "w-5 h-5" },
  sm: { px: 24, class: "w-6 h-6" },
  md: { px: 32, class: "w-8 h-8" },
  lg: { px: 48, class: "w-12 h-12" },
};

export function TeamFlag({ team, size = "sm", className = "" }: TeamFlagProps) {
  const { px, class: sizeClass } = sizeMap[size];

  return (
    <Image
      src={team.flag}
      alt={team.name}
      width={px}
      height={px}
      className={`${sizeClass} object-contain shrink-0 ${className}`}
      title={team.name}
      unoptimized
    />
  );
}
