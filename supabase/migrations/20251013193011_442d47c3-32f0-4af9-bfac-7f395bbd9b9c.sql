-- Ensure policy exists to allow adding others
DROP POLICY IF EXISTS "Participants can add others to their conversations" ON public.conversation_participants;
CREATE POLICY "Participants can add others to their conversations"
ON public.conversation_participants
FOR INSERT
WITH CHECK (public.is_conversation_participant(auth.uid(), conversation_id));