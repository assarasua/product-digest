export const NAV_PREVIOUS_PATH_KEY = "product-digest-nav:previous";
export const NAV_CURRENT_PATH_KEY = "product-digest-nav:current";

export function buildCurrentPath(pathname: string, search: string): string {
  return `${pathname}${search ? `?${search}` : ""}`;
}
