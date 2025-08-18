
'use client';
import type { NepaliHoliday } from './types';
import { get, ref, set } from 'firebase/database';
import { getFirebaseApp } from './firebase';

const { rtdb } = getFirebaseApp();

// Static list of holidays for 2024, 2025 and 2026 to be used for seeding the database.
const nepaliHolidaysSeedData = {
    "2024": [
        { date: '2024-01-11', name: 'Prithvi Jayanti' },
        { date: '2024-01-15', name: 'Maghe Sankranti' },
        { date: '2024-01-30', name: 'Martyr\'s Day' },
        { date: '2024-02-19', name: 'Prajatantra Diwas (Democracy Day)' },
        { date: '2024-03-08', name: 'Maha Shivaratri' },
        { date: '2024-03-08', name: 'Nari Diwas (International Women\'s Day)' },
        { date: '2024-03-24', name: 'Holi' },
        { date: '2024-04-08', name: 'Ghode Jatra' },
        { date: '2024-04-13', name: 'Nepali New Year (Baishakh 1)' },
        { date: '2024-05-01', name: 'Majdoor Diwas (Labour Day)' },
        { date: '2024-05-23', name: 'Buddha Jayanti' },
        { date: '2024-05-28', name: 'Ganatantra Diwas (Republic Day)' },
        { date: '2024-08-19', name: 'Janai Purnima / Raksha Bandhan' },
        { date: '2024-08-20', name: 'Gai Jatra' },
        { date: '2024-08-26', name: 'Gaura Parba' },
        { date: '2024-09-06', name: 'Krishna Janmashtami' },
        { date: '2024-09-03', name: 'Teej' },
        { date: '2024-09-17', name: 'Indra Jatra' },
        { date: '2024-09-19', name: 'Constitution Day (Sambidhan Diwas)' },
        { date: '2024-10-03', name: 'Ghatasthapana (Dashain Starts)' },
        { date: '2024-10-09', name: 'Dashain Holiday' },
        { date: '2024-10-10', name: 'Fulpati (Dashain)' },
        { date: '2024-10-11', name: 'Maha Astami (Dashain)' },
        { date: '2024-10-12', name: 'Maha Navami (Dashain)' },
        { date: '2024-10-13', name: 'Vijaya Dashami (Dashain)' },
        { date: '2024-10-14', name: 'Dashain Holiday (Ekadashi)' },
        { date: '2024-10-15', name: 'Dashain Holiday (Dwadashi)' },
        { date: '2024-10-16', name: 'Dashain Holiday (Trayodashi)' },
        { date: '2024-10-17', name: 'Kojagrat Purnima (Dashain Ends)' },
        { date: '2024-10-31', name: 'Laxmi Puja (Tihar)' },
        { date: '2024-11-01', name: 'Mha Puja (Tihar)' },
        { date: '2024-11-02', name: 'Bhai Tika (Tihar)' },
        { date: '2024-11-07', name: 'Chhath Puja' },
        { date: '2024-12-25', name: 'Christmas Day' },
        { date: '2024-12-30', name: 'Tamu Lhosar' },
    ],
    "2025": [
        { date: "2025-01-01", name: "New Year's Day" },
        { date: "2025-01-14", name: "Maghe Sankranti" },
        { date: "2025-01-29", name: "Martyrs' Day" },
        { date: "2025-01-30", name: "Sonam Lhosar" },
        { date: "2025-02-19", name: "Democracy Day" },
        { date: "2025-02-26", name: "Maha Shivaratri" },
        { date: "2025-02-28", name: "Gyalpo Lhosar" },
        { date: "2025-03-08", name: "International Women's Day" },
        { date: "2025-03-13", name: "Holi (Hill regions)" },
        { date: "2025-03-14", name: "Holi (Terai regions)" },
        { date: "2025-03-29", name: "Ghode Jatra" },
        { date: "2025-04-14", name: "Nepali New Year" },
        { date: "2025-05-01", name: "Labor Day" },
        { date: "2025-05-12", name: "Buddha Jayanti" },
        { date: "2025-05-29", name: "Republic Day" },
        { date: "2025-08-09", name: "Janai Purnima" },
        { date: "2025-08-10", name: "Gai Jatra" },
        { date: "2025-08-16", name: "Krishna Janmashtami" },
        { date: "2025-08-26", name: "Teej (Haritalika)" },
        { date: "2025-09-19", name: "Constitution Day" },
        { date: "2025-09-22", name: "Ghatasthapana (Dashain Begins)" },
        { date: "2025-09-29", name: "Phulpati" },
        { date: "2025-09-30", name: "Maha Ashtami" },
        { date: "2025-10-01", name: "Maha Navami" },
        { date: "2025-10-02", name: "Vijaya Dashami" },
        { date: "2025-10-20", name: "Laxmi Puja" },
        { date: "2025-10-22", name: "Govardhan Puja" },
        { date: "2025-10-23", name: "Bhai Tika" },
        { date: "2025-12-25", name: "Christmas Day" },
        { date: "2025-12-30", name: "Tamu Lhosar" },
    ],
    "2026": [
        { date: "2026-01-01", name: "New Year's Day" },
        { date: "2026-01-15", name: "Maghe Sankranti" },
        { date: "2026-01-23", name: "Vasant Panchami" },
        { date: "2026-01-30", name: "Martyrs' Day" },
        { date: "2026-02-15", name: "Maha Shivaratri" },
        { date: "2026-02-19", name: "Democracy Day" },
        { date: "2026-03-02", name: "Holi (Hill regions)" },
        { date: "2026-03-03", name: "Holi (Terai regions)" },
        { date: "2026-03-08", name: "International Women's Day" },
        { date: "2026-04-14", name: "Nepali New Year" },
        { date: "2026-05-01", name: "Labor Day" },
        { date: "2026-05-29", name: "Republic Day" },
        { date: "2026-08-28", name: "Janai Purnima" },
        { date: "2026-09-04", name: "Krishna Janmashtami" },
        { date: "2026-09-14", name: "Teej (Haritalika)" },
        { date: "2026-09-19", name: "Constitution Day" },
        { date: "2026-10-11", name: "Ghatasthapana (Dashain Begins)" },
        { date: "2026-10-21", name: "Vijaya Dashami" },
        { date: "2026-11-08", name: "Laxmi Puja" },
        { date: "2026-11-10", name: "Govardhan Puja" },
        { date: "2026-11-11", name: "Bhai Tika" },
        { date: "2026-12-25", name: "Christmas Day" },
    ]
};

