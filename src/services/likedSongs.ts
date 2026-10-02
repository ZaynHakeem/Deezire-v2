import { Track } from "../types";
import { isValidTrack } from "../utils/storageGuards";
import { supabase } from "./supabase";

let saveChain: Promise<void> = Promise.resolve();

export async function loadRemoteLikes(userId: string): Promise<Track[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("liked_songs")
    .select("track")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? [])
    .map((row) => row.track)
    .filter((track): track is Track => isValidTrack(track));
}

async function writeRemoteLikes(userId: string, tracks: Track[]) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("liked_songs")
    .select("track_id")
    .eq("user_id", userId);
  if (error) throw error;
  const remoteIds = new Set(
    (data ?? []).map((row) => Number(row.track_id)),
  );
  const localIds = new Set(tracks.map((track) => track.id));
  const removed = [...remoteIds].filter((id) => !localIds.has(id));
  if (removed.length) {
    const { error: deleteError } = await supabase
      .from("liked_songs")
      .delete()
      .eq("user_id", userId)
      .in("track_id", removed);
    if (deleteError) throw deleteError;
  }
  if (!tracks.length) return;
  const { error: upsertError } = await supabase.from("liked_songs").upsert(
    tracks.map((track) => ({
      user_id: userId,
      track_id: track.id,
      track,
    })),
    { onConflict: "user_id,track_id" },
  );
  if (upsertError) throw upsertError;
}

export function saveRemoteLikes(userId: string, tracks: Track[]) {
  const snapshot = tracks.slice();
  saveChain = saveChain
    .catch(() => undefined)
    .then(() => writeRemoteLikes(userId, snapshot));
  return saveChain;
}
