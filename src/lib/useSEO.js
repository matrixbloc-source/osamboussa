import { useEffect } from 'react';

export default function useSEO({ title, description, og = {} } = {}) {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const setMeta = (name, content, isProp = false) => {
      if (!content) return;
      const attr = isProp ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('description', description);
    setMeta('og:title', og.title || title, true);
    setMeta('og:description', og.description || description, true);
    if (og.image) setMeta('og:image', og.image, true);

    return () => {
      document.title = prevTitle;
    };
  }, [title, description]); // eslint-disable-line react-hooks/exhaustive-deps
}
