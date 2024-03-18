AoeCalculator = {
	getHitRate: function(unit, item) {
		var activeSupport = SupportCalculator.createTotalStatus(unit);
		var weapon = this.getWeapon(item, unit);
		return AbilityCalculator.getHit(unit, weapon) + activeSupport.hitTotal;
	},

	getAttack: function(unit, item) {
		return AbilityCalculator.getPower(unit, this.getWeapon(item, unit));
	},

	getDamage: function(item, active, passive) {
		var activeStatus = SupportCalculator.createTotalStatus(active);
		var passiveStatus = SupportCalculator.createTotalStatus(passive);
		var weapon = this.getWeapon(item, active);
		var isCritical = false;
		var trueHitValue = 0;
		return DamageCalculator.calculateDamage(active, passive, weapon, isCritical, activeStatus, passiveStatus, trueHitValue);
	},

	finalizeDamage: function(item, active, passive, damage) {
		var value = AttackEvaluator.ActiveAction._getDamageGuardValue({
				unitSelf: active,
				weapon: this.getWeapon(item, active)
			}, {
				unitSelf: passive
			}, {
			}, {
				skillArrayPassive: []
			}
		);
		if (value !== -1) {
			value = 100 - value;
			damage = Math.floor(damage * (value / 100));
		}
		return damage;
	},

	getHit: function(item, active, passive) {
		var activeSupport = SupportCalculator.createTotalStatus(active);
		var passiveSupport = SupportCalculator.createTotalStatus(active);
		var weapon = this.getWeapon(item, active);
		return HitCalculator.calculateHit(active, passive, weapon, activeSupport, passiveSupport);
	},

	isHit: function(item, active, passive) {
		var percent = this.getHit(item, active, passive);
		return Probability.getProbability(percent);
	},

	getWeapon: function(item, unit) {
		var weapon = AoeParameterInterpreter.getWeapon(item, unit);
		if(weapon) {
			return weapon;
		}
		return ItemControl.getEquippedWeapon(unit);
	},

	getExp: function(active, passive, damage) {
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
		var endRange = this._getMaxCombinedDistance(
			AoeDictionary[AoeParameterInterpreter.getEffectRangeType(item)].coordinateArray,
			AoeDictionary[AoeParameterInterpreter.getSelectionRangeType(item)].coordinateArray);
		rangeMetrics = StructureBuilder.buildRangeMetrics();
		rangeMetrics.startRange = 0;
		rangeMetrics.endRange = endRange;
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