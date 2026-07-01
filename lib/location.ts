// Lightweight location detection util used by signup and header
export type DetectedLocation = {
  display?: string;
  lat?: number | null;
  lon?: number | null;
  source?: 'geolocation' | 'ip' | 'reverse' | 'fallback' | null;
};

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  const key = (process.env.NEXT_PUBLIC_OPENCAGE_KEY || '').trim();
  const q = `${lat},${lon}`;
  if (key) {
    try {
      const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(q)}&key=${key}&no_annotations=1&language=en`);
      if (res.ok) {
        const j = await res.json();
        if (j && Array.isArray(j.results) && j.results.length) {
          const comp = j.results[0].components || {};
          const city = comp.city || comp.town || comp.village || comp.suburb || comp.county || comp.state;
          if (city) return city;
          if (j.results[0].formatted) return j.results[0].formatted;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Nominatim fallback
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state;
      return city || data.display_name || null;
    }
  } catch (e) {}
  return null;
}

export default async function detectUserLocation(timeoutMs = 7000): Promise<DetectedLocation> {
  // Try browser geolocation first
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
        navigator.geolocation.getCurrentPosition((p) => { clearTimeout(timer); resolve(p); }, (err) => { clearTimeout(timer); reject(err); }, { timeout: timeoutMs });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const display = await reverseGeocode(lat, lon);
      return { display: display || `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon, source: 'geolocation' };
    } catch (e) {
      // fall through to IP method
    }
  }

  // IP fallback using ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      const lat = data.latitude || data.lat || null;
      const lon = data.longitude || data.lon || null;
      if (lat && lon) {
        try {
          const display = await reverseGeocode(lat, lon);
          if (display) return { display, lat: Number(lat), lon: Number(lon), source: 'ip' };
        } catch (e) {}
      }
      const city = data.city || data.region || data.country_name || null;
      if (city) return { display: city, lat: lat ? Number(lat) : null, lon: lon ? Number(lon) : null, source: 'ip' };
    }
  } catch (e) {
    // ignore
  }

  return { display: undefined, source: null };
}
