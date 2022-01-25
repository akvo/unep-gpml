ALTER TABLE stakeholder_initiative
ADD CONSTRAINT stakeholder_initiative_association_key UNIQUE (stakeholder, initiative, association);
