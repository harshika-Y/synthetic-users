/**
 * Resolve asset paths taking into account Vite BASE_URL (e.g. /synthetic-users/ on GitHub Pages)
 * Includes cache-busting query parameter to prevent mobile browsers from caching 404s
 */
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  
  let relativePath = path;
  // If path already starts with cleanBase, strip it to avoid duplicates
  if (relativePath.startsWith(cleanBase)) {
    relativePath = relativePath.slice(cleanBase.length);
  } else if (relativePath.startsWith(base)) {
    relativePath = relativePath.slice(base.length);
  } else if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1);
  }
  
  // Cache buster ensures mobile browsers load fresh assets and do not serve cached 404 responses
  const cacheBuster = 'v=kdp-2.2';
  const separator = relativePath.includes('?') ? '&' : '?';
  return `${cleanBase}${relativePath}${separator}${cacheBuster}`;
};

