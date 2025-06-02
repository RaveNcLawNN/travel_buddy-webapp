//=============================================
// AJAX FETCHES TO BE & EXTERNAL APIs
//=============================================

const API_BASE = '/api';

//=============================================
// HELPER FUNCTION FOR ERROR HANDLING
//=============================================

async function fetchJsonOrThrow(url, options, errorMsg) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${errorMsg}: ${text}`);
  }
  return await res.json();
}

//=============================================
// TRIPS
//=============================================

export async function getAllTrips() {
  return await fetchJsonOrThrow(`${API_BASE}/trips`, {}, 'Failed to fetch trips');
}

export async function getTripById(id) {
  return await fetchJsonOrThrow(`${API_BASE}/trips/${id}`, {}, `Trip not found (id=${id})`);
}

export async function createTrip(payload) {
  return await fetchJsonOrThrow(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to create trip');
}

export async function updateTrip(id, payload) {
  return await fetchJsonOrThrow(`${API_BASE}/trips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to update trip');
}

export async function deleteTrip(id) {
  const res = await fetch(`${API_BASE}/trips/${id}`, {
    method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete trip (id=${id})`);
    }
}

//=============================================
// LOCATIONS
//=============================================

export async function getLocationsByTrip(tripId) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/trips/${tripId}`, {}, `Failed to fetch locations for trip ${tripId}`);
}

export async function createLocation(tripId, payload) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/trips/${tripId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to create location');
}

export async function updateLocation(id, payload) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to update location');
}

export async function deleteLocation(id) {
  const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete location (id=${id})`);
  }
}

//=============================================
// EXTERNAL APIs
//=============================================

export async function searchLocation(query) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/search?query=${encodeURIComponent(query)}`, {}, 'Failed to search location');
}

export async function searchPointsOfInterest({ latitude, longitude, radius = 1000, types = '' }) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    types: Array.isArray(types) ? types.join(',') : types,
  });
  return await fetchJsonOrThrow(`${API_BASE}/locations/poi?${params.toString()}`, {}, 'Failed to fetch POIs');
}