import { createClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get credentials from env or local storage fallback
export const getSupabaseCredentials = (): SupabaseConfig => {
  const storedUrl = localStorage.getItem('supabase_url');
  const storedKey = localStorage.getItem('supabase_anon_key');

  return {
    url: storedUrl || ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '',
    anonKey: storedKey || ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || ''
  };
};

export const saveSupabaseCredentials = (url: string, anonKey: string) => {
  if (url && anonKey) {
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_anon_key', anonKey);
  } else {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
  }
};

// Create dynamic Supabase client
export const getSupabaseClient = () => {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) {
    return null;
  }
  try {
    return createClient(url, anonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

// Types for pirate logs stored on Supabase
export interface PirateProgress {
  id?: string;
  updated_at?: string;
  current_story_id: string;
  current_page_num: number;
  relics_json: string; // JSON string representing collected relics
  ambient_volume: number;
  voice_engine: 'gemini' | 'edge';
  narrator_id: string;
  user_tag?: string; // pirate tag name
}

/**
 * Saves progress to Supabase pirate_progress table.
 * Fallbacks to local storage if credentials are not configured.
 */
export const saveProgressToSupabase = async (progress: PirateProgress): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Return mock success with warning to let frontend handle local state gracefully
    return { success: false, error: 'Supabase credentials not set' };
  }

  try {
    const userTag = progress.user_tag || 'Anonyme';
    
    // We insert or upsert the progress based on the user_tag
    const { error } = await supabase
      .from('pirate_progress')
      .upsert({
        user_tag: userTag,
        current_story_id: progress.current_story_id,
        current_page_num: progress.current_page_num,
        relics_json: progress.relics_json,
        ambient_volume: progress.ambient_volume,
        voice_engine: progress.voice_engine,
        narrator_id: progress.narrator_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_tag' });

    if (error) {
      console.warn('Supabase save error (make sure pirate_progress table exists):', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase exception:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Loads progress from Supabase.
 */
export const loadProgressFromSupabase = async (userTag: string): Promise<PirateProgress | null> => {
  const supabase = getSupabaseClient();
  if (!supabase || !userTag) return null;

  try {
    const { data, error } = await supabase
      .from('pirate_progress')
      .select('*')
      .eq('user_tag', userTag)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }

    return data as PirateProgress;
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
};
