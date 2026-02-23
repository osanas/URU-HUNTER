-- Ajoute facebook_user_id pour le callback de suppression de données Meta
ALTER TABLE public.meta_accounts
ADD COLUMN IF NOT EXISTS facebook_user_id text;

CREATE INDEX IF NOT EXISTS meta_accounts_facebook_user_id_idx 
ON public.meta_accounts(facebook_user_id);
