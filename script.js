class Barang {
    constructor(dimensix, dimensiy, dimensiz, berat, kota_tujuan, id) {
        this.dimensix = dimensix;
        this.dimensiy = dimensiy;
        this.dimensiz = dimensiz;
        this.berat = berat;
        this.kota_tujuan = kota_tujuan;
        this.id = id;
    }
    getVolume() {
        return this.dimensix * this.dimensiy * this.dimensiz;
    }
}

class Chrosmosome {
    static dimensix = 5.0;
    static dimensiy = 5.0;
    static dimensiz = 6.0;
    static daya_angkut = 50.0;
    static fuel_ratio = 0.2;
    static packing_f = 0.5;

    static upahPerKM = 50000;
    static rasioBensinPerKM = 1.0 / 10.0;
    static hargaBensin = 25000;

    static batasDimensiKecil = 5.0;
    static batasDimensiMenengah = 20.0;

    static hargaKecil = 10000;
    static hargaMenengah = 20000;
    static hargaBesar = 30000;

    static getBatasVolume() {
        return Chrosmosome.dimensix * Chrosmosome.dimensiy * Chrosmosome.dimensiz;
    }

    constructor(items, division) {
        this.items = items;
        this.division = division;
    }
    cekMuat() {
        for (let i = 0; i < 4; i++) {
            let isi = this.items.slice(this.division[i], this.division[i + 1]);
            let total_isi = 0.0;
            let total_berat = 0.0;
            for (let i = 0; i < isi.length; i++) {
                if (Math.max(isi[i].dimensix, isi[i].dimensiy, isi[i].dimensiz) > Math.max(Chrosmosome.dimensix, Chrosmosome.dimensiy, Chrosmosome.dimensiz)) return false;
                total_isi += isi[i].getVolume();
                total_berat += isi[i].berat;
            }
            if ((total_isi > Chrosmosome.getBatasVolume() * Chrosmosome.packing_f) || total_berat > Chrosmosome.daya_angkut) return false;
        }
        return true;
    }
    getDivWithoutEnds() {
        return this.division.slice(1, this.division.length - 1);
    }
    setFitness() {
        let jarak = 0;
        this.fitness = 0;
        this.route = [];
        for (let i = 0; i < 4; i++) {
            let isi = this.items.slice(this.division[i], this.division[i + 1]);
            let tujuan = [];
            for (let i = 0; i < isi.length; i++) {
                let harga = isi[i].berat * dijkstraMap[0][isi[i].kota_tujuan];
                if (isi[i].getVolume() <= Chrosmosome.batasDimensiKecil) {
                    harga *= Chrosmosome.hargaKecil;
                } else if (isi[i].getVolume() <= Chrosmosome.batasDimensiMenengah) {
                    harga *= Chrosmosome.hargaMenengah;
                } else {
                    harga *= Chrosmosome.hargaBesar;
                }
                this.fitness += harga;

                if (isi[i].kota_tujuan == 0) continue;
                if (!tujuan.includes(isi[i].kota_tujuan)) tujuan.push(isi[i].kota_tujuan);
            }
            let hasil = generateTSP(dijkstraMap, tujuan);
            this.route.push(hasil[0]);
            jarak += hasil[1];
        }
        this.fitness -= jarak * (Chrosmosome.upahPerKM + Chrosmosome.rasioBensinPerKM * Chrosmosome.hargaBensin);
    }
}

function compareByFitness(a, b) {
    return a.fitness - b.fitness;
}
function compareByNumber(a, b) {
    return a - b;
}

let city_map = [
    [0, 61, 35, 0, 91, 12],
    [61, 0, 0, 0, 0, 90],
    [35, 0, 0, 100, 41, 0],
    [0, 0, 100, 0, 23, 54],
    [91, 0, 41, 23, 0, 0],
    [12, 90, 0, 54, 0, 0],
];
let dijkstraMap = generateDijkstra(city_map);

