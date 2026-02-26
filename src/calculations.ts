import { RESISTIVITY } from './utils';

export const calculateOhmsLaw = (v?: number, r?: number, i?: number) => {
  let resV = v;
  let resR = r;
  let resI = i;
  let resP: number | undefined;

  if (v !== undefined && r !== undefined) {
    resI = v / r;
    resP = v * resI;
  } else if (v !== undefined && i !== undefined) {
    resR = v / i;
    resP = v * i;
  } else if (r !== undefined && i !== undefined) {
    resV = r * i;
    resP = resV * i;
  }

  if (resP === undefined && resV !== undefined && resI !== undefined) {
    resP = resV * resI;
  }

  return { v: resV, r: resR, i: resI, p: resP };
};

export const calculatePower = (v: number, i: number, fp: number, phases: 1 | 3) => {
  const multiplier = phases === 3 ? Math.sqrt(3) : 1;
  const p = v * i * fp * multiplier; // Active Power (W)
  const s = v * i * multiplier; // Apparent Power (VA)
  const q = Math.sqrt(s * s - p * p); // Reactive Power (VAr)
  return { p, s, q };
};

export const calculateVoltageDrop = (
  length: number,
  current: number,
  section: number,
  material: 'copper' | 'aluminum',
  phases: 1 | 3,
  pf: number = 1,
  reactance: number = 0, // ohm/km
  temp: number = 20 // Celsius
) => {
  const alpha = material === 'copper' ? 0.00393 : 0.00403;
  const rho20 = RESISTIVITY[material];
  const rhoT = rho20 * (1 + alpha * (temp - 20));
  
  // Resistance in ohm/m
  const r = rhoT / section;
  // Reactance in ohm/m (input is ohm/km)
  const x = reactance / 1000;
  
  const cosPhi = pf;
  const sinPhi = Math.sqrt(1 - Math.pow(cosPhi, 2));
  
  const multiplier = phases === 3 ? Math.sqrt(3) : 2;
  
  // Delta V = k * I * L * (R*cosPhi + X*sinPhi)
  const drop = multiplier * current * length * (r * cosPhi + x * sinPhi);
  return drop;
};

export const calculateConduitFill = (cables: { section: number, count: number }[]) => {
  // Diâmetros externos aproximados (mm) para cabos 750V PVC
  const diameters: Record<number, number> = {
    1.5: 3.0, 2.5: 3.6, 4: 4.2, 6: 4.8, 10: 6.2, 16: 7.4, 25: 9.2, 35: 10.5, 50: 12.5, 70: 14.5, 95: 17.0, 120: 18.8, 150: 21.0, 185: 23.5, 240: 27.0
  };

  let totalArea = 0;
  cables.forEach(c => {
    const d = diameters[c.section] || 0;
    const area = Math.PI * Math.pow(d / 2, 2);
    totalArea += area * c.count;
  });

  // Taxas de ocupação NBR 5410: 1 cabo = 53%, 2 cabos = 31%, 3+ cabos = 40%
  const totalCables = cables.reduce((acc, c) => acc + c.count, 0);
  const limit = totalCables === 1 ? 0.53 : totalCables === 2 ? 0.31 : 0.40;
  
  const requiredArea = totalArea / limit;
  const requiredDiameter = Math.sqrt((4 * requiredArea) / Math.PI);
  
  return { totalArea, requiredDiameter, limit: limit * 100 };
};

export const calculateShortCircuit = (v: number, length: number, section: number, material: 'copper' | 'aluminum') => {
  const rho = RESISTIVITY[material];
  const r = (rho * length) / section;
  // Simplificado: Icc = V / R (considerando apenas impedância do cabo)
  const icc = v / r;
  return icc;
};

export const calculateLighting = (length: number, width: number, lux: number, lumensPerLamp: number) => {
  const area = length * width;
  // Fator de utilização médio (0.5) e depreciação (0.8)
  const totalLumens = (area * lux) / (0.5 * 0.8);
  const numLamps = Math.ceil(totalLumens / lumensPerLamp);
  return { area, totalLumens, numLamps };
};

export const calculatePFC = (p: number, fpInitial: number, fpTarget: number) => {
  const phi1 = Math.acos(fpInitial);
  const phi2 = Math.acos(fpTarget);
  const qc = p * (Math.tan(phi1) - Math.tan(phi2));
  return qc; // Reactive power needed in VAr
};
