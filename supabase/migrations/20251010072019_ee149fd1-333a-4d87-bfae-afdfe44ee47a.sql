-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_skills junction table
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task_skills junction table
CREATE TABLE public.task_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  UNIQUE(task_id, skill_id)
);

-- Create bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  proposal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(task_id, freelancer_id)
);

-- Enable RLS
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skills (public read)
CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

-- RLS Policies for user_skills
CREATE POLICY "Users can view all user skills"
  ON public.user_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON public.user_skills FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Tasks are viewable by everyone"
  ON public.tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Task owners can update their tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

CREATE POLICY "Task owners can delete their tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = client_id);

-- RLS Policies for task_skills
CREATE POLICY "Task skills are viewable by everyone"
  ON public.task_skills FOR SELECT
  USING (true);

CREATE POLICY "Task owners can manage task skills"
  ON public.task_skills FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_skills.task_id
    AND tasks.client_id = auth.uid()
  ));

-- RLS Policies for bids
CREATE POLICY "Users can view bids on their tasks"
  ON public.bids FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = bids.task_id
      AND tasks.client_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can create bids"
  ON public.bids FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can update own bids"
  ON public.bids FOR UPDATE
  USING (auth.uid() = freelancer_id AND status = 'pending');

CREATE POLICY "Task owners can update bid status"
  ON public.bids FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = bids.task_id
    AND tasks.client_id = auth.uid()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert some common skills
INSERT INTO public.skills (name, category) VALUES
  ('Academic Writing', 'Writing'),
  ('Data Analysis', 'Technical'),
  ('Programming', 'Technical'),
  ('Mobile Development', 'Technical'),
  ('Research', 'Academic'),
  ('Mathematics', 'Academic'),
  ('Physics', 'Academic'),
  ('Chemistry', 'Academic'),
  ('Biology', 'Academic'),
  ('Economics', 'Academic'),
  ('Tutoring', 'Teaching'),
  ('Essay Review', 'Writing'),
  ('Proofreading', 'Writing');