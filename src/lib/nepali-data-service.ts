
import type { NepaliHoliday } from './types';

// In a real application, this would fetch from a public API.
// For this demo, we'll provide a static list of holidays for 2024.
// Note: These dates are approximate and for demonstration purposes.
const nepaliHolidays2024: NepaliHoliday[] = [
    { date: new Date('2024-01-11'), name: 'Prithvi Jayanti' },
    { date: new Date('2024-01-15'), name: 'Maghe Sankranti' },
    { date: new Date('2024-02-19'), name: 'Prajatantra Diwas' },
    { date: new Date('2024-03-08'), name: 'Maha Shivaratri' },
    { date: new Date('2024-04-13'), name: 'Nepali New Year (Baishakh 1)' },
    { date: new Date('2024-05-01'), name: 'Majdoor Diwas (Labour Day)' },
    { date: new Date('2024-05-23'), name: 'Buddha Jayanti' },
    { date: new Date('2024-05-28'), name: 'Ganatantra Diwas' },
    { date: new Date('2024-08-19'), name: 'Janai Purnima' },
    { date: new Date('2024-08-26'), name: 'Gaura Parba' },
    { date: new Date('2024-09-03'), name: 'Teej' },
    { date: new Date('2024-09-19'), name: 'Constitution Day' },
    { date: new Date('2024-10-03'), name: 'Ghatasthapana' },
    { date: new Date('2024-10-10'), name: 'Fulpati (Dashain)' },
    { date: new Date('2024-10-11'), name: 'Maha Astami (Dashain)' },
    { date: new Date('2024-10-12'), name: 'Maha Navami (Dashain)' },
    { date: new Date('2024-10-13'), name: 'Vijaya Dashami (Dashain)' },
    { date: new Date('2024-10-31'), name: 'Laxmi Puja (Tihar)' },
    { date: new Date('2024-11-02'), name: 'Bhai Tika (Tihar)' },
    { date: new Date('2024-11-07'), name: 'Chhath Puja' },
];

export async function getNepaliHolidays(): Promise<NepaliHoliday[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return Promise.resolve(nepaliHolidays2024);
}

    