import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bands = pgTable('bands', {
  id: text('id').primaryKey(), // using slug as ID for simplicity or UUID
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  bengaliName: text('bengali_name'),
  originCity: text('origin_city'),
  bio: text('bio'),
  formationYear: integer('formation_year'),
  image: text('image'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const albums = pgTable('albums', {
  id: text('id').primaryKey(),
  bandId: text('band_id').references(() => bands.id).notNull(),
  title: text('title').notNull(),
  bengaliTitle: text('bengali_title'),
  releaseYear: integer('release_year'),
  artworkUrl: text('artwork_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const trackStatusEnum = pgEnum('track_status', ['PUBLISHED', 'UNAVAILABLE']);

export const tracks = pgTable('tracks', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  bengaliTitle: text('bengali_title'),
  bandId: text('band_id').references(() => bands.id).notNull(),
  albumId: text('album_id').references(() => albums.id),
  youtubeVideoId: text('youtube_video_id').notNull(),
  durationSeconds: integer('duration_seconds'),
  editorialScore: integer('editorial_score').default(0),
  featured: boolean('featured').default(false),
  status: trackStatusEnum('status').default('PUBLISHED'),
  artworkUrl: text('artwork_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bandsRelations = relations(bands, ({ many }) => ({
  albums: many(albums),
  tracks: many(tracks),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
  band: one(bands, {
    fields: [albums.bandId],
    references: [bands.id],
  }),
  tracks: many(tracks),
}));

export const tracksRelations = relations(tracks, ({ one }) => ({
  band: one(bands, {
    fields: [tracks.bandId],
    references: [bands.id],
  }),
  album: one(albums, {
    fields: [tracks.albumId],
    references: [albums.id],
  }),
}));
