/* DELETE LATER, OPTIONAL BECAUSE NO DB YET */

let trips = [];

export function getAllTrips() {
    return trips;
}

export function getTripLocation(id) {
    const t = trips.find(x => x.id === id);
    return t ? t.location : null;
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
