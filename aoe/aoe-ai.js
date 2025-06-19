ActionTargetType.AOE = "AOE";

CombinationCollector.Item._makePosCombination = function(moveEntry, selectionArray, misc) {
	var index = moveEntry.posIndex;
	var x = CurrentMap.getX(index);
	var y = CurrentMap.getY(index);
	var targetX, targetY, combination;
	var selectionIndexArray = AoeRangeIndexArray.getIndexArrayFromCoordinateArray(x, y, selectionArray, -1);
	for(var j = 0, count = selectionIndexArray.length; j < count; j++) {
		var combination = this._createAndPushCombination(misc);
		combination.posIndex = index;
		combination.costArray = [moveEntry];
		combination.targetPos = {
			x: CurrentMap.getX(selectionIndexArray[j]),
			y: CurrentMap.getY(selectionIndexArray[j]),
			index: selectionIndexArray[j]
		};
	}
};

CombinationCollector.Item._finishAoeCombination = function(misc, selectionArray, rangeMetrics) {
	var indexArray, list, targetUnit, targetCount, score, combination, aggregation;
	var unit = misc.unit;
	var filter =  FilterControl.getReverseFilter(unit.getUnitType());
	var filterNew = this._arrangeFilter(unit, filter);
	var listArray = this._getTargetListArray(filterNew, misc);
	var checkedPositions = [];
	var uniqueIndexArray = [];
	for (var i = 0, listCount = listArray.length; i < listCount; i++) {
		list = listArray[i];
		for (var j = 0, targetCount = list.getCount(); j < targetCount; j++) {
			targetUnit = list.getData(j);
			if (unit === targetUnit) {
				continue;
			}
			score = this._checkTargetScore(unit, targetUnit);
			if (score < 0) {
				continue;
			}
			indexArray = IndexArray.createRangeIndexArray(targetUnit.getMapX(), targetUnit.getMapY(), rangeMetrics);
			pushUniqueValues(uniqueIndexArray, indexArray, checkedPositions);
		}
	}
	misc.indexArray = uniqueIndexArray;
	misc.rangeMetrics = rangeMetrics;
	misc.costArray = BaseCombinationCollector._createCostArray(misc);
	moveArray = misc.costArray;
	for(var k = 0, moveCount = moveArray.length; k < moveCount; k++) {
		this._makePosCombination(moveArray[k], selectionArray, misc);
	}
	AoeItemAI._computedArray = {};
	AoeItemAI._damageCache = {};
};

pushUniqueValues = function(mainArray, pushedArray, checkedArray) {
	for(var i = 0; i < pushedArray.length; i++) {
		if(checkedArray[pushedArray[i]]) {
			continue;
		}
		checkedArray[pushedArray[i]] = true;
		mainArray.push(pushedArray[i]);
	}
};

CombinationCollector.Item._setAoeCombination = function(misc) {
	var rangeValue, rangeType;
	var item = misc.item;
	var rangeType = AoeParameterInterpreter.getSelectionRangeType(item);
	var rangeMetrics = AoeCalculator.getRangeMetrics(misc.item);
	this._finishAoeCombination(misc, AoeDictionary[rangeType].coordinateArray, rangeMetrics);
};

var AoeItemAI = defineObject(BaseItemAI, {
	getItemScore: function(unit, combination) {
		var x = CurrentMap.getX(combination.posIndex);
		var y = CurrentMap.getY(combination.posIndex);
		var targetX = combination.targetPos.x;
		var targetY = combination.targetPos.y;
		var direction = AoeRangeIndexArray.getUnitDirection(x, y, targetX, targetY);
		if(!this._computedArray) {
			this._computedArray = {};
		}
		if(this._computedArray[direction] == null) {
			this._computedArray[direction] = [];
		}
		if(this._computedArray[direction][combination.targetPos.index] != null) {
			return this._computedArray[direction][combination.targetPos.index];
		}
		var item = combination.item;
		var effectRangeType = AoeParameterInterpreter.getEffectRangeType(item);
		var indexArray = AoeRangeIndexArray.getEffectRangeIndexArray(targetX, targetY, effectRangeType, x, y);
		var targetList = AoeItemDamageUse.getTargetList(indexArray, item);
		var totalDamage = 0;
		var score = 30;	//Base AI score gives +Hit/5 to score and bonus depending on HP% up to 10
		var targetUnit, damage, targetId;
		var enemyTarget = false;
		var unitStatus = SupportCalculator.createTotalStatus(null); //can't evaluate status because unit will move
		var weapon = AoeCalculator.getWeapon(item, unit);
		var count = targetList.length;
		for(var i = 0, count = targetList.length; i < count; i++) {
			targetUnit = targetList[i];
			targetId = targetUnit.getId();
			if(targetUnit == unit) {
				//dealing with self is complicated because self moves.
				if(count == 1) {
					return -1;
				}
				continue;
			}
			if(this._damageCache[targetId] == null) {
				this._damageCache[targetId] = AoeCalculator.calculateDamageFinal(
					item,
					weapon,
					unit,
					targetUnit,
					unitStatus,
					SupportCalculator.createTotalStatus(targetUnit)
				);
			}
			damage = this._damageCache[targetId] = damage;
			if(FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) {
				totalDamage += damage;
				enemyTarget = true;
				score += BaseCombinationCollector._checkTargetScore(unit, targetUnit);
			}
			else {
				totalDamage -= damage;
			}

		}
		if(!enemyTarget) { //if there are no enemy targets then don't use AOE item.
			score = -1;
		}
		else {
			score += Miscellaneous.convertAIValue(totalDamage);
		}
		this._computedArray[direction][combination.targetPos.index] = score;
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
