var AoeItemMoveUse = defineObject(BaseAoeItemUse,
{
	_dynamicEvent: null,
	_targetPos: null,
	_itemTargetInfo: null,
	_itemUseParent: null,
	_transformType: null,
	_item: null,

	_prepareData: function(itemUseParent) {
		this._itemUseParent = itemUseParent;
		this._itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._item = this._itemTargetInfo.item;
		this._transformType = this._itemTargetInfo.item.custom.aoe.terrainTransform;
		this._targetPos = this._itemTargetInfo.targetPos;
	},
	
	enterMainUseCycle: function(itemUseParent) {
		this._prepareData(itemUseParent);
		return EnterResult.OK;
	},	

	moveMainUseCycle: function() {
		if(this._itemUseParent.damageCalculation) {
			return MoveResult.CONTINUE;
		}
		var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, this._item, this._itemTargetInfo.unit);
		var i = root.getRandomNumber() % indexArray.length;
		var x = CurrentMap.getX(indexArray[i]);
		var y = CurrentMap.getY(indexArray[i]);
		this._itemTargetInfo.unit.setMapX(x);
		this._itemTargetInfo.unit.setMapY(y);

		return  MoveResult.END;
	},

	drawMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
	}
});