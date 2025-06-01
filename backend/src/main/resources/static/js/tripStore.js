/* DELETE LATER, OPTIONAL BECAUSE NO DB YET */

let trips = [];

export function getAllTrips() {
    return trips;
}

export function addTrip(trip) {
    trips.unshift(trip);
}

export function getTripById(id) {
    return trips.find(t => t.id === id);
}

export function setTrips(newTrips) {
    trips = newTrips;
}
