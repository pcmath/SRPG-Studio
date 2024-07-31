ActionTargetType.AOE = "AOE";

CombinationCollector.Item._makeMoveArrayCombinations = function(moveArray, selectionArray, misc) {
	var count = moveArray.length;
	for(var i = 0; i < count; i++) {
		this._makePosCombination(moveArray[i], selectionArray, misc);
	}
};

CombinationCollector.Item._makePosCombination = function(moveEntry, selectionArray, misc) {
	var index = moveEntry.posIndex;
	var x = CurrentMap.getX(index);
	var y = CurrentMap.getY(index);
	var selectionIndexArray = AoeRangeIndexArray.getIndexArrayFromCoordinateArray(x, y, selectionArray, -1);
	var count = selectionIndexArray.length;
	for(var j = 0; j < count; j++) {
		targetX = CurrentMap.getX(selectionIndexArray[j]);
		targetY = CurrentMap.getY(selectionIndexArray[j]);
		var combination = this._createAndPushCombination(misc);
		combination.posIndex = index;
		combination.costArray = [moveEntry];
		combination.targetPos = {x: targetX, y: targetY};
		//I'm not really sure this does what I want but it seems like a fair enough estimate
		combination.rangeMetrics = {};
		combination.rangeMetrics.startRange = Math.abs(x - targetX) + Math.abs(y - targetY);
		combination.rangeMetrics.endRange = combination.rangeMetrics.startRange;
	}
}


CombinationCollector.Item._finishAoeCombination = function(misc, selectionArray) {
	var i, j, indexArray, list, targetUnit, targetCount, score, combination, aggregation;
	var unit = misc.unit;
	var filter =  FilterControl.getReverseFilter(unit.getUnitType());
	var filterNew = this._arrangeFilter(unit, filter);
	var listArray = this._getTargetListArray(filterNew, misc);
	var listCount = listArray.length;
	var rangeMetrics = AoeCalculator.getRangeMetrics(misc.item);
	//First, gather unique positions
	var uniqueIndexArray = []; //Remove positions that repeat
	for (i = 0; i < listCount; i++) {
		list = listArray[i];
		targetCount = list.getCount();
		for (j = 0; j < targetCount; j++) {
			targetUnit = list.getData(j);
			if (unit === targetUnit) {
				continue;
			}
			score = this._checkTargetScore(unit, targetUnit);
			if (score < 0) {
				continue;
			}
			indexArray = IndexArray.createRangeIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), rangeMetrics);
			pushUniqueValues(uniqueIndexArray, indexArray);
		}
	}
	misc.indexArray = uniqueIndexArray;
	misc.rangeMetrics = rangeMetrics;
	misc.costArray = BaseCombinationCollector._createCostArray(misc);
	moveArray = misc.costArray;
	moveCount = moveArray.length;
	for(var k = 0; k < moveCount; k++) {
		this._makePosCombination(moveArray[k], selectionArray, misc);
	}
};

pushUniqueValues = function(mainArray, pushedArray) {
	var isUnique;
	for(var i = 0; i < pushedArray.length; i++) {
		isUnique = true;
		for(var j = 0; j < mainArray.length && isUnique; j++){
			if(pushedArray[i] === mainArray[j]) {
				isUnique = false;
			}
		}
		if(isUnique) {
			mainArray.push(pushedArray[i]);
		}
	}
}

CombinationCollector.Item._setAoeCombination = function(misc) {
	var filter, rangeValue, rangeType, rangeMetrics;
	var item = misc.item;
	var rangeType = AoeParameterInterpreter.getSelectionRangeType(item);
	this._finishAoeCombination(misc, AoeDictionary[rangeType].coordinateArray);
};

var AoeItemAI = defineObject(BaseItemAI,
{
	getItemScore: function(unit, combination) {
		var x = CurrentMap.getX(combination.posIndex);
		var y = CurrentMap.getY(combination.posIndex);
		var item = combination.item;
		var effectRangeType = AoeParameterInterpreter.getEffectRangeType(item);
		var indexArray = AoeRangeIndexArray.getEffectRangeIndexArray(combination.targetPos.x, combination.targetPos.y, effectRangeType, x, y);
		var targetList = AoeItemDamageUse.getTargetList(indexArray, item);
		var count = targetList.length;
		var totalDamage = 0;
		var score = 30;	//Base AI score gives +Hit/5 to score and bonus depending on HP% up to 10
		var filter = FilterControl.getReverseFilter(unit.getUnitType());
		var targetUnit, damage;
		var enemyTarget = false;
		filter = BaseCombinationCollector._arrangeFilter(unit, filter);
		if(count == 0) {
			return -1;
		}
		for(var i = 0; i < count; i++)	{
			targetUnit = targetList[i];
			if(targetUnit == unit) {
				//dealing with self is complicated because self moves.
				if(count == 1) {
					return -1;
				}
				continue;
			}
			damage = AoeCalculator.calculateDamage(item, unit, targetUnit);
			if(! FilterControl.isBestUnitTypeAllowed(unit.getUnitType(), targetUnit.getUnitType(), filter)) {
				totalDamage += damage;
				enemyTarget = true;
				score += BaseCombinationCollector._checkTargetScore(unit, targetUnit);
			}
			else {
				totalDamage -= damage;
			}

		}
		if(!enemyTarget) {
			return -1;
		}
		score += Miscellaneous.convertAIValue(totalDamage);
		return score;
	},
	
	_getValue: function(unit, combination) {		
		return 0;
	},

	getActionTargetType: function(unit, item) {
		return ActionTargetType.AOE;
	}
});

(function() {
	var alias0 = ItemPackageControl.getCustomItemAIObject;
	ItemPackageControl.getCustomItemAIObject = function(item, keyword) {
		if (keyword == "AOE") {
			return AoeItemAI;
		}
		return alias0.call(this, item, keyword);
	}
	alias_setCombination = CombinationCollector.Item._setCombination;
	CombinationCollector.Item._setCombination = function(misc) {
		if(misc.actionTargetType === ActionTargetType.AOE) {
			CombinationCollector.Item._setAoeCombination(misc);
		}
		return alias_setCombination.call(this, misc);
	}
})();