// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

export function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function minDistance(dist, sptSet, V) {
	let min = Number.MAX_VALUE;
	let min_index = -1;

	for (let v = 0; v < V; v++) {
		if (sptSet[v] == false && dist[v] <= min) {
			min = dist[v];
			min_index = v;
		}
	}
	return min_index;
}

export function dijkstra(graph, src) {
	const V = graph.length;
	const dist = new Array(V);
	const sptSet = new Array(V);

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
			}
		}
	}

	return dist;
}

export function generateDijkstra(graph): number[][] {
	const dijkstraMap = new Array(graph.length);
	for (let i = 0; i < graph.length; i++) {
		dijkstraMap[i] = dijkstra(graph, i);
	}
	return dijkstraMap;
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

export function generateTSP(dist, nodes) {
	const permutation = perm(nodes);
	let minDist = Number.MAX_VALUE;
	let ans;
	for (let i = 0; i < permutation.length; i++) {
		let cur_dist = dist[0][permutation[i][0]];
		for (let j = 0; j < nodes.length - 1; j++) {
			cur_dist += dist[permutation[i][j]][permutation[i][j + 1]];
		}
		cur_dist += dist[permutation[i][nodes.length - 1]][0];
		if (minDist > cur_dist) {
			minDist = cur_dist;
			ans = permutation[i];
		}
	}
	if (nodes.length == 0) return [[], 0];
	return [ans, minDist];
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
