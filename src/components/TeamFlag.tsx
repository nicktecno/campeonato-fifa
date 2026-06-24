import Image from "next/image";
import { Team } from "@/lib/types";

interface TeamFlagProps {
  team: Team;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: { px: 16, class: "w-4 h-4" },
  sm: { px: 20, class: "w-5 h-5" },
  md: { px: 28, class: "w-7 h-7" },
  lg: { px: 40, class: "w-10 h-10" },
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
