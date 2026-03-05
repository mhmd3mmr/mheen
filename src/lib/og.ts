function toOgKeyOrPath(input: string) {
  const collapsed = input
    .replace(/-og(-og)+/gi, "-og")
    .replace(/\.(webp|png|jpe?g)(?=-og\.)/gi, "")
    .trim();

  if (/-og\.jpg$/i.test(collapsed)) return collapsed;
  if (/-og\.(webp|png|jpe?g)$/i.test(collapsed)) {
    return collapsed.replace(/-og\.(webp|png|jpe?g)$/i, "-og.jpg");
  }
  if (/\.(webp|png|jpe?g)$/i.test(collapsed)) {
    return collapsed.replace(/\.(webp|png|jpe?g)$/i, "-og.jpg");
  }
  return `${collapsed}-og.jpg`;
}

export function toOgVariantUrl(mainImageUrl: string) {
  try {
    const url = new URL(mainImageUrl);
    const key = url.searchParams.get("key");
    if (key) {
      url.searchParams.set("key", toOgKeyOrPath(key));
      return url.toString();
    }
    url.pathname = toOgKeyOrPath(url.pathname);
    return url.toString();
  } catch {
    return toOgKeyOrPath(mainImageUrl);
  }
}

