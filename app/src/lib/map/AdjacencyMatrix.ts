interface Location {
    name: string;
    lat: number;
    lng: number;
}

export function createAdjacencyMatrix(locations: Location[]): number[][] {
    const size: number = locations.length;
    const matrix: number[][] = [];
    for (let i = 0; i < size; i++) {
        matrix[i] = [];
        for (let j = 0; j < size; j++) {
            matrix[i][j] = i === j ? 0 : Infinity;
        }
    }

    for (let i = 0; i < size; i++) {
        for (let j = i + 1; j < size; j++) {
            const distance = Haversine(locations[i].lat, locations[j].lat, locations[i].lng, locations[j].lng);
            matrix[i][j] = distance;
            matrix[j][i] = distance;
        }
    }

    console.log("Distances Matrix:");
    console.table(matrix);

    return matrix;
}

function Haversine(lat1: number, lat2: number, lon1: number, lon2: number) {
    // To radian
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula 
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers
    let r = 6371;

    // Calculate the result
    return (c * r);
}