import { Sofipo } from '../types';

export const parseCSV = async (filePath: string): Promise<Sofipo[]> => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',');
        const sofipo: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          
          if (header === 'minAmount' || header === 'maxAmount' || 
              header.startsWith('intRate') || header === 'intrateF') {
            sofipo[header] = value ? parseFloat(value) : 0;
          } else {
            sofipo[header] = value || '';
          }
        });
        
        return sofipo as Sofipo;
      });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return [];
  }
};
