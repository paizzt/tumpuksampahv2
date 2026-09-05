-- Create pickup_tasks table
CREATE TABLE public.pickup_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
    business_id UUID REFERENCES public.business_registrations(id) ON DELETE CASCADE,
    minjel_id UUID REFERENCES public.minjel_registrations(id) ON DELETE CASCADE,
    
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    scheduled_date DATE NOT NULL,
    weight_kg NUMERIC(10,2),
    report_notes TEXT,
    handled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure exactly one client reference is set
    CHECK (
        (registration_id IS NOT NULL)::integer + 
        (business_id IS NOT NULL)::integer + 
        (minjel_id IS NOT NULL)::integer = 1
    )
);

-- Enable RLS
ALTER TABLE public.pickup_tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and update
CREATE POLICY "Allow authenticated read pickup_tasks"
ON public.pickup_tasks
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated insert pickup_tasks"
ON public.pickup_tasks
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update pickup_tasks"
ON public.pickup_tasks
FOR UPDATE
USING (auth.role() = 'authenticated');
