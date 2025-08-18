
'use client';
import type { NepaliHoliday } from './types';
import { collection, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { getFirebaseApp } from './firebase';

const { db } = getFirebaseApp();

// Static list of holidays for 2024, 2025 and 2026 to be used for seeding the database.
const nepaliHolidaysSeedData: Omit<NepaliHoliday, 'id'>[] = [
    // 2024 Holidays
    { date: new Date('2024-01-11'), name: 'Prithvi Jayanti' },
    { date: new Date('2024-01-15'), name: 'Maghe Sankranti' },
    { date: new Date('2024-01-30'), name: 'Martyr\'s Day' },
    { date: new Date('2024-02-19'), name: 'Prajatantra Diwas (Democracy Day)' },
    { date: new Date('2024-03-08'), name: 'Maha Shivaratri' },
    { date: new Date('2024-03-08'), name: 'Nari Diwas (International Women\'s Day)' },
    { date: new Date('2024-03-24'), name: 'Holi' },
    { date: new Date('2024-04-08'), name: 'Ghode Jatra' },
    { date: new Date('2024-04-13'), name: 'Nepali New Year (Baishakh 1)' },
    { date: new Date('2024-05-01'), name: 'Majdoor Diwas (Labour Day)' },
    { date: new Date('2024-05-23'), name: 'Buddha Jayanti' },
    { date: new Date('2024-05-28'), name: 'Ganatantra Diwas (Republic Day)' },
    { date: new Date('2024-08-19'), name: 'Janai Purnima / Raksha Bandhan' },
    { date: new Date('2024-08-20'), name: 'Gai Jatra' },
    { date: new Date('2024-08-26'), name: 'Gaura Parba' },
    { date: new Date('2024-09-06'), name: 'Krishna Janmashtami' },
    { date: new Date('2024-09-03'), name: 'Teej' },
    { date: new Date('2024-09-17'), name: 'Indra Jatra' },
    { date: new Date('2024-09-19'), name: 'Constitution Day (Sambidhan Diwas)' },
    { date: new Date('2024-10-03'), name: 'Ghatasthapana (Dashain Starts)' },
    { date: new Date('2024-10-09'), name: 'Dashain Holiday' },
    { date: new Date('2024-10-10'), name: 'Fulpati (Dashain)' },
    { date: new Date('2024-10-11'), name: 'Maha Astami (Dashain)' },
    { date: new Date('2024-10-12'), name: 'Maha Navami (Dashain)' },
    { date: new Date('2024-10-13'), name: 'Vijaya Dashami (Dashain)' },
    { date: new Date('2024-10-14'), name: 'Dashain Holiday (Ekadashi)' },
    { date: new Date('2024-10-15'), name: 'Dashain Holiday (Dwadashi)' },
    { date: new Date('2024-10-16'), name: 'Dashain Holiday (Trayodashi)' },
    { date: new Date('2024-10-17'), name: 'Kojagrat Purnima (Dashain Ends)' },
    { date: new Date('2024-10-31'), name: 'Laxmi Puja (Tihar)' },
    { date: new Date('2024-11-01'), name: 'Mha Puja (Tihar)' },
    { date: new Date('2024-11-02'), name: 'Bhai Tika (Tihar)' },
    { date: new Date('2024-11-07'), name: 'Chhath Puja' },
    { date: new Date('2024-12-25'), name: 'Christmas Day' },
    { date: new Date('2024-12-30'), name: 'Tamu Lhosar' },
    // 2025 Holidays
    { date: new Date('2025-01-01'), name: "New Year's Day" },
    { date: new Date('2025-01-15'), name: "Maghe Sankranti" },
    { date: new Date('2025-01-26'), name: "Vasant Panchami" },
    { date: new Date('2025-01-30'), name: "Martyrs' Day" },
    { date: new Date('2025-02-07'), name: "Democracy Day" },
    { date: new Date('2025-02-13'), name: "Maha Shivaratri" },
    { date: new Date('2025-02-26'), name: "Holi" },
    { date: new Date('2025-03-08'), name: "International Women's Day" },
    { date: new Date('2025-03-13'), name: "Ghode Jatra" },
    { date: new Date('2025-04-13'), name: "Chaitra Dashain" },
    { date: new Date('2025-04-14'), name: "Nepali New Year" },
    { date: new Date('2025-05-01'), name: "Labor Day" },
    { date: new Date('2025-05-12'), name: "Buddha Jayanti" },
    { date: new Date('2025-05-29'), name: "Republic Day" },
    { date: new Date('2025-08-11'), name: "Janai Purnima" },
    { date: new Date('2025-08-19'), name: "Gai Jatra" },
    { date: new Date('2025-08-26'), name: "Krishna Janmashtami" },
    { date: new Date('2025-09-07'), name: "Teej (Haritalika)" },
    { date: new Date('2025-09-17'), name: "Rishi Panchami" },
    { date: new Date('2025-10-02'), name: "Ghatasthapana (Dashain Begins)" },
    { date: new Date('2025-10-10'), name: "Vijaya Dashami" },
    { date: new Date('2025-10-21'), name: "Laxmi Puja" },
    { date: new Date('2025-10-23'), name: "Govardhan Puja" },
    { date: new Date('2025-12-25'), name: "Christmas Day" },
    { date: new Date('2025-12-30'), name: "Tamu Lhosar" },
    // 2026 Holidays
    { date: new Date('2026-01-01'), name: "New Year's Day" },
    { date: new Date('2026-01-15'), name: "Maghe Sankranti" },
    { date: new Date('2026-01-30'), name: "Martyrs' Day" },
    { date: new Date('2026-02-07'), name: "Democracy Day" },
    { date: new Date('2026-02-14'), name: "Vasant Panchami" },
    { date: new Date('2026-02-21'), name: "Sonam Lhosar" },
    { date: new Date('2026-03-03'), name: "Maha Shivaratri" },
    { date: new Date('2026-03-08'), name: "International Women's Day" },
    { date: new Date('2026-03-14'), name: "Holi" },
    { date: new Date('2026-04-14'), name: "Nepali New Year" },
    { date: new Date('2026-05-01'), name: "Labor Day" },
    { date: new Date('2026-05-29'), name: "Republic Day" },
    { date: new Date('2026-05-31'), name: "Buddha Jayanti" },
    { date: new Date('2026-08-15'), name: "Krishna Janmashtami" },
    { date: new Date('2026-08-30'), name: "Janai Purnima" },
    { date: new Date('2026-09-26'), name: "Teej (Haritalika)" },
    { date: new Date('2026-10-21'), name: "Ghatasthapana (Dashain Begins)" },
    { date: new Date('2026-10-29'), name: "Vijaya Dashami" },
    { date: new Date('2026-11-09'), name: "Laxmi Puja" },
    { date: new Date('2026-11-11'), name: "Govardhan Puja" },
    { date: new Date('2026-12-25'), name: "Christmas Day" },
];

async function seedHolidays(): Promise<NepaliHoliday[]> {
    console.log("Seeding holidays to Firestore...");
    const batch = writeBatch(db);
    const holidaysRef = collection(db, 'holidays');
    
    const seededHolidays: NepaliHoliday[] = [];

    nepaliHolidaysSeedData.forEach(holiday => {
        const docRef = collection(holidaysRef).doc(); // Auto-generate ID
        batch.set(docRef, {
            name: holiday.name,
            date: Timestamp.fromDate(holiday.date),
        });
        seededHolidays.push({ id: docRef.id, ...holiday });
    });

    await batch.commit();
    console.log("Holidays successfully seeded.");
    return seededHolidays;
}

export async function getNepaliHolidays(): Promise<NepaliHoliday[]> {
  try {
    const holidaysRef = collection(db, 'holidays');
    const querySnapshot = await getDocs(holidaysRef);
    
    if (querySnapshot.empty) {
        // If no holidays are found, seed them from the static list
        return await seedHolidays();
    }

    const holidays: NepaliHoliday[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        holidays.push({
            id: doc.id,
            name: data.name,
            date: (data.date as Timestamp).toDate(),
        });
    });
    return holidays;
  } catch (error) {
    console.error("Error fetching or seeding holidays: ", error);
    // Fallback to static data in case of Firestore error
    return nepaliHolidaysSeedData.map((h, i) => ({ ...h, id: `static-${i}` }));
  }
}
