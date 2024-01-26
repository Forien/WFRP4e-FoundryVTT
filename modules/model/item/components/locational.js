import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class LocationalItemModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.prompt = new fields.BooleanField();
        schema.location = new fields.SchemaField({
            value: new fields.StringField(),
            key: new fields.StringField(),
        })
        return schema;
    }


    async preCreateData(data, options, user) {
        let preCreateData = await super.preCreateData(data, options, user);

        if (this.parent.isOwned)
        {
            this.checkSourceTest(); // If this item has a source test, use that location
            
            let location = this.location.key
            if (!location && this.prompt) {
                await this.promptLocation()
            }
            else if (location && !options.skipLocationValue) // The location key might already be defined, but not the display value, so set that accordingly
            {
                this.updateSource({"location.value" : game.wfrp4e.config.locations[location]})
            }
        }
        return preCreateData;
    }

    checkSourceTest()
    {
        let sourceMessageId = this.parent.getFlag("wfrp4e", "sourceMessageId")
        let actor = this.parent?.actor;
        
        if (sourceMessageId && actor)
        {

            let message = game.messages.get(sourceMessageId);
            // Might come from single or opposed test
            let test = message.getTest(); 
            let opposed = message.getOpposedTest();

            if (test)
            {
                this.updateSource({"location.key" : actor.convertHitLoc(test.result.hitloc.result)})
            }
            else if (opposed)
            {
                // Opposed test already compute the "true" hit location
                this.updateSource({"location.key" : opposed.result.hitloc.value})
            }
        }
    }

    async promptLocation() {
        let location = await Dialog.wait({
            title: game.i18n.localize("Location"),
            content: "Choose Location",
            buttons: {
                l: {
                    label: `${game.i18n.localize("Left")} ${this.location.value}`,
                    callback: () => {
                        return "l";
                    }
                },
                r: {
                    label: `${game.i18n.localize("Right")} ${this.location.value}`,
                    callback: () => {
                        return "r";
                    }
                }
            }
        })


        let displayLocation = this.location.value;

        if (location == "l") {
            displayLocation = `${game.i18n.localize("Left")} ${this.location.value}`
        }
        if (location == "r") {
            displayLocation = `${game.i18n.localize("Right")} ${this.location.value}`
        }

        this.parent.updateSource({ "system.location": { key: location + this.location.value, value: displayLocation } })
    }

    usesLocation(weapon) {
        let actor = this.parent?.actor;
        if (!this.location.key || !actor || !weapon.isEquipped) {
            return false;
        }
        
        // At this point, we know weapon is equipped

        if (weapon.system.twohanded.value)
        {
            return true;
        }

        if (actor.mainArmLoc == this.location.key) {
            return !weapon.system.offhand.value // If not in offhand, it is in the main hand
        }
        else if (actor.secondaryArmLoc == this.location.key) {
            return weapon.system.offhand.value
        }
    }

    get weaponsAtLocation() {
        return this.parent?.actor?.itemTypes.weapon.filter(weapon => this.usesLocation(weapon)) || []
    }
}