"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AvatarCropper } from "./AvatarCropper";

interface AvatarUploadProps {
  value?: string;
  onChange: (avatar: string | undefined) => void;
  fallback: string;
}

export function AvatarUpload({ value, onChange, fallback }: AvatarUploadProps) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => inputRef.current?.click();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setCropSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleConfirm = (cropped: string) => {
    onChange(cropped);
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCancel = () => {
    setCropSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={openFilePicker}
          className="relative group rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {value ? (
            <Image
              src={value}
              alt="Avatar"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover border-4 border-gold/50 group-hover:border-gold transition-colors"
              unoptimized
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/80 to-amber-600 flex items-center justify-center font-bold text-2xl text-pitch-dark border-4 border-dashed border-gold/30 group-hover:border-gold transition-colors">
              {fallback}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 bg-pitch-mid text-sm rounded-full w-8 h-8 flex items-center justify-center border border-white/20">
            📷
          </span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-sm text-white/40 hover:text-red-400 transition-colors"
          >
            Remover foto
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {cropSrc && (
        <AvatarCropper
          imageSrc={cropSrc}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