let items = [
    new Barang(1.0, 1.0, 1.0, 2.0, 2, 1),
    new Barang(1.0, 5.0, 3.0, 3.0, 1, 2),
    new Barang(2.0, 4.0, 2.0, 4.0, 2, 3),
    new Barang(1.0, 4.0, 3.0, 3.0, 4, 4),
    new Barang(3.0, 1.0, 1.0, 2.0, 3, 5),
    new Barang(3.0, 5.0, 2.0, 1.0, 1, 6),
    new Barang(4.0, 4.0, 3.0, 2.0, 2, 7),
    new Barang(3.0, 3.0, 2.0, 3.0, 4, 8),
    new Barang(3.0, 1.0, 1.0, 2.0, 3, 9),
    new Barang(3.0, 5.0, 2.0, 1.0, 5, 10),
    new Barang(4.0, 4.0, 2.0, 2.0, 2, 11),
    new Barang(3.0, 3.0, 2.0, 1.5, 4, 12),
    new Barang(1.0, 1.0, 1.0, 2.0, 1, 13),
    new Barang(1.0, 5.0, 3.0, 3.0, 3, 14),
    new Barang(2.0, 2.0, 2.0, 4.0, 1, 15),
];

let chrosmosomes = [];

while (chrosmosomes.length < 200) {
    shuffle(items);

    let index = [0, items.length];
    index.push(randomInteger(0, items.length));
    index.push(randomInteger(0, items.length));
    index.push(randomInteger(0, items.length));
    index.sort(compareByNumber);

    let chrosmosome = new Chrosmosome([...items], index);

    if (chrosmosome.cekMuat()) {
        chrosmosomes.push(chrosmosome);
    }
}

for (let i = 0; i < chrosmosomes.length; i++) chrosmosomes[i].setFitness();
chrosmosomes.sort(compareByFitness);
console.log(chrosmosomes);

for (let gen = 0; gen < 100; gen++) {
    let new_chrosmosomes = [];
    new_chrosmosomes.push(new Chrosmosome(chrosmosomes[chrosmosomes.length - 1].items, chrosmosomes[chrosmosomes.length - 1].division));

    while (new_chrosmosomes.length < chrosmosomes.length) {
        let first_pick, second_pick;

        first_pick = randomInteger(0, chrosmosomes.length * (chrosmosomes.length + 1) / 2.0);
        for (let i = 0; i < chrosmosomes.length; i++) {
            if ((i + 1) * (i + 2) / 2.0 >= first_pick) {
                first_pick = i;
                break;
            }
        }
        second_pick = randomInteger(0, chrosmosomes.length * (chrosmosomes.length + 1) / 2.0);
        for (let i = 0; i < chrosmosomes.length; i++) {
            if ((i + 1) * (i + 2) / 2.0 >= second_pick) {
                second_pick = i;
                break;
            }
        }

        let item_offsprings = crossPermutation(chrosmosomes[first_pick].items, chrosmosomes[second_pick].items);
        if (randomInteger(1, 100) <= 50) mutatePermutation(item_offsprings[0]);
        if (randomInteger(1, 100) <= 50) mutatePermutation(item_offsprings[1]);

        let div_offsprings = crossNormal(chrosmosomes[first_pick].getDivWithoutEnds(), chrosmosomes[second_pick].getDivWithoutEnds());
        div_offsprings[0].unshift(0);
        div_offsprings[0].push(items.length);
        div_offsprings[1].unshift(0);
        div_offsprings[1].push(items.length);
        if (randomInteger(1, 100) <= 50) mutateNormal(div_offsprings[0], 0, items.length);
        if (randomInteger(1, 100) <= 50) mutateNormal(div_offsprings[1], 0, items.length);

        offspring1 = new Chrosmosome(item_offsprings[0], div_offsprings[0]);
        offspring2 = new Chrosmosome(item_offsprings[0], div_offsprings[1]);
        offspring3 = new Chrosmosome(item_offsprings[1], div_offsprings[0]);
        offspring4 = new Chrosmosome(item_offsprings[1], div_offsprings[1]);

        let pick = randomInteger(1, 4);
        if (offspring1.cekMuat() && pick == 1) {
            new_chrosmosomes.push(offspring1);
        } else if (offspring2.cekMuat() && pick == 2) {
            new_chrosmosomes.push(offspring2);
        } else if (offspring3.cekMuat() && pick == 3) {
            new_chrosmosomes.push(offspring3);
        } else if (offspring4.cekMuat() && pick == 4) {
            new_chrosmosomes.push(offspring4);
        }
    }
    chrosmosomes = new_chrosmosomes;
    for (let i = 0; i < chrosmosomes.length; i++) chrosmosomes[i].setFitness();
    chrosmosomes.sort(compareByFitness);
}
console.log(chrosmosomes[chrosmosomes.length - 1].fitness);