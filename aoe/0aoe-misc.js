function AoeItemGetCustomKeyword() {
	return 'AOE';
};

(function(){
	var alias0 = ItemPackageControl.getCustomItemAvailabilityObject;
	ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
		if (keyword === AoeItemGetCustomKeyword()) {
			return AoeItemAvailability;
		}
		return alias0.call(this, item, keyword);
	};

	var alias1 = ItemExpFlowEntry._getItemExperience;
	ItemExpFlowEntry._getItemExperience = function(itemUseParent) {
		var exp = alias1.call(this, itemUseParent);
		if( itemUseParent._AoeItemExp != null ) {
			exp += itemUseParent._AoeItemExp;
		}
		if (exp > 100) {
			exp = 100;
		}
		else if (exp < 0) {
			exp = 0;
		}
		return exp;
	};

	var AoeItemAvailability = defineObject(BaseItemAvailability,
	{
		isUnitTypeAllowed: function(unit, targetUnit) {
			return FilterControl.isReverseUnitTypeAllowed(unit, targetUnit);
		},

		isItemAvailableCondition: function(unit, item) {
			return true;
		}
	});
})();