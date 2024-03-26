var AoeItemTerrainUse = defineObject(BaseItemUse,
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
		if(this._transformType == null) {
			return MoveResult.END;
		}
		if(this._itemUseParent.damageCalculation) {
			return MoveResult.CONTINUE;
		}
		var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, this._item, this._itemTargetInfo.unit);
		var x, y, terrain, transformData, handle;
		for(var i = 0, count = indexArray.length; i < count; i++) {
			x = CurrentMap.getX(indexArray[i]);
			y = CurrentMap.getY(indexArray[i]);
			terrain = PosChecker.getTerrainFromPos(x, y);
			if(terrain && terrain.custom.transform && terrain.custom.transform[this._transformType]) {
				transformData = terrain.custom.transform[this._transformType];
				handle = root.createResourceHandle(transformData.rtp, transformData.id, 0, transformData.xSrc, transformData.ySrc);
				root.getCurrentSession().setMapChipGraphicsHandle(x, y, transformData.transparent, handle)
			}
		}
		return  MoveResult.END;
	},

	drawMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
	}
});
