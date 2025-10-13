-- Create security definer function to check if user is in a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants
    WHERE user_id = _user_id
      AND conversation_id = _conversation_id
  )
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their conversations" ON public.messages;

-- Recreate policies using the security definer function
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can view conversations they're part of"
ON public.conversations
FOR SELECT
USING (public.is_conversation_participant(auth.uid(), id));

CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (public.is_conversation_participant(auth.uid(), id));

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (public.is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can send messages to their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND public.is_conversation_participant(auth.uid(), conversation_id)
);