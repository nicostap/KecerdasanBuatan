function minDistance(dist, sptSet, V) {
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

function dijkstra(graph, src) {
    let V = graph.length;
    let dist = new Array(V);
    let sptSet = new Array(V);

    for (let i = 0; i < V; i++) {
        dist[i] = Number.MAX_VALUE;
        sptSet[i] = false;
    }

    dist[src] = 0;

    for (let count = 0; count < V - 1; count++) {
        let u = minDistance(dist, sptSet, V);
        sptSet[u] = true;
        for (let v = 0; v < V; v++) {
            if (!sptSet[v] && graph[u][v] != 0 &&
                dist[u] != Number.MAX_VALUE &&
                dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    return dist;
}

function generateDijkstra(graph) {
    var dijkstraMap = new Array(graph.length);
    for (let i = 0; i < graph.length; i++) {
        dijkstraMap[i] = dijkstra(graph, i);
    }
    return dijkstraMap;
}

function perm(xs) {
    let ret = [];
    for (let i = 0; i < xs.length; i = i + 1) {
        let rest = perm(xs.slice(0, i).concat(xs.slice(i + 1)));

        if (!rest.length) {
            ret.push([xs[i]])
        } else {
            for (let j = 0; j < rest.length; j = j + 1) {
                ret.push([xs[i]].concat(rest[j]))
            }
        }
    }
    return ret;
}

function generateTSP(dist, nodes) {
    let permutation = perm(nodes);
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

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uniformCrossover(parent1, parent2) {
    let offspring = [];
    for (let i = 0; i < parent1.length; i++) {
        if (randomInteger(0, 1) == 0) {
            offspring.push(parent1[i]);
        } else {
            offspring.push(parent2[i]);
        }
    }
    return offspring;
}

function mutate(array, min, max) {
    for (let i = 0; i < array.length / 5; i++) {
        let pick = randomInteger(0, array.length - 1);
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