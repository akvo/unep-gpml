ALTER TABLE public.stakeholder_badge DROP CONSTRAINT stakeholder_badge_stakeholder_id_fkey;
ALTER TABLE public.stakeholder_badge
  ADD CONSTRAINT stakeholder_badge_stakeholder_id_fkey FOREIGN KEY (stakeholder_id) REFERENCES stakeholder(id) ON DELETE CASCADE;
