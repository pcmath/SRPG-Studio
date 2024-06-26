/*
This may collide with use damage.
*/

var AoeItemKillUse = defineObject(AoeItemDamageUse,
{

	getName: function() {
		return "kill"
	},

	_setDamage: function(unit, damage) {
		unit.setHp(0);
		DamageControl.setDeathState(unit);
	},

	_setHitList: function(indexArray, item) {
		this._HitUnit = this.getTargetList(indexArray, item);
	}
});