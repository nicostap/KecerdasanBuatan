// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function dijkstra(graph, src) {
    const V = graph.length;
    const dist = new Array(V);
    const sptSet = new Array(V);
    const prev = new Array(V).fill(null);

    for (let i = 0; i < V; i++) {
        dist[i] = Number.MAX_VALUE;
        sptSet[i] = false;
    }

    dist[src] = 0;

    for (let count = 0; count < V - 1; count++) {
        const u = minDistance(dist, sptSet, V);
        sptSet[u] = true;
        for (let v = 0; v < V; v++) {
            if (
                !sptSet[v] &&
                graph[u][v] != 0 &&
                dist[u] != Number.MAX_VALUE &&
                dist[u] + graph[u][v] < dist[v]
            ) {
                dist[v] = dist[u] + graph[u][v];
                prev[v] = u;
            }
        }
    }

    return { dist, prev };
}

function minDistance(dist, sptSet, V) {
    let min = Number.MAX_VALUE;
    let minIndex = -1;

    for (let v = 0; v < V; v++) {
        if (!sptSet[v] && dist[v] <= min) {
            min = dist[v];
            minIndex = v;
        }
    }

    return minIndex;
}

export function generateDijkstra(graph) {
    const dijkstraMap = new Array(graph.length);
    const pathMap = new Array(graph.length);

    for (let i = 0; i < graph.length; i++) {
        const { dist, prev } = dijkstra(graph, i);
        dijkstraMap[i] = dist;
        pathMap[i] = new Array(graph.length);
        for (let j = 0; j < graph.length; j++) {
            pathMap[i][j] = reconstructPath(prev, j, i);
        }
    }

    return { distances: dijkstraMap, paths: pathMap };
}

function reconstructPath(prev, j, src) {
    const path = [];
    for (let at = j; at != null; at = prev[at]) {
        path.push(at);
    }
    path.reverse();
    if (path[0] === src) {
        path.shift(); // Remove the first city (source city)
    }
    return path;
}

export function perm(xs) {
	const ret = [];
	for (let i = 0; i < xs.length; i = i + 1) {
		const rest = perm(xs.slice(0, i).concat(xs.slice(i + 1)));

		if (!rest.length) {
			ret.push([xs[i]]);
		} else {
			for (let j = 0; j < rest.length; j = j + 1) {
				ret.push([xs[i]].concat(rest[j]));
			}
		}
	}
	return ret;
}

export function generateTSP(dist, nodes, path) {
	const permutation = perm(nodes);
	let minDist = Number.MAX_VALUE;
	let route;
	for (let i = 0; i < permutation.length; i++) {
		let cur_dist = dist[0][permutation[i][0] - 1];
		for (let j = 0; j < nodes.length - 1; j++) {
			cur_dist += dist[permutation[i][j] - 1][permutation[i][j + 1] - 1];
		}
		cur_dist += dist[permutation[i][nodes.length - 1] - 1][0];
		if (minDist > cur_dist) {
			minDist = cur_dist;
			route = permutation[i];
		}
	}
	if (nodes.length == 0) return {route: [0], dist: 0};
	route.unshift(1);
	route.push(1);
	const actualRoute = [0];
	for(let i = 0; i < route.length - 1; i++) {
		if(route[i] == route[i + 1]) continue;
		actualRoute.push(...path[route[i] - 1][route[i + 1] - 1]);
	}
	return {route: actualRoute, dist: minDist};
}

export function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function uniformCrossover(parent1, parent2) {
	const offspring = [];
	for (let i = 0; i < parent1.length; i++) {
		if (randomInteger(0, 1) == 0) {
			offspring.push(parent1[i]);
		} else {
			offspring.push(parent2[i]);
		}
	}
	return offspring;
}

export function mutate(array, min, max) {
	for (let i = 0; i < array.length / 5; i++) {
		const pick = randomInteger(0, array.length - 1);
		if (randomInteger(0, 1) == 0) {
			array[pick]++;
			if (array[pick] > max) {
				array[pick] -= 2;
			}
		} else {
			array[pick]--;
			if (array[pick] < min) {
				array[pick] += 2;
			}
		}
	}
}

export function mutate2(array: number[], min: number, max: number, mutationRate: number) {
	for (let i = 0; i < array.length; i++) {
		// 2% chance to mutate each gene
		if (Math.random() <= mutationRate) {
			// Either subtract or add 1 to the gene
			array[i] += randomInteger(0, 1) == 0 ? -1 : 1;

			// If the gene is out of bounds, add or subtract 2 to the gene
			if (array[i] < min) {
				array[i] += 2;
			} else if (array[i] > max) {
				array[i] -= 2;
			}
		}
	}
}
