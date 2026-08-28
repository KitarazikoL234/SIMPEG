import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // 1. Forward Geocoding Search (by query keyword)
    if (q) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&countrycodes=id`,
        {
          headers: {
            'User-Agent': 'SIMPEG-STIKES-Baktara/1.0 (Admin Kepegawaian)',
            'Accept-Language': 'id,en;q=0.9',
          },
        }
      );

      if (!res.ok) {
        return NextResponse.json({ success: false, error: 'Gagal mencari lokasi' }, { status: 500 });
      }

      const list = await res.json();
      const results = list.map((item: any) => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        type: item.type,
      }));

      return NextResponse.json({ success: true, data: results });
    }

    // 2. IP-based Geolocation fallback (when no coords provided, for initial guess)
    if (!lat && !lng) {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            return NextResponse.json({
              success: true,
              fromIP: true,
              lat: ipData.latitude,
              lng: ipData.longitude,
              city: ipData.city,
              region: ipData.region,
              address: `${ipData.city || ''}, ${ipData.region || ''}, ${ipData.country_name || 'Indonesia'}`.replace(/^,\s*/, ''),
            });
          }
        }
      } catch (e) { /* ignore IP fallback errors */ }
      return NextResponse.json({ success: false, error: 'Parameter lat dan lng atau q diperlukan' }, { status: 400 });
    }

    // 3. Reverse Geocoding (by coordinates)
    const latitude = parseFloat(lat!);
    const longitude = parseFloat(lng!);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ success: false, error: 'Koordinat tidak valid' }, { status: 400 });
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SIMPEG-STIKES-Baktara/1.0 (Admin Kepegawaian)',
          'Accept-Language': 'id,en;q=0.9',
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        address: `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        isFallback: true
      });
    }

    const data = await res.json();
    const addr = data.address || {};

    const parts: string[] = [];
    
    const poi = addr.building || addr.amenity || addr.school || addr.hospital || addr.office || addr.university || addr.college || addr.shop;
    if (poi) parts.push(poi);

    const road = addr.road || addr.pedestrian || addr.street || addr.path;
    const houseNumber = addr.house_number ? `No. ${addr.house_number}` : '';
    if (road) parts.push(`${road}${houseNumber ? ' ' + houseNumber : ''}`.trim());

    const subDistrict = addr.suburb || addr.village || addr.neighbourhood || addr.quarter || addr.hamlet;
    if (subDistrict) parts.push(subDistrict);

    const district = addr.city_district || addr.municipality || addr.district || addr.subdistrict;
    if (district && district !== subDistrict) parts.push(district);

    const city = addr.city || addr.regency || addr.town || addr.county;
    if (city) parts.push(city);

    const state = addr.state || addr.province;
    if (state && state !== city) parts.push(state);

    const formattedAddress = parts.length > 0 
      ? parts.join(', ')
      : (data.display_name || `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);

    return NextResponse.json({
      success: true,
      address: formattedAddress,
      display_name: data.display_name,
      details: addr,
      lat: latitude,
      lng: longitude
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      address: `Lokasi Terdeteksi`,
      error: error.message
    });
  }
}
