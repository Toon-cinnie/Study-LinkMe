-- Ensure unique participant per conversation and make trigger idempotent
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversation_participants_unique
ON public.conversation_participants (conversation_id, user_id);

-- Make trigger safe if row already exists
CREATE OR REPLACE FUNCTION public.add_creator_as_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (NEW.id, auth.uid())
  ON CONFLICT (conversation_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it exists (idempotent)
DROP TRIGGER IF EXISTS trg_add_creator_participant ON public.conversations;
CREATE TRIGGER trg_add_creator_participant
AFTER INSERT ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.add_creator_as_participant();