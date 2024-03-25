import { Random } from './Random';

export enum CrossoverType {
	OnePoint,
	TwoPoint,
	Uniform
}

export const CrossoverTypeLabels = {
	[CrossoverType.OnePoint]: 'One Point',
	[CrossoverType.TwoPoint]: 'Two Point',
	[CrossoverType.Uniform]: 'Uniform'
} as const;

export enum MutationType {
	RandomInteger,
	SwapInteger,
	AdditionSubtractionInteger
}

export const MutationTypeLabels = {
	[MutationType.RandomInteger]: 'Random Integer',
	[MutationType.SwapInteger]: 'Swap Integer',
	[MutationType.AdditionSubtractionInteger]: 'Addition/Subtraction Integer'
} as const;

export class Chromosome {
	public calculatedFitness: number = 0;
	public static rand: Random;

	public static compareByFitness(a: Chromosome, b: Chromosome) {
		return a.calculatedFitness - b.calculatedFitness;
	}

	constructor(public genes: number[]) {}

	public clone() {
		return new Chromosome([...this.genes]);
	}

	public equals(chromosome: Chromosome) {
		return this.genes.every((gene, i) => gene === chromosome.genes[i]);
	}

	public crossover(withChromosome: Chromosome, type: CrossoverType, rate?: number) {
		switch (type) {
			case CrossoverType.OnePoint:
				return this.onePointCrossover(withChromosome);
			case CrossoverType.TwoPoint:
				return this.twoPointCrossover(withChromosome);
			case CrossoverType.Uniform:
				if (rate === undefined) {
					throw new Error('Uniform crossover requires a rate.');
				}
				return this.uniformCrossover(withChromosome, rate);
		}
	}

	protected onePointCrossover(withChromosome: Chromosome) {
		const crossoverPoint = Math.floor(Chromosome.rand.next() * this.genes.length);
		const newGenes = this.genes
			.slice(0, crossoverPoint)
			.concat(withChromosome.genes.slice(crossoverPoint));
		return new Chromosome(newGenes);
	}

	protected twoPointCrossover(withChromosome: Chromosome) {
		const crossoverPoint1 = Math.floor(Chromosome.rand.next() * this.genes.length);
		const crossoverPoint2 = Math.floor(Chromosome.rand.next() * this.genes.length);
		const start = Math.min(crossoverPoint1, crossoverPoint2);
		const end = Math.max(crossoverPoint1, crossoverPoint2);
		const newGenes = this.genes
			.slice(0, start)
			.concat(withChromosome.genes.slice(start, end))
			.concat(this.genes.slice(end));
		return new Chromosome(newGenes);
	}

	protected uniformCrossover(withChromosome: Chromosome, rate: number) {
		const newGenes = this.genes.map((gene, i) => {
			if (Chromosome.rand.next() < rate) {
				return withChromosome.genes[i];
			}
			return gene;
		});
		return new Chromosome(newGenes);
	}

	public mutate(type: MutationType, rate: number, lowerBound?: number, upperBound?: number) {
		switch (type) {
			case MutationType.RandomInteger:
				return this.randomIntegerMutation(rate, lowerBound, upperBound);
			case MutationType.SwapInteger:
				return this.swapIntegerMutation(rate);
			case MutationType.AdditionSubtractionInteger:
				return this.additionSubtractionIntegerMutation(rate, lowerBound, upperBound);
		}
	}

	protected randomIntegerMutation(rate: number, lowerBound = 0, upperBound = 1) {
		const newGenes = this.genes.map((gene) => {
			if (Chromosome.rand.next() < rate) {
				return Chromosome.rand.nextIntInclusive(lowerBound, upperBound);
			}
			return gene;
		});
		return new Chromosome(newGenes);
	}

	protected swapIntegerMutation(rate: number) {
		const newGenes = [...this.genes];
		for (let i = 0; i < newGenes.length; i++) {
			if (Chromosome.rand.next() < rate) {
				const j = Chromosome.rand.nextIntInclusive(0, newGenes.length - 1);
				[newGenes[i], newGenes[j]] = [newGenes[j], newGenes[i]];
			}
		}
		return new Chromosome(newGenes);
	}

	protected additionSubtractionIntegerMutation(rate: number, lowerBound = 0, upperBound = 1) {
		const newGenes = this.genes.map((gene) => {
			if (Chromosome.rand.next() < rate) {
				let result = gene + Chromosome.rand.nextIntInclusive(0, 1) === 0 ? -1 : 1;

				// If the result is out of bounds, then we roll it over to the other side.
				if (result < lowerBound) {
					result = upperBound - (lowerBound - result) + 1;
				} else if (result > upperBound) {
					result = lowerBound + (result - upperBound) - 1;
				}
			}
			return gene;
		});
		return new Chromosome(newGenes);
	}
}