function flattenAndParseHolidays(data: typeof nepaliHolidaysSeedData): Omit<NepaliHoliday, 'id'>[] {
    const allHolidays: Omit<NepaliHoliday, 'id'>[] = [];
    for (const year in data) {
        // @ts-ignore
        for (const holiday of data[year]) {
            allHolidays.push({
                date: new Date(holiday.date),
                name: holiday.name,
            });
        }
    }
    return allHolidays;
}


async function seedHolidays(): Promise<NepaliHoliday[]> {
    console.log("Seeding holidays to Realtime Database...");
    const holidaysRef = ref(rtdb, 'holidays');
    
    // Using a simpler structure for the RTDB to make querying easier client-side
    // We will store as an array of objects
    const holidaysToSeed = flattenAndParseHolidays(nepaliHolidaysSeedData).map(h => ({
        // RTDB doesn't store Date objects, so we store ISO strings
        date: h.date.toISOString().split('T')[0], 
        name: h.name
    }));

    await set(holidaysRef, holidaysToSeed);
    
    console.log("Holidays successfully seeded to Realtime Database.");
    
    // Return the data in the format the app expects
    return holidaysToSeed.map((h, i) => ({
        id: String(i),
        name: h.name,
        date: new Date(h.date)
    }));
}

export async function getNepaliHolidays(): Promise<NepaliHoliday[]> {
  try {
    const holidaysRef = ref(rtdb, 'holidays');
    const snapshot = await get(holidaysRef);
    
    if (!snapshot.exists() || snapshot.val() === null) {
        // If no holidays are found, seed them from the static list
        console.log("No holidays found in Realtime Database, seeding now...");
        return await seedHolidays();
    }

    const holidaysFromDb: { date: string; name: string }[] = snapshot.val();
    const holidays: NepaliHoliday[] = holidaysFromDb.map((h, index) => ({
        id: String(index),
        name: h.name,
        date: new Date(h.date),
    }));
    
    return holidays;
  } catch (error) {
    console.error("Error fetching or seeding holidays from Realtime Database: ", error);
    // Fallback to static data in case of RTDB error
    const staticHolidays = flattenAndParseHolidays(nepaliHolidaysSeedData);
    return staticHolidays.map((h, i) => ({ ...h, id: `static-${i}` }));
  }
}
