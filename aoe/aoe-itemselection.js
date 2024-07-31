/*
Item selection object for selection phase
This is when the player uses the AoE item and must select a tile
*/
var AoeItemSelection = defineObject(BaseItemSelection,
{
	enterItemSelectionCycle: function(unit, item) {
		this._unit = unit;
		this._item = item;
		this._targetUnit = this._unit;
		this._targetPos = createPos(this._unit.getMapX(), this._unit.getMapY());
		this._targetClass = null;
		this._targetItem = null;
		this._isSelection = false;
		this._posSelector = createObject(AoeEffectRangePosSelector);
		this._posSelector.setPosSelectorType(PosSelectorType.FREE);
		return this.setInitialSelection();
	},

	setInitialSelection: function() {
		this.setPosSelection();
		return EnterResult.OK;
	},

	setPosSelection: function() {
		var filter = this.getUnitFilter();
		var rangeType = AoeParameterInterpreter.getSelectionRangeType(this._item);
		var indexArray = AoeRangeIndexArray.getSelectionRange(rangeType, this._unit.getMapX(), this._unit.getMapY());
		this._posSelector.setUnitOnly(this._unit, this._item, indexArray, PosMenuType.Item, filter);		
		this.setFirstPos();
	},

	isPosSelectable: function() {
		this._targetPos = this._posSelector.getSelectorPos(true);
		return this._targetPos !== null;
	},
			
	getUnitFilter: function() {
		return UnitFilterFlag.PLAYER;
	}
}
);

(function(){
	var alias0 = ItemPackageControl.getCustomItemSelectionObject;
	ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
		var result = alias0.call(this, item, keyword);	
		if (keyword === AoeItemGetCustomKeyword()) {
			return AoeItemSelection;
		}
		return result;
	};
})();