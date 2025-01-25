var AoeItemStatusUse = defineObject(BaseAoeItemUse,
{
	_dynamicEvent: null,
	_targetPos: null,
	_itemTargetInfo: null,
	_itemUseParent: null,
	_state: null,
	_item: null,

	_prepareData: function(itemUseParent) {
		this._itemUseParent = itemUseParent;
		this._itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._item = this._itemTargetInfo.item;
		this._state = root.getBaseData().getStateList().getDataFromId(item.custom.aoe.stateId);
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
		var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, item, this._itemTargetInfo.unit);
		var state = this._state;
		var targetArray = this.getTargetList(indexArray);
		for(var i = 0, count = targetArray.length; i < count; i++) {
			StateControl.arrangeState(targetArray[i], state, IncreaseType.INCREASE);
		}
	},

	_moveMainUseCycle: function() {
	},

	drawMainUseCycle: function() {
	}
});