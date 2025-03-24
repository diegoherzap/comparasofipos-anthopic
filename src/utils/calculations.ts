import { Sofipo, InvestmentFormData, ComparisonResult } from '../types';

export const calculateEarnings = (
  amount: number,
  interestRate: number,
  duration: number
): number => {
  return amount * (interestRate / 100) * (duration / 365);
};

export const getInterestRate = (sofipo: Sofipo, duration: string | number): number => {
  if (duration === 'A la vista') {
    return sofipo.intrateF;
  }
  
  const durationNumber = Number(duration);
  
  switch (durationNumber) {
    case 7: return sofipo.intRate7;
    case 30: return sofipo.intRate30;
    case 60: return sofipo.intRate60;
    case 90: return sofipo.intRate90;
    case 180: return sofipo.intRate180;
    case 360: return sofipo.intRate360;
    case 1080: return sofipo.intRate1080;
    case 1440: return sofipo.intRate1440;
    case 1800: return sofipo.intRate1800;
    default: return 0;
  }
};

export const isSofipoEligible = (
  sofipo: Sofipo,
  formData: InvestmentFormData
): boolean => {
  const { amount, duration } = formData;
  
  // Check if amount is within range
  const isAmountEligible = amount >= sofipo.minAmount && amount <= sofipo.maxAmount;
  
  // Check if duration is supported
  const durations = sofipo.duration.split(',').map(d => d.trim());
  
  let isDurationEligible = false;
  
  if (duration === 'A la vista') {
    isDurationEligible = durations.includes('A la vista') && sofipo.intrateF > 0;
  } else {
    isDurationEligible = durations.includes(String(duration)) && getInterestRate(sofipo, duration) > 0;
  }
  
  // Both conditions must be met for a SOFIPO to be eligible
  return isAmountEligible && isDurationEligible;
};

export const calculateResults = (
  sofipos: Sofipo[],
  formData: InvestmentFormData,
  selectedSofipos: string[]
): ComparisonResult[] => {
  const eligibleResults: ComparisonResult[] = [];
  const ineligibleResults: ComparisonResult[] = [];

  sofipos
    .filter(sofipo => selectedSofipos.includes(sofipo.financialInstitution))
    .forEach(sofipo => {
      const isEligible = isSofipoEligible(sofipo, formData);
      const interestRate = getInterestRate(
        sofipo, 
        formData.duration === 'A la vista' ? 'A la vista' : formData.duration
      );
      
      const durationInDays = formData.duration === 'A la vista' 
        ? formData.customDuration 
        : Number(formData.duration);
      
      const earnings = calculateEarnings(
        formData.amount,
        interestRate,
        durationInDays
      );
      
      const result = {
        sofipo,
        interestRate,
        earnings,
        totalReturn: formData.amount + earnings,
        isEligible
      };

      if (isEligible) {
        eligibleResults.push(result);
      } else {
        ineligibleResults.push(result);
      }
    });
  
  // Sort eligible results by earnings (highest first)
  eligibleResults.sort((a, b) => b.earnings - a.earnings);
  
  // Sort ineligible results alphabetically by institution name
  ineligibleResults.sort((a, b) => 
    a.sofipo.financialInstitution.localeCompare(b.sofipo.financialInstitution)
  );
  
  // Combine the sorted results
  return [...eligibleResults, ...ineligibleResults];
};
