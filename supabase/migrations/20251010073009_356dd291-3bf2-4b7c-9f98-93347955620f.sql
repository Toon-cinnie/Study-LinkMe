-- Create research table
CREATE TABLE public.research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  field TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  document_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create research_collaborations table
CREATE TABLE public.research_collaborations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_collaborations ENABLE ROW LEVEL SECURITY;

-- Research policies
CREATE POLICY "Research is viewable by everyone"
  ON public.research FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own research"
  ON public.research FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research"
  ON public.research FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research"
  ON public.research FOR DELETE
  USING (auth.uid() = user_id);

-- Research collaboration policies
CREATE POLICY "Users can view collaborations on their research or that they requested"
  ON public.research_collaborations FOR SELECT
  USING (
    auth.uid() = requester_id OR 
    EXISTS (
      SELECT 1 FROM research 
      WHERE research.id = research_collaborations.research_id 
      AND research.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create collaboration requests"
  ON public.research_collaborations FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Research owners can update collaboration status"
  ON public.research_collaborations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM research 
      WHERE research.id = research_collaborations.research_id 
      AND research.user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_research_updated_at
  BEFORE UPDATE ON public.research
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_research_collaborations_updated_at
  BEFORE UPDATE ON public.research_collaborations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();