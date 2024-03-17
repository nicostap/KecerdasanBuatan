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

function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function crossPermutation(parent1, parent2) {
    let point1 = parent1.length / 3;
    let point2 = parent1.length * 2 / 3;

    let offspring1 = new Array(parent1.length);
    for (let i = point1; i < point2; i++) {
        offspring1[i] = parent1[i];
    }

    let j = 0;
    for (let i = 0; i < offspring1.length; i++) {
        if (offspring1[i] != null && offspring1[i] != undefined) continue;
        else {
            while (offspring1.includes(parent2[j])) j++;
            offspring1[i] = parent2[j];
            j++;
        }
    }

    let offspring2 = new Array(parent2.length);
    for (let i = point1; i < point2; i++) {
        offspring2[i] = parent2[i];
    }

    j = 0;
    for (let i = 0; i < offspring2.length; i++) {
        if (offspring2[i] != null && offspring2[i] != undefined) continue;
        else {
            while (offspring2.includes(parent1[j])) j++;
            offspring2[i] = parent1[j];
            j++;
        }
    }

    return [offspring1, offspring2];
}

function crossNormal(parent1, parent2) {
    let offspring1 = parent1.slice(0, 1).concat(parent2.slice(1, 3));
    let offspring2 = parent2.slice(0, 1).concat(parent1.slice(1, 3));

    offspring1.sort(compareByNumber);
    offspring2.sort(compareByNumber);
    return [offspring1, offspring2];
}

function mutatePermutation(offspring) {
    let times = randomInteger(1, 3);
    for (let i = 0; i < times; i++) {
        let x = randomInteger(0, offspring.length - 2);
        let y = randomInteger(0, offspring.length - 2);
        let b = offspring[y];
        offspring[y] = offspring[x];
        offspring[x] = b;
        b = offspring[y + 1];
        offspring[y + 1] = offspring[x + 1];
        offspring[x + 1] = b;
    }
}

function mutateNormal(offspring, min, max) {
    let times = randomInteger(1, 3);
    for (let i = 0; i < times; i++) {
        let x = randomInteger(1, offspring.length - 2);
        if (randomInteger(0, 1) == 0) {
            offspring[x] += randomInteger(1,2);
            if (offspring[x] > max) offspring[x] -= randomInteger(1,2);
        } else {
            offspring[x] -= randomInteger(1,2);
            if (offspring[x] < min) offspring[x] += randomInteger(1,2);
        }
    }
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }