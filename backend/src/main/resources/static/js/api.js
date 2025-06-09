// =============================================
// AJAX FETCHES TO BACKEND & EXTERNAL APIS
// =============================================

const API_BASE = '/api';

// =============================================
// HELPER: Fetch JSON or throw with error message
// =============================================
/**
 * Performs a fetch request, throws if response not ok,
 * parses JSON body if present.
 * @param {string} url
 * @param {object} options
 * @param {string} errorMsg
 * @returns {Promise<any>}
 */
async function fetchJsonOrThrow(url, options = {}, errorMsg = 'Request failed') {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${errorMsg}: ${text}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// =============================================
// TRIPS
// =============================================
/**
 * Fetches all trips.
 * @returns {Promise<Array>}
 */
export async function getAllTrips() {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips`,
    {},
    'Failed to fetch trips'
  );
}

/**
 * Fetches a single trip by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getTripById(id) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/${id}`,
    {},
    `Trip not found (id=${id})`
  );
}

/**
 * Creates a new trip.
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function createTrip(payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    'Failed to create trip'
  );
}

/**
 * Updates an existing trip.
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateTrip(id, payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    'Failed to update trip'
  );
}

/**
 * Deletes a trip by ID.
 * @param {string} id
 */
export async function deleteTrip(id) {
  const res = await fetch(`${API_BASE}/trips/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete trip (id=${id})`);
}

// =============================================
// LOCATIONS
// =============================================
/**
 * Fetches locations by trip ID.
 * @param {string} tripId
 * @returns {Promise<Array>}
 */
export async function getLocationsByTrip(tripId) {
  return await fetchJsonOrThrow(
    `${API_BASE}/locations/trips/${tripId}`,
    {},
    `Failed to fetch locations for trip ${tripId}`
  );
}

/**
 * Creates a new location for a trip.
 * @param {string} tripId
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function createLocation(tripId, payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/locations/trips/${tripId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    'Failed to create location'
  );
}

/**
 * Updates an existing location.
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateLocation(id, payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/locations/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    },
    'Failed to update location'
  );
}

/**
 * Deletes a location by ID.
 * @param {string} id
 */
export async function deleteLocation(id) {
  const res = await fetch(`${API_BASE}/locations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete location (id=${id})`);
}

// =============================================
// EXTERNAL API: Location Search and POIs
// =============================================
/**
 * Searches for locations matching the query string.
 * @param {string} query
 * @returns {Promise<Array<{ latitude: number, longitude: number, displayName: string }>>}
 */
export async function searchLocation(query) {
  const url = `${API_BASE}/locations/search?query=${encodeURIComponent(query)}`;
  return await fetchJsonOrThrow(
    url,
    {},
    `Failed to search location for "${query}"`
  );
}

/**
 * Fetches points of interest around given coordinates.
 * @param {{ latitude: number, longitude: number, radius?: number, types?: string[] }} params
 * @returns {Promise<Array<any>>}
 */
export async function searchPointsOfInterest({ latitude, longitude, radius = 1000, types = [] }) {
  const qs = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    radius: radius.toString(),
    types: types.join(',')
  });
  const url = `${API_BASE}/locations/poi?${qs.toString()}`;
  return await fetchJsonOrThrow(
    url,
    {},
    'Failed to fetch POIs'
  );
}

// =============================================
// EXTERNAL API: Buddies & Trips by User
// =============================================
/**
 * Fetches buddies for a given user.
 * @param {string} username
 * @returns {Promise<Array>}
 */
export async function getBuddiesForUser(username) {
  const url = `${API_BASE}/users/${encodeURIComponent(username)}/buddies`;
  return await fetchJsonOrThrow(
    url,
    {},
    `Failed to fetch buddies for user ${username}`
  );
}

/**
 * Fetches trips organized by a specific user.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getTripsByOrganizer(userId) {
  const url = `${API_BASE}/trips/organizer/${encodeURIComponent(userId)}`;
  return await fetchJsonOrThrow(
    url,
    {},
    'Failed to fetch trips by organizer'
  );
}

/**
 * Fetches trips where a specific user participates.
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getTripsByParticipant(userId) {
  const url = `${API_BASE}/trips/participant/${encodeURIComponent(userId)}`;
  return await fetchJsonOrThrow(
    url,
    {},
    'Failed to fetch trips by participant'
  );
}

// =============================================
// EXTERNAL API: Weather
// =============================================
/**
 * Fetches weather forecast for given coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<any>}
 */
export async function getWeather(latitude, longitude) {
  const qs = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString()
  });
  const url = `${API_BASE}/weather/forecast?${qs.toString()}`;
  return await fetchJsonOrThrow(
    url,
    {},
    `Failed to fetch weather for (${latitude}, ${longitude})`
  );
}
