// =============================================
// AJAX FETCHES TO BACKEND & EXTERNAL APIS
// =============================================

const API_BASE = '/api';

// =============================================
// HELPER: Fetch JSON or throw with error message
// =============================================

/**
 * Performs a fetch request, throws if response not ok, parses JSON body if present.
 * @param {string} url - The endpoint URL
 * @param {object} [options={}] - Fetch options (method, headers, body, etc.)
 * @param {string} [errorMsg='Request failed'] - Error message prefix
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} When response is not ok or JSON parsing fails
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
 * @returns {Promise<Array>} Array of trip objects
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
 * @param {string} id - Trip identifier
 * @returns {Promise<Object>} Trip object
 */

export async function getTripById(id) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/${encodeURIComponent(id)}`,
    {},
    `Trip not found (id=${id})`
  );
}

/**
 * Creates a new trip.
 * @param {Object} payload - Trip data
 * @returns {Promise<Object>} Created trip object
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
 * @param {string} id - Trip identifier
 * @param {Object} payload - Updated trip data
 * @returns {Promise<Object>} Updated trip object
 */

export async function updateTrip(id, payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/${encodeURIComponent(id)}`,
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
 * @param {string} id - Trip identifier
 * @returns {Promise<void>}
 */

export async function deleteTrip(id) {
  const res = await fetch(`${API_BASE}/trips/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete trip (id=${id})`);
}

// =============================================
// LOCATIONS
// =============================================

/**
 * Fetches locations for a given trip.
 * @param {string} tripId - Trip identifier
 * @returns {Promise<Array>} Array of location objects
 */

export async function getLocationsByTrip(tripId) {
  return await fetchJsonOrThrow(
    `${API_BASE}/locations/trips/${encodeURIComponent(tripId)}`,
    {},
    `Failed to fetch locations for trip ${tripId}`
  );
}

/**
 * Adds a new location to a trip.
 * @param {string} tripId - Trip identifier
 * @param {Object} payload - Location data
 * @returns {Promise<Object>} Created location object
 */

export async function createLocation(tripId, payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/locations/trips/${encodeURIComponent(tripId)}`,
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
 * @param {string} id - Location identifier
 * @param {Object} payload - Updated location data
 * @returns {Promise<Object>} Updated location object
 */

export async function updateLocation(id, payload) {
  return await fetchJsonOrThrow(
    `${API_BASE}/locations/${encodeURIComponent(id)}`,
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
 * @param {string} id - Location identifier
 * @returns {Promise<void>}
 */

export async function deleteLocation(id) {
  const res = await fetch(`${API_BASE}/locations/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete location (id=${id})`);
}

// =============================================
// USER & PARTICIPANT ENDPOINTS
// =============================================

/**
 * Fetches user details by username.
 * @param {string} username - User's username
 * @returns {Promise<Object>} User object
 */

export async function getUserByUsername(username) {
  return await fetchJsonOrThrow(
    `${API_BASE}/users/${encodeURIComponent(username)}`,
    {},
    `User not found (${username})`
  );
}

/**
 * Fetches a user's buddy list.
 * @param {string} username - User's username
 * @returns {Promise<Array>} Array of buddy objects
 */

export async function getBuddiesForUser(username) {
  return await fetchJsonOrThrow(
    `${API_BASE}/users/${encodeURIComponent(username)}/buddies`,
    {},
    `Failed to fetch buddies for user ${username}`
  );
}

/**
 * Removes a participant from a trip.
 * @param {string} tripId - Trip identifier
 * @param {string} userId - User identifier to remove
 * @returns {Promise<void>}
 */

export async function removeParticipantFromTrip(tripId, userId) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/${encodeURIComponent(tripId)}/participants/${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
    `Failed to remove participant ${userId} from trip ${tripId}`
  );
}

// =============================================
// TRIP FILTERING BY USER ROLE
// =============================================

/**
 * Fetches trips organized by a specific user.
 * @param {string} userId - Organizer's user ID
 * @returns {Promise<Array>} Array of trip objects
 */

export async function getTripsByOrganizer(userId) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/organizer/${encodeURIComponent(userId)}`,
    {},
    'Failed to fetch trips by organizer'
  );
}

/**
 * Fetches trips where a user is a participant.
 * @param {string} userId - Participant's user ID
 * @returns {Promise<Array>} Array of trip objects
 */

export async function getTripsByParticipant(userId) {
  return await fetchJsonOrThrow(
    `${API_BASE}/trips/participant/${encodeURIComponent(userId)}`,
    {},
    'Failed to fetch trips by participant'
  );
}

// =============================================
// EXTERNAL API: LOCATION SEARCH AND POIS
// =============================================

/**
 * Searches for location suggestions based on query.
 * @param {string} query - Search term for location
 * @returns {Promise<Array>} Array of location matches
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
 * Fetches points of interest near given coordinates.
 * @param {{ latitude: number, longitude: number, radius?: number, types?: string[] }} params - Search parameters
 * @returns {Promise<Array>} Array of POI objects
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
// EXTERNAL API: WEATHER
// =============================================

/**
 * Fetches weather forecast for given coordinates.
 * @param {number} latitude - Geographic latitude
 * @param {number} longitude - Geographic longitude
 * @returns {Promise<any>} Weather forecast data
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
