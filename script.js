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

    constructor(data) {
        this.data = data;
    }
    cekMuat() {
        let isi = [[],[],[],[]];
        for(let i = 0; i < this.data.length; i++) {
            isi[this.data[i]].push(i);
        }
        for (let i = 0; i < 4; i++) {
            let total_isi = 0.0;
            let total_berat = 0.0;
            for (let j = 0; j < isi[i].length; j++) {
                total_isi += items[isi[i][j]].getVolume();
                total_berat += items[isi[i][j]].berat;
            }
            if ((total_isi > Chrosmosome.getBatasVolume() * Chrosmosome.packing_f) || total_berat > Chrosmosome.daya_angkut) return false;
        }
        return true;
    }
    getDivWithoutEnds() {
        return this.division.slice(1, this.division.length - 1);
    }
    setFitness() {
        let isi = [[],[],[],[]];
        for(let i = 0; i < this.data.length; i++) {
            isi[this.data[i]].push(i);
        }
        let jarak = 0;
        this.fitness = 0;
        this.routes = [];
        for (let i = 0; i < 4; i++) {
            let tujuan = [];
            for (let j = 0; j < isi[i].length; j++) {
                let harga = items[isi[i][j]].berat * dijkstraMap[0][items[isi[i][j]].kota_tujuan];
                if (items[isi[i][j]].getVolume() <= Chrosmosome.batasDimensiKecil) {
                    harga *= Chrosmosome.hargaKecil;
                } else if (items[isi[i][j]].getVolume() <= Chrosmosome.batasDimensiMenengah) {
                    harga *= Chrosmosome.hargaMenengah;
                } else {
                    harga *= Chrosmosome.hargaBesar;
                }
                this.fitness += harga;

                if (items[isi[i][j]].kota_tujuan == 0) continue;
                if (!tujuan.includes(items[isi[i][j]].kota_tujuan)) tujuan.push(items[isi[i][j]].kota_tujuan);
            }
            let hasil = generateTSP(dijkstraMap, tujuan);
            this.routes.push(hasil[0]);
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

let chrosmosomes = [];

while (chrosmosomes.length < 200) {
    let data = [];
    for(let i = 0; i < items.length; i++) {
        data.push(randomInteger(0, 3));
    }

    let chrosmosome = new Chrosmosome(data);

    if (chrosmosome.cekMuat()) {
        chrosmosomes.push(chrosmosome);
    }
}

for (let i = 0; i < chrosmosomes.length; i++) chrosmosomes[i].setFitness();
chrosmosomes.sort(compareByFitness);
console.log(chrosmosomes);

for (let gen = 0; gen < 3; gen++) {
    let new_chrosmosomes = [];
    new_chrosmosomes.push(new Chrosmosome(chrosmosomes[chrosmosomes.length - 1].data));

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

        let offspring_count = randomInteger(0, 2);

        for(let i = 0; i < offspring_count; i++) {
            let offspring = uniformCrossover(chrosmosomes[first_pick].data, chrosmosomes[second_pick].data);
            if(randomInteger(1, 10) <= 3) {
                mutate(offspring, 0, 3);
            }
            let chrosmosome = new Chrosmosome(offspring);
            if(chrosmosome.cekMuat()) {
                new_chrosmosomes.push(chrosmosome);
            }
        }
    }
    chrosmosomes = new_chrosmosomes;
    for (let i = 0; i < chrosmosomes.length; i++) chrosmosomes[i].setFitness();
    chrosmosomes.sort(compareByFitness);
    console.log(chrosmosomes);
}
console.log(chrosmosomes[chrosmosomes.length - 1]);