/*
The parameter interpreter reads the custom parameters and transforms them into objects to be used by the plugin
*/
AoeParameterInterpreter = {
	_getObjectRangeType: function(object) {
		return object.rangeType;
	},

	getEffectRangeType: function(item) {
		return this._getObjectRangeType(item.custom.aoe.effectRange);
	},

	getSelectionRangeType: function(item) {
		return this._getObjectRangeType(item.custom.aoe.selectionRange);
	},

	getWeapon: function(item, unit) {
		//if a function is passed as weapon, it should handle a false unit so that the item info can work.
		if(item.custom.aoe.weapon != null) {
			if(typeof item.custom.aoe.weapon == "function") {
				return item.custom.aoe.weapon(unit); 
			}
			return root.getBaseData().getWeaponList().getDataFromId(item.custom.aoe.weapon);
		}
		return null;
	},

	getUseArray: function(item) {
		if(item.custom.aoe.useArray != null) {
			return eval(item.custom.aoe.useArray);
		}
		return [AoeItemDamageUse, AoeItemTerrainUse];
	}
};