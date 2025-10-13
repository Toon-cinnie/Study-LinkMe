-- Function to auto-add creator as participant
CREATE OR REPLACE FUNCTION public.add_creator_as_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add the current authenticated user as a participant for the new conversation
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (NEW.id, auth.uid());
  RETURN NEW;
END;
$$;

-- Create trigger to run after inserting a conversation
DROP TRIGGER IF EXISTS trg_add_creator_participant ON public.conversations;
CREATE TRIGGER trg_add_creator_participant
AFTER INSERT ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.add_creator_as_participant();