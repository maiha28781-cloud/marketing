-- Add auto_track column to kpis table
ALTER TABLE kpis 
ADD COLUMN auto_track BOOLEAN DEFAULT false;
