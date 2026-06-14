import { createClient } from '@supabase/supabase-js';

// Supabase Configuration Helper
// This file sets up the standard Supabase client.
// It falls back to a dummy client for frontend prototyping so it does not block execution if credentials are empty.

const supabaseUrl = 'https://cgswxfwxgojwhqqmlyol.supabase.co';
const supabaseAnonKey = 'sb_publishable_no0jl_RkjPe5jPIwhdfjmw_yJPTHoMb';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Realtime listeners subscription helper
export const subscribeToTimeline = (projectId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`project-timeline-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'timelines',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};

export const subscribeToMessages = (projectId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`project-messages-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};
