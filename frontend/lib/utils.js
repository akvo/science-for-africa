import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  if (!num) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFullFileUrl(url) {
  if (!url) return null;
  if (url.startsWith("data:")) {
    return url;
  }

  const backendOrigin = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:1337/api"
  ).replace(/\/api\/?$/, "");

  let path = url;

  if (url.startsWith("http")) {
    // If it's the backend URL, strip the origin to make it relative
    // This allows it to respect the frontend URL via Next.js rewrites
    if (url.startsWith(backendOrigin)) {
      path = url.replace(backendOrigin, "");
    } else if (url.startsWith("http://localhost:1337")) {
      // Fallback for default local Strapi if different from env var
      path = url.replace("http://localhost:1337", "");
    } else {
      // It's an external URL (e.g. S3 or external CDN), leave as is
      return url;
    }
  }

  // Ensure leading slash for the relative path
  return path.startsWith("/") ? path : `/${path}`;
}

export async function downloadFile(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || url.split("/").pop();
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (error) {
    console.error("Download failed, opening in new tab", error);
    window.open(url, "_blank");
  }
}

export function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
