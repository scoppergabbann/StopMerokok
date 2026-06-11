"use client";

import { parseCigaretteBrands } from "@/lib/mvp-store";

type CigaretteBrandInputProps = {
  name?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
};

export function CigaretteBrandInput({
  name = "cigaretteBrand",
  onChange,
  placeholder = "Contoh: Sampoerna Mild, Marlboro, Dji Sam Soe",
  value,
}: CigaretteBrandInputProps) {
  const brands = parseCigaretteBrands(value);

  return (
    <div>
      <input
        className="input"
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
        Kalau ada lebih dari satu, pisahkan dengan koma. Nanti akan tersusun
        rapi sebagai daftar merekmu.
      </p>
      {brands.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.map((brand) => (
            <span
              className="rounded-full bg-[#DFF3E8] px-3 py-1 text-sm font-extrabold text-[#2F7D57]"
              key={brand}
            >
              {brand}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
