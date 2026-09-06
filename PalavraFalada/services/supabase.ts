import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// constantes que lêem o process.env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validando as variáveis
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL e Anon Key precisam estar definidas no .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);