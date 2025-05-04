AoeCalculator = {
	getHitRate: function(unit, item) {
		var activeSupport = SupportCalculator.createTotalStatus(unit);
		var weapon = this.getWeapon(item, unit);
		return AbilityCalculator.getHit(unit, weapon) + activeSupport.hitTotal;
	},

	getAttack: function(unit, item) {
		return AbilityCalculator.getPower(unit, this.getWeapon(item, unit));
	},

	calculateDamage: function(item, active, passive) {
		var activeStatus = SupportCalculator.createTotalStatus(active);
		var weapon = this.getWeapon(item, active);
		return this.calculateActiveDamage(item, active, passive, activeStatus, weapon);
	},

	calculateActiveDamage: function(item, active, passive, activeStatus, weapon) {
		var passiveStatus = SupportCalculator.createTotalStatus(passive);
		return this.calculateDamageFinal(item, weapon, active, passive, activeStatus, passiveStatus);
	},

	calculateDamageFinal: function(item, weapon, active, passive, activeStatus, passiveStatus) {
		if(weapon == null) {
			return 0;
		}
		var trueHitValue = 0;
		var isCritical = false;
		return DamageCalculator.calculateDamage(active, passive, weapon, isCritical, activeStatus, passiveStatus, trueHitValue);
	},

	calculateAttackEntry: function(active, passive, item) {
		var evaluatorArray = []; //other evaluators depend on their parent so we can't call NormalAttackOrderBuilder._configureEvaluator
		evaluatorArray.appendObject(AttackEvaluator.HitCritical);
		evaluatorArray.appendObject(AttackEvaluator.ActiveAction);
		evaluatorArray.appendObject(AttackEvaluator.PassiveAction);
		//NormalAttackOrderBuilder._configureEvaluator(evaluatorArray);
		var attackEntry = AttackOrder.createAttackEntry();
		var virtualActive = VirtualAttackControl.createVirtualAttackUnit(active, passive, true, {isCounterattack:false});
		virtualActive.weapon = this.getWeapon(item, active);
		var virtualPassive = VirtualAttackControl.createVirtualAttackUnit(passive, active, false, {isCounterattack:false});
		attackEntry.isSrc = true;
		attackEntry.isFirstAttack = true;
		for(var i = 0, count = evaluatorArray.length; i < count; i++) {
			evaluatorArray[i].evaluateAttackEntry(virtualActive, virtualPassive, attackEntry);
		}
		return attackEntry;
	},

	getHit: function(item, active, passive) {
		var activeSupport = SupportCalculator.createTotalStatus(active);
		var passiveSupport = SupportCalculator.createTotalStatus(active);
		var weapon = this.getWeapon(item, active);
		return HitCalculator.calculateHit(active, passive, weapon, activeSupport, passiveSupport);
	},

	getWeapon: function(item, unit) {
		var weapon = AoeParameterInterpreter.getWeapon(item, unit);
		if(weapon) {
			return weapon;
		}
		return ItemControl.getEquippedWeapon(unit);
	},

	getExp: function(active, passive, damage) {
		if(!damage) {
			damage = 0;
		}
		var data = StructureBuilder.buildAttackExperience();
		data.active = active;
		data.activeHp = 1;
		data.activeDamageTotal = 0;
		data.passive = passive;
		data.passiveHp = passive.getHP() - damage;
		data.passiveDamageTotal = damage;
		return Math.floor( ExperienceCalculator.calculateExperience(data) );
	},

	getRangeMetrics: function(item) {
		rangeMetrics = StructureBuilder.buildRangeMetrics();
		rangeMetrics.startRange = 0;
		rangeMetrics.endRange = this._getMaxCombinedDistance(
			AoeDictionary[AoeParameterInterpreter.getEffectRangeType(item)].coordinateArray,
			AoeDictionary[AoeParameterInterpreter.getSelectionRangeType(item)].coordinateArray);
		return rangeMetrics;
	},

	_getMaxDistance: function(array) {
		var temp, result = 0;
		for( var i = 0, count = array.length; i < count; i++) {
			temp = Math.abs(array[i][0]) + Math.abs(array[i][1]);
			if(temp > result) {
				result = temp
			}
		}
		return result
	},

	_getMaxCombinedDistance: function(rangeArray, selectionArray) {
		var rangeCount = rangeArray.length;
		var result = 0, temp = 0;
		for(var i = 0, count = selectionArray.length; i < count; i++) {
			for(var j = 0; j < rangeCount; j++) {
				temp =  Math.abs(rangeArray[j][0] + Math.max(Math.abs(selectionArray[i][0]), Math.abs(selectionArray[i][1])))+
					Math.abs(rangeArray[j][1] + Math.min(Math.abs(selectionArray[i][0]), Math.abs(selectionArray[i][1])));
				result = Math.max(result, temp);
			}
		}
		return result;
	}
};