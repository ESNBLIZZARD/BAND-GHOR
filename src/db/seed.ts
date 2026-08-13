import { db } from './index.ts';
import { bands, tracks } from './schema.ts';

const SEED_BANDS = [
  { id: 'b1', slug: 'fossils', name: 'Fossils', bengaliName: 'ফসিলস', originCity: 'Kolkata', formationYear: 1998, featured: true },
  { id: 'b2', slug: 'moheener-ghoraguli', name: 'Moheener Ghoraguli', bengaliName: 'মহীনের ঘোড়াগুলি', originCity: 'Kolkata', formationYear: 1975, featured: true },
  { id: 'b3', slug: 'chandrabindoo', name: 'Chandrabindoo', bengaliName: 'চন্দ্রবিন্দু', originCity: 'Kolkata', formationYear: 1989, featured: true },
  { id: 'b4', slug: 'cactus', name: 'Cactus', bengaliName: 'ক্যাকটাস', originCity: 'Kolkata', formationYear: 1992, featured: true },
  { id: 'b5', slug: 'artcell', name: 'Artcell', bengaliName: 'আর্টসেল', originCity: 'Dhaka', formationYear: 1999, featured: true },
  { id: 'b6', slug: 'ashes', name: 'Ashes', bengaliName: 'অ্যাশেজ', originCity: 'Dhaka', formationYear: 2006, featured: true },
  { id: 'b7', slug: 'prithibi', name: 'Prithibi', bengaliName: 'পৃথিবী', originCity: 'Kolkata', formationYear: 2001, featured: true },
  { id: 'b8', slug: 'odd-signature', name: 'Odd Signature', bengaliName: 'অড সিগনেচার', originCity: 'Dhaka', formationYear: 2017, featured: true },
  { id: 'b9', slug: 'shironamhin', name: 'Shironamhin', bengaliName: 'শিরোনামহীন', originCity: 'Dhaka', formationYear: 1996, featured: true },
  { id: 'b10', slug: 'warfaze', name: 'Warfaze', bengaliName: 'ওয়ারফেইজ', originCity: 'Dhaka', formationYear: 1984, featured: true },
  { id: 'b11', slug: 'aurthohin', name: 'Aurthohin', bengaliName: 'অর্থহীন', originCity: 'Dhaka', formationYear: 1998, featured: true },
  { id: 'b12', slug: 'nemesis', name: 'Nemesis', bengaliName: 'নেমেসিস', originCity: 'Dhaka', formationYear: 1999, featured: true }
];

const SEED_TRACKS = [
  { id: 't1', slug: 'hasnuhana', title: 'Hasnuhana', bengaliTitle: 'হাসনুহানা', bandId: 'b1', youtubeVideoId: 'OERD-4VV57s', durationSeconds: 278, artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't2', slug: 'tomake', title: 'Tomake', bengaliTitle: 'তোমাকে', bandId: 'b2', youtubeVideoId: 'i9ZHdIbpXDU', durationSeconds: 260, artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't3', slug: 'bhindeshi-tara', title: 'Bhindeshi Tara', bengaliTitle: 'ভিনদেশী তারা', bandId: 'b3', youtubeVideoId: 'B0ECFWqrJSQ', durationSeconds: 268, artworkUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't4', slug: 'halud-pakhi', title: 'Halud Pakhi', bengaliTitle: 'হলুদ পাখি', bandId: 'b4', youtubeVideoId: 'dC-JwLbSVVA', durationSeconds: 275, artworkUrl: 'https://images.unsplash.com/photo-1507808973436-a4ed7b5e87c9?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't5', slug: 'poth-geche-beke', title: 'Poth Geche Beke', bengaliTitle: 'পথ গেছে বেঁকে', bandId: 'b5', youtubeVideoId: '5vlhtQl7-bM', durationSeconds: 312, artworkUrl: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=1000&auto=format&fit=crop', featured: true },
  
  /* Fossils Album */
  { id: 't6', slug: 'ekla-ghor', title: 'Ekla Ghor', bengaliTitle: 'একলা ঘর', bandId: 'b1', youtubeVideoId: 'BlRrMZ4RIx4', durationSeconds: 320, artworkUrl: 'https://images.unsplash.com/photo-1518873890627-d4b177c06e51?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't7', slug: 'aro-ekbar', title: 'Aro Ekbar', bengaliTitle: 'আরো একবার', bandId: 'b1', youtubeVideoId: 'Jz2WVoc1lOg', durationSeconds: 290, artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't8', slug: 'bicycle-chor', title: 'Bicycle Chor', bengaliTitle: 'বাইসাইকেল চোর', bandId: 'b1', youtubeVideoId: '-TfydgNsqEc', durationSeconds: 300, artworkUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=1000&auto=format&fit=crop', featured: false },
  { id: 't9', slug: 'nemesis', title: 'Nemesis', bengaliTitle: 'নেমেসিস', bandId: 'b1', youtubeVideoId: 'ouBGfi55OEQ', durationSeconds: 285, artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', featured: false },
  { id: 't10', slug: 'bishakto-manush', title: 'Bishakto Manush', bengaliTitle: 'বিষাক্ত মানুষ', bandId: 'b1', youtubeVideoId: 'fYKipzYTnZ0', durationSeconds: 295, artworkUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1000&auto=format&fit=crop', featured: false },
  { id: 't11', slug: 'millennium', title: 'Millennium', bengaliTitle: 'মিলেনিয়াম', bandId: 'b1', youtubeVideoId: 'AbNcxusfGDQ', durationSeconds: 270, artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Ashes */
  { id: 't12', slug: 'charpoka', title: 'Charpoka', bengaliTitle: 'ছারপোকা', bandId: 'b6', youtubeVideoId: '2Vh1D3_NcQM', durationSeconds: 250, artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't13', slug: 'holud-bari', title: 'Holud Bari', bengaliTitle: 'হলুদ বাড়ি', bandId: 'b6', youtubeVideoId: '3J7uk1Go3T8', durationSeconds: 240, artworkUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Prithibi */
  { id: 't14', slug: 'kichhu-kotha', title: 'Kichhu Kotha', bengaliTitle: 'কিছু কথা', bandId: 'b7', youtubeVideoId: 'wiO2VJCMgUo', durationSeconds: 310, artworkUrl: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?q=80&w=1000&auto=format&fit=crop', featured: true },
  
  /* Odd Signature */
  { id: 't15', slug: 'amar-dehokhan', title: 'Amar Dehokhan', bengaliTitle: 'আমার দেহখান', bandId: 'b8', youtubeVideoId: 'bhdDznpJRkw', durationSeconds: 275, artworkUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't16', slug: 'ghum', title: 'Ghum', bengaliTitle: 'ঘুম', bandId: 'b8', youtubeVideoId: '9DjeWYS52kY', durationSeconds: 265, artworkUrl: 'https://images.unsplash.com/photo-1483086431886-3590a88317fe?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Additional Fossils */
  { id: 't17', slug: 'kheno-korle-erom', title: 'Kheno Korle Erom', bengaliTitle: 'কেন করলে এরম', bandId: 'b1', youtubeVideoId: 'hJ6y6mtUoio', durationSeconds: 310, artworkUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't18', slug: 'shasti', title: 'Shasti', bengaliTitle: 'শাস্তি', bandId: 'b1', youtubeVideoId: '4KTBv3CQvVc', durationSeconds: 290, artworkUrl: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Additional Ashes */
  { id: 't19', slug: 'ure-jak', title: 'Ure Jak', bengaliTitle: 'উড়ে যাক', bandId: 'b6', youtubeVideoId: 'PoQFP-sb-uQ', durationSeconds: 260, artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', featured: true },
  
  /* Additional Artcell */
  { id: 't20', slug: 'oniket-prantor', title: 'Oniket Prantor', bengaliTitle: 'অনিকেত প্রান্তর', bandId: 'b5', youtubeVideoId: 'qw1CVt43VKw', durationSeconds: 980, artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't21', slug: 'dukkho-bilash', title: 'Dukkho Bilash', bengaliTitle: 'দুঃখ বিলাস', bandId: 'b5', youtubeVideoId: 'WPxfbxbE9ak', durationSeconds: 350, artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Shironamhin */
  { id: 't22', slug: 'hasnater-gaan', title: 'Hasnater Gaan', bengaliTitle: 'হাসনাতের গান', bandId: 'b9', youtubeVideoId: 'rZzSUFt4ziA', durationSeconds: 285, artworkUrl: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't23', slug: 'ei-obelay', title: 'Ei Obelay', bengaliTitle: 'এই অবেলায়', bandId: 'b9', youtubeVideoId: 'r9AbuWA1zjc', durationSeconds: 295, artworkUrl: 'https://images.unsplash.com/photo-1507808973436-a4ed7b5e87c9?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Warfaze */
  { id: 't24', slug: 'purnota', title: 'Purnota', bengaliTitle: 'পূর্ণতা', bandId: 'b10', youtubeVideoId: 'uB2rhjulY4Q', durationSeconds: 320, artworkUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop', featured: true },
  { id: 't25', slug: 'oshamajik', title: 'Oshamajik', bengaliTitle: 'অসামাজিক', bandId: 'b10', youtubeVideoId: 'OK7ztslIQTE', durationSeconds: 310, artworkUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop', featured: false },
  
  /* Aurthohin */
  { id: 't26', slug: 'chaite-paro', title: 'Chaite Paro', bengaliTitle: 'চাইতে পারো', bandId: 'b11', youtubeVideoId: 'gYpjVhB6QVs', durationSeconds: 275, artworkUrl: 'https://images.unsplash.com/photo-1620336655055-088d06e36bf0?q=80&w=1000&auto=format&fit=crop', featured: true },
  
  /* Nemesis */
  { id: 't27', slug: 'kobe', title: 'Kobe', bengaliTitle: 'কবে', bandId: 'b12', youtubeVideoId: 't-_SbDuqxQc', durationSeconds: 265, artworkUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1000&auto=format&fit=crop', featured: true },
  
  /* Requested by User */
  { id: 't28', slug: 'khoro-amar', title: 'Khoro Amar', bengaliTitle: 'খড়ো আমার', bandId: 'b1', youtubeVideoId: '4mLAIoqLYuQ', durationSeconds: 311, artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop', featured: true }
];

export async function seedDatabase() {
  console.log('Seeding bands...');
  for (const band of SEED_BANDS) {
    await db.insert(bands).values(band).onConflictDoNothing();
  }
  
  console.log('Seeding tracks...');
  for (const track of SEED_TRACKS) {
    await db.insert(tracks).values(track).onConflictDoUpdate({
      target: tracks.id,
      set: {
        youtubeVideoId: track.youtubeVideoId,
        title: track.title,
        bengaliTitle: track.bengaliTitle,
        artworkUrl: track.artworkUrl,
        durationSeconds: track.durationSeconds
      }
    });
  }
  
  console.log('Database seeded successfully.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
