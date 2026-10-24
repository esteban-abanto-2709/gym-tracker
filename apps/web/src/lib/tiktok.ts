function tiktokWebUrl(query: string) {
  return `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
}

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function openTikTok(query: string) {
  const web = tiktokWebUrl(query);

  if (isIOS()) {
    window.location.href = `snssdk1233://search?keyword=${encodeURIComponent(query)}`;
    return;
  }

  if (/Android/i.test(navigator.userAgent)) {
    window.location.href = `intent://search?keyword=${encodeURIComponent(query)}#Intent;scheme=snssdk1233;package=com.zhiliaoapp.musically;end`;
    return;
  }

  window.open(web, "_blank", "noopener,noreferrer");
}
