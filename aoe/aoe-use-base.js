/*
This serves as a common base for Aoe items.
In addition to basic item use functions, use objects need to to interface with potency and posmenu
*/

var BaseAoeItemUse = defineObject(BaseItemUse, {
	getTargetList: function(indexArray, item) {
		var targetUnit, x, y, index;
		var result = [];
		for(var i = 0, count = indexArray.length; i < count; i++) {
			index = indexArray[i];
			targetUnit = PosChecker.getUnitFromPos(CurrentMap.getX(index), CurrentMap.getY(index));
			if(targetUnit != null) {
				result.push(targetUnit);
			}
		}
		return result;
	},

	posMenuArtist: {
		initialize: function() {
		},
		draw: function(item, unit, targetUnit) {
		}
	},

	potencyArtist: {
		initialize: function(unit, item, targetUnit) {
		},
		getSentenceCount: function() {
			return 0;
		},
		draw: function() {
		}
	}
});