// UN Sustainable Development Goals
export const SDGS = {
  noPoverty: {
    id: 1,
    name: "No Poverty",
    description: "End poverty in all its forms everywhere",
    color: "#E5243B",
  },
  zeroHunger: {
    id: 2,
    name: "Zero Hunger",
    description: "End hunger, achieve food security and improved nutrition",
    color: "#DDA63A",
  },
  goodHealth: {
    id: 3,
    name: "Good Health and Well-being",
    description: "Ensure healthy lives and promote well-being for all",
    color: "#4C9F38",
  },
  qualityEducation: {
    id: 4,
    name: "Quality Education",
    description: "Ensure inclusive and equitable quality education",
    color: "#C5192D",
  },
  genderEquality: {
    id: 5,
    name: "Gender Equality",
    description: "Achieve gender equality and empower all women and girls",
    color: "#FF3A21",
  },
  cleanWater: {
    id: 6,
    name: "Clean Water and Sanitation",
    description: "Ensure availability of water and sanitation for all",
    color: "#26BDE2",
  },
  affordableEnergy: {
    id: 7,
    name: "Affordable and Clean Energy",
    description: "Ensure access to affordable, reliable, sustainable energy",
    color: "#FCC30B",
  },
  decentWork: {
    id: 8,
    name: "Decent Work and Economic Growth",
    description: "Promote sustained, inclusive economic growth",
    color: "#A21942",
  },
  industry: {
    id: 9,
    name: "Industry, Innovation and Infrastructure",
    description: "Build resilient infrastructure, promote industrialization",
    color: "#FD6925",
  },
  reducedInequalities: {
    id: 10,
    name: "Reduced Inequalities",
    description: "Reduce inequality within and among countries",
    color: "#DD1367",
  },
  sustainableCities: {
    id: 11,
    name: "Sustainable Cities and Communities",
    description: "Make cities inclusive, safe, resilient and sustainable",
    color: "#FD9D24",
  },
  responsibleConsumption: {
    id: 12,
    name: "Responsible Consumption and Production",
    description: "Ensure sustainable consumption and production patterns",
    color: "#BF8B2E",
  },
  climateAction: {
    id: 13,
    name: "Climate Action",
    description: "Take urgent action to combat climate change",
    color: "#3F7E44",
  },
  lifeBelowWater: {
    id: 14,
    name: "Life Below Water",
    description: "Conserve and sustainably use the oceans and marine resources",
    color: "#0A97D9",
  },
  lifeOnLand: {
    id: 15,
    name: "Life on Land",
    description: "Protect, restore and promote sustainable use of ecosystems",
    color: "#56C02B",
  },
  peace: {
    id: 16,
    name: "Peace, Justice and Strong Institutions",
    description: "Promote peaceful and inclusive societies",
    color: "#00689D",
  },
  partnerships: {
    id: 17,
    name: "Partnerships for the Goals",
    description: "Strengthen the means of implementation",
    color: "#19486A",
  },
} as const;

export type SDGKey = keyof typeof SDGS;
export type SDG = (typeof SDGS)[SDGKey];

export function getSDGById(id: number): SDG | undefined {
  return Object.values(SDGS).find((sdg) => sdg.id === id);
}

export function getSDGByName(name: string): SDG | undefined {
  return Object.values(SDGS).find(
    (sdg) => sdg.name.toLowerCase() === name.toLowerCase()
  );
}

export const SDG_LIST = Object.values(SDGS).sort((a, b) => a.id - b.id);
