'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, Building, Check, ExternalLink, RefreshCw, Crosshair, Map, Sparkles } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues in Next.js/Webpack
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const QUICK_CITIES = [
  { name: 'Gorontalo', lat: 0.5401, lng: 123.0594 },
  { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
  { name: 'Manado', lat: 1.4748, lng: 124.8428 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Medan', lat: 3.5952, lng: 98.6722 },
];

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  address?: string;
  onLocationSelect: (lat: number, lng: number, addressText: string) => void;
  onClose?: () => void;
}

export default function MapLocationPicker({
  initialLat = 0.5401,
  initialLng = 123.0594,
  address = '',
  onLocationSelect,
  onClose
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng
  });
  const [currentAddress, setCurrentAddress] = useState<string>(address);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [saveDefaultMessage, setSaveDefaultMessage] = useState(false);

  // Reverse Geocoding Helper
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data.success && data.address) {
        setCurrentAddress(data.address);
        onLocationSelect(lat, lng, data.address);
      } else {
        const fallback = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setCurrentAddress(fallback);
        onLocationSelect(lat, lng, fallback);
      }
    } catch (e) {
      const fallback = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      setCurrentAddress(fallback);
      onLocationSelect(lat, lng, fallback);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Move marker & pan map
  const updateMapPosition = (lat: number, lng: number, shouldGeocode = true, zoomLevel = 17) => {
    setCurrentCoords({ lat, lng });
    setPasteInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoomLevel, { animate: true });
    }

    if (shouldGeocode) {
      reverseGeocode(lat, lng);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: defaultIcon,
      draggable: true,
      autoPan: true
    }).addTo(map);

    marker.bindPopup('<b>Geser pin</b> ke titik lokasi Anda yang tepat.').openPopup();

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updateMapPosition(pos.lat, pos.lng, true);
    });

    map.on('click', (e) => {
      updateMapPosition(e.latlng.lat, e.latlng.lng, true);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Search places via OpenStreetMap Nominatim
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setSearchResults(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle GPS Auto-detect
  const handleGPSDetect = () => {
    if (!navigator.geolocation) return;
    setIsLoadingAddress(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMapPosition(pos.coords.latitude, pos.coords.longitude, true, 18);
      },
      (err) => {
        setIsLoadingAddress(false);
        alert('Gagal mendeteksi lokasi GPS browser. Silakan klik atau cari lokasi pada peta.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Parse pasted coordinates or Google Maps link
  const handleApplyPastedCoordinates = () => {
    if (!pasteInput.trim()) return;
    
    // Check if format is "lat, lng" (e.g. 0.540123, 123.059412 or -7.9782, 112.6321)
    const matchCoords = pasteInput.match(/([-+]?\d{1,3}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)/);
    if (matchCoords) {
      const lat = parseFloat(matchCoords[1]);
      const lng = parseFloat(matchCoords[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        updateMapPosition(lat, lng, true, 18);
        setShowManualInput(false);
        return;
      }
    }

    // Check if Google Maps URL (e.g. @0.5401,123.0594 or q=0.5401,123.0594)
    const matchUrl = pasteInput.match(/@([-+]?\d+\.\d+),([-+]?\d+\.\d+)/) || pasteInput.match(/q=([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
    if (matchUrl) {
      const lat = parseFloat(matchUrl[1]);
      const lng = parseFloat(matchUrl[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        updateMapPosition(lat, lng, true, 18);
        setShowManualInput(false);
        return;
      }
    }

    alert('Format koordinat tidak terbaca. Contoh format yang benar: -7.97821, 112.63212 atau 0.54012, 123.05941');
  };

  // Save current location as user's default in localStorage
  const handleSaveAsDefault = () => {
    localStorage.setItem('simpeg_default_lat', currentCoords.lat.toString());
    localStorage.setItem('simpeg_default_lng', currentCoords.lng.toString());
    localStorage.setItem('simpeg_default_address', currentAddress);
    setSaveDefaultMessage(true);
    setTimeout(() => setSaveDefaultMessage(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-blue-400 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 p-4 sm:p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Pilih Titik Lokasi Presisi di Peta</h3>
            <p className="text-xs text-blue-100">Geser pin merah atau klik peta tepat pada posisi Anda.</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            Tutup Peta
          </button>
        )}
      </div>

      {/* Quick City Jump Shortcuts */}
      <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="font-bold text-slate-500 shrink-0 px-2 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Lompat Kota:
        </span>
        {QUICK_CITIES.map((city) => (
          <button
            key={city.name}
            onClick={() => updateMapPosition(city.lat, city.lng, true, 15)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold rounded-lg border border-slate-300 shrink-0 transition-colors shadow-2xs"
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Action Toolbar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGPSDetect}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            title="Deteksi ulang GPS browser"
          >
            <Navigation className="w-4 h-4" /> Deteksi GPS Saya
          </button>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 shadow-sm transition-all"
          >
            <Crosshair className="w-4 h-4 text-amber-600" /> Tempel Koordinat (Lat, Lng)
          </button>
        </div>

        <button
          onClick={handleSaveAsDefault}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-all"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          {saveDefaultMessage ? '✓ Titik Ini Tersimpan Sebagai Default!' : 'Simpan Titik Ini Sebagai Default'}
        </button>
      </div>

      {/* Manual Coordinates / Google Maps Paste Input */}
      {showManualInput && (
        <div className="p-3.5 bg-amber-50/80 border-b border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in">
          <span className="text-xs font-bold text-amber-900 shrink-0">Tempel Koordinat Google Maps:</span>
          <input 
            type="text" 
            value={pasteInput} 
            onChange={(e) => setPasteInput(e.target.value)} 
            placeholder="Contoh: -7.9782, 112.6321 atau link Google Maps" 
            className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-amber-500" 
          />
          <button 
            onClick={handleApplyPastedCoordinates}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Terapkan Koordinat
          </button>
        </div>
      )}

      {/* Location Search Bar */}
      <div className="p-3 bg-white border-b border-slate-200 relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari jalan, kelurahan, kecamatan, kampus, atau gedung di Indonesia..."
              className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
            />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Mencari...' : 'Cari Lokasi'}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 z-[1000] bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-100">
            {searchResults.map((item, index) => (
              <div 
                key={index}
                onClick={() => {
                  updateMapPosition(item.lat, item.lng, true, 17);
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="p-3 hover:bg-blue-50 cursor-pointer text-xs transition-colors"
              >
                <p className="font-bold text-slate-900 line-clamp-1">{item.display_name}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Lat: {item.lat.toFixed(5)}, Lng: {item.lng.toFixed(5)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Container */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
        
        {/* Floating live coordinates indicator */}
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-300 shadow-lg text-xs font-mono font-bold text-slate-800">
          📍 Lat: {currentCoords.lat.toFixed(6)}, Lng: {currentCoords.lng.toFixed(6)}
        </div>
      </div>

      {/* Address Resolution Bar at Bottom */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" /> Alamat Terpilih dari Titik Peta:
          </p>
          {isLoadingAddress ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Memproses nama jalan & alamat...</span>
            </div>
          ) : (
            <p className="text-sm font-extrabold text-slate-900 leading-snug">{currentAddress || 'Lokasi Terpilih'}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm"
          >
            Google Maps <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => {
              onLocationSelect(currentCoords.lat, currentCoords.lng, currentAddress);
              if (onClose) onClose();
            }}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Kunci Titik Ini
          </button>
        </div>
      </div>
    </div>
  );
}
