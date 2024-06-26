let skill = `Language (Magick)`
let currentCareer = this.actor.system.currentCareer;
let existingSkill = this.actor.itemTypes.skill.find(i => i.name == skill);

if (!currentCareer) return


let inCurrentCareer = currentCareer.system.skills.includes(skill);
let witchAdded = actor.getFlag("wfrp4e", "witchAdded") || {};
if (existingSkill && inCurrentCareer && !witchAdded[existingSkill.name])
{
	existingSkill.system.advances.costModifier = -5;
}
else 
{
	witchAdded[skill] = true;
	currentCareer.system.skills.push(skill);
	setProperty(this.actor, "flags.wfrp4e.witchAdded", witchAdded)
}