'use client';

import { useEffect } from 'react';

export default function LeafletCSS() {
  useEffect(() => {
    require('leaflet/dist/leaflet.css');
  }, []);

  return null;
}
