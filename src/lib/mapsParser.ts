// Utility functions to parse Google Maps links and extract location data

export interface ParsedMapData {
  lat: number
  lng: number
  name?: string
  address?: string
  placeId?: string
}

/**
 * Extracts coordinates from various Google Maps URL formats
 * Supports:
 * - https://maps.google.com/?q=12.9716,77.5946
 * - https://www.google.com/maps/place/12.9716,77.5946
 * - https://www.google.com/maps/@12.9716,77.5946,15z
 * - https://maps.app.goo.gl/xxx (shortened URLs)
 * - https://www.google.com/maps/place/Name/@12.9716,77.5946
 */
export function parseGoogleMapsLink(url: string): ParsedMapData | null {
  try {
    // Handle different URL formats
    
    // Format 1: ?q=lat,lng or ?q=name
    const qMatch = url.match(/[?&]q=([^&]+)/)
    if (qMatch) {
      const coords = qMatch[1].split(',')
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0])
        const lng = parseFloat(coords[1])
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng }
        }
      }
    }

    // Format 2: @lat,lng,zoom
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      }
    }

    // Format 3: /place/Name/@lat,lng
    const placeMatch = url.match(/\/place\/([^/]+)\/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (placeMatch) {
      const name = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
      return {
        lat: parseFloat(placeMatch[2]),
        lng: parseFloat(placeMatch[3]),
        name: name
      }
    }

    // Format 4: /maps/place/lat,lng
    const coordsMatch = url.match(/\/place\/(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (coordsMatch) {
      return {
        lat: parseFloat(coordsMatch[1]),
        lng: parseFloat(coordsMatch[2])
      }
    }

    // Format 5: data parameter in URL
    const dataMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (dataMatch) {
      return {
        lat: parseFloat(dataMatch[1]),
        lng: parseFloat(dataMatch[2])
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing Google Maps link:', error)
    return null
  }
}

/**
 * Fetches place details using coordinates via reverse geocoding
 * Note: In production, you'd want to use Google Places API properly
 * This is a simplified version using Nominatim (OpenStreetMap)
 */
export async function getPlaceDetailsFromCoords(
  lat: number,
  lng: number
): Promise<{ name?: string; address?: string }> {
  try {
    // Using Nominatim for reverse geocoding (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ConnectBLR/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch place details')
    }

    const data = await response.json()
    
    return {
      name: data.name || data.display_name?.split(',')[0] || undefined,
      address: data.display_name || undefined
    }
  } catch (error) {
    console.error('Error fetching place details:', error)
    return {}
  }
}

/**
 * Main function to process a Google Maps link
 * Returns all available data including coordinates and place details
 */
export async function processMapLink(url: string): Promise<ParsedMapData | null> {
  const parsed = parseGoogleMapsLink(url)
  if (!parsed) return null

  // Try to get additional details if we only have coordinates
  if (!parsed.name || !parsed.address) {
    try {
      const details = await getPlaceDetailsFromCoords(parsed.lat, parsed.lng)
      return {
        ...parsed,
        name: parsed.name || details.name,
        address: parsed.address || details.address
      }
    } catch (error) {
      console.error('Could not fetch additional details:', error)
      return parsed
    }
  }

  return parsed
}

/**
 * Validates if a string looks like a Google Maps URL
 */
export function isGoogleMapsLink(text: string): boolean {
  return /^https?:\/\/(www\.)?(google\.(com|co\.\w+)|maps\.app\.goo\.gl|goo\.gl)\/maps/i.test(text) ||
         /^https?:\/\/maps\.google/i.test(text)
}
