export function getLocale() {
  return typeof navigator !== "undefined" ? navigator.language : "en-US";
}
