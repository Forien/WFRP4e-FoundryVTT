return ([game.i18n.localize("NAME.AnimalCare"), game.i18n.localize("NAME.CharmAnimal")].includes(args.item?.name) || args.item?.name.includes(game.i18n.localize("NAME.Ride")) || args.item?.name.includes(game.i18n.localize("NAME.AnimalTraining")));