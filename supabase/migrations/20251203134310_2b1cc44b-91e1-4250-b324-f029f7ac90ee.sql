-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.complaint_status AS ENUM ('SUBMITTED', 'AI_PROCESSED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');
CREATE TYPE public.priority_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE public.notification_type AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  language_pref TEXT DEFAULT 'English',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table (SEPARATE from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create sequence for complaint ID
CREATE SEQUENCE IF NOT EXISTS complaint_id_seq START 1;

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id TEXT NOT NULL UNIQUE DEFAULT 'JC-' || TO_CHAR(NOW(), 'YYYY') || '-00000',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status complaint_status DEFAULT 'SUBMITTED' NOT NULL,
  priority priority_level DEFAULT 'MEDIUM' NOT NULL,
  location TEXT,
  geo_lat DECIMAL(10, 8),
  geo_lng DECIMAL(11, 8),
  attachments TEXT[],
  language TEXT DEFAULT 'English',
  sentiment_score DECIMAL(3, 2),
  ai_classification JSONB,
  department_id UUID REFERENCES public.departments(id),
  assigned_to UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create complaint timeline table
CREATE TABLE public.complaint_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE NOT NULL,
  status complaint_status NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type DEFAULT 'EMAIL' NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Generate complaint ID function
CREATE OR REPLACE FUNCTION public.generate_complaint_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.complaint_id := 'JC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('complaint_id_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$;

-- Trigger for generating complaint ID
CREATE TRIGGER set_complaint_id
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_complaint_id();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Handle new user trigger (create profile automatically)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for departments
CREATE POLICY "Anyone can view departments" ON public.departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for complaints
CREATE POLICY "Users can view own complaints" ON public.complaints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own complaints" ON public.complaints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all complaints" ON public.complaints
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all complaints" ON public.complaints
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- RLS Policies for complaint_timeline
CREATE POLICY "Users can view own complaint timeline" ON public.complaint_timeline
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.complaints c WHERE c.id = complaint_timeline.complaint_id AND c.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage timeline" ON public.complaint_timeline
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "System can insert timeline" ON public.complaint_timeline
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Enable realtime for complaints and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
  ('Road & Transport', 'Handles road maintenance, traffic, and transport issues'),
  ('Water Supply', 'Manages water supply and distribution problems'),
  ('Electricity', 'Handles electricity and power-related complaints'),
  ('Sanitation', 'Manages waste management and sanitation issues'),
  ('Public Health', 'Handles health-related complaints and facilities'),
  ('Education', 'Manages educational institution complaints'),
  ('Housing', 'Handles housing and accommodation issues'),
  ('Law & Order', 'Manages law enforcement related complaints'),
  ('Environment', 'Handles environmental and pollution complaints'),
  ('General', 'For miscellaneous complaints');