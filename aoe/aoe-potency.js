(function(){
	var alias = ItemPackageControl.getCustomItemPotencyObject;
	ItemPackageControl.getCustomItemPotencyObject = function(item, keyword) {
		if (keyword === AoeItemGetCustomKeyword()) {
			return createObject(AoeItemPotency);
		}
		return alias.call(this, item, keyword);
	};

	var alias0 = PosItemWindow.setPosTarget;
	PosItemWindow.setPosTarget = function(unit, item, targetUnit, targetItem, isSrc) {
		if(!unit || !targetItem || !targetItem.custom.aoe) {
			return alias0.call(this, unit, item, targetUnit, targetItem, isSrc);
		}
		this._obj = createObject(AoeItemDamagePotency);
		this._obj.setPosMenuData(unit, targetItem, targetUnit);
		this.setPosInfo(unit, item, isSrc);
	};
})();

var AoeItemPotency = defineObject(DamageItemPotency,
{
	_text: null,

	setPosMenuData: function(unit, item, targetUnit) {
		this._value = AoeCalculator.getAttack(unit, item);
		this._value2 = AoeCalculator.getHitRate(unit, item);
		this._text = root.queryCommand('attack_capacity');
	},

	drawPosMenuData: function(x, y, textui) {
		x += 20;
		var text;
		var color = ColorValue.KEYWORD;
		var font = textui.getFont();

		TextRenderer.drawKeywordText(x, y, this._text, -1, color, font);
		NumberRenderer.drawNumber(x + 50, y, this._value);
		
		x += 75;
		
		text = root.queryCommand('hit_capacity');
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
		NumberRenderer.drawNumber(x + 50, y, this._value2);
	},
	
	getKeywordName: function() {
		return StringTable.FusionWord_Success;
	}
}
);

var AoeItemDamagePotency = defineObject(AoeItemPotency, 
{
	setPosMenuData: function(targetUnit, item, unit) {
		if(targetUnit === null) {
			return ;
		}
		this._value = AoeCalculator.getDamage(item, unit, targetUnit);
		this._value2 = AoeCalculator.getHit(item, unit, targetUnit);
		this._text = root.queryCommand('power_capacity');
	}
});