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

  // Parse only if body !empty
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

//=============================================
// TRIPS
//=============================================

// Fetch all trips
export async function getAllTrips() {
  return await fetchJsonOrThrow(`${API_BASE}/trips`, {}, 'Failed to fetch trips');
}

// Fetch a specific trip by ID
export async function getTripById(id) {
  return await fetchJsonOrThrow(`${API_BASE}/trips/${id}`, {}, `Trip not found (id=${id})`);
}

// Create a new trip
export async function createTrip(payload) {
  return await fetchJsonOrThrow(`${API_BASE}/trips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to create trip');
}

// Update an existing trip
export async function updateTrip(id, payload) {
  return await fetchJsonOrThrow(`${API_BASE}/trips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to update trip');
}

// Delete a trip
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

// Get all locations associated with a specific trip
export async function getLocationsByTrip(tripId) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/trips/${tripId}`, {}, `Failed to fetch locations for trip ${tripId}`);
}

// Add a new location to a trip
export async function createLocation(tripId, payload) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/trips/${tripId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to create location');
}

// Update an existing location
export async function updateLocation(id, payload) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }, 'Failed to update location');
}

// Delete a specific location
export async function deleteLocation(id) {
  const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete location (id=${id})`);
  }
}

//=============================================
// USER & PARTICIPANT ENDPOINTS
//=============================================

// Get user details by username
export async function getUserByUsername(username) {
  return await fetchJsonOrThrow(`/api/users/${username}`, {}, `User not found (${username})`);
}

// Get buddy list for a specific user
export async function getBuddiesForUser(username) {
  return await fetchJsonOrThrow(`/api/users/${username}/buddies`, {}, `Failed to fetch buddies for user ${username}`);
}

// Remove a user from a trip's participant list
export async function removeParticipantFromTrip(tripId, userId) {
  return await fetchJsonOrThrow(`/api/trips/${tripId}/participants/${userId}`, {
    method: 'DELETE'
  }, `Failed to remove participant ${userId} from trip ${tripId}`);
}

//=============================================
//TRIP FILTERING BY USER ROLE
//=============================================

// Get trips where the user is the organizer
export async function getTripsByOrganizer(userId) {
  return await fetchJsonOrThrow(`/api/trips/organizer/${userId}`, {}, 'Failed to fetch trips by organizer');
}

// Get trips where the user is a participant
export async function getTripsByParticipant(userId) {
  return await fetchJsonOrThrow(`/api/trips/participant/${userId}`, {}, 'Failed to fetch trips by participant');
}

//=============================================
// EXTERNAL APIs
//=============================================

// Search for location suggestions
export async function searchLocation(query) {
  return await fetchJsonOrThrow(`${API_BASE}/locations/search?query=${encodeURIComponent(query)}`, {}, 'Failed to search location');
}

// Search for POIs near a given coordinate
export async function searchPointsOfInterest({ latitude, longitude, radius = 1000, types = '' }) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    types: Array.isArray(types) ? types.join(',') : types,
  });
  return await fetchJsonOrThrow(`${API_BASE}/locations/poi?${params.toString()}`, {}, 'Failed to fetch POIs');
}

//=============================================
// WEATHER SERVICE
//=============================================

export async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  }).toString();

  const data = await fetchJsonOrThrow(
    `${API_BASE}/weather/forecast?${params}`,
    {},
    `Failed to fetch weather for (${latitude}, ${longitude})`
  );

  return data;
}