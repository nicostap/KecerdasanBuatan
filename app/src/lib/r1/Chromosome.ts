export class Chromosome {
	constructor(public genes: number[]) {}

	public clone() {
		return new Chromosome([...this.genes]);
	}

	public crossover(withChromosome: Chromosome) {
		const crossoverPoint = Math.floor(Math.random() * this.genes.length);
		const newGenes = this.genes
			.slice(0, crossoverPoint)
			.concat(withChromosome.genes.slice(crossoverPoint));
		return new Chromosome(newGenes);
	}

	public mutate() {}

	public getFitness() {}
}
