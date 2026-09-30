import { useEffect, useState } from 'react';

export type Route = {
  path: string;
  params: Record<string, string>;
};

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [pathPart, queryPart] = hash.split('?');
  const params: Record<string, string> = {};
  if (queryPart) {
    new URLSearchParams(queryPart).forEach((v, k) => { params[k] = v; });
  }
  return { path: pathPart || '/', params };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    function onChange() {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(path: string) {
  window.location.hash = path;
}

export function linkTo(path: string) {
  return { href: `#${path}` };
}
