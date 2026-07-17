import logoAsset from "@/assets/lurea-logo.asset.json";

export function LureaLogo({ className = "h-16 w-16", alt = "LUREA" }: { className?: string; alt?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt={alt}
      className={`${className} rounded-full object-contain drop-shadow-[0_8px_24px_rgba(217,163,143,0.4)]`}
      loading="eager"
    />
  );
}
