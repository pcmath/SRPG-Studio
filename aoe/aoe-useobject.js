var AoeItemUse = defineObject(BaseItemUse,
{
	_dynamicEvent: null,
	_useArray: Array(),
	
	enterMainUseCycle: function(itemUseParent) {
		this._prepareData(itemUseParent);
		var useArray = this._useArray;
		for(var i = 0, count = useArray.length; i < count; i++) {
			useArray[i].enterMainUseCycle(this._itemUseParent);
		}
		return EnterResult.OK;
	},

	moveMainUseCycle: function() {
		var result = MoveResult.CONTINUE;
		var useArray = this._useArray;
		for(var i = 0, count = useArray.length; i < count; i++) {
			result = useArray[i].moveMainUseCycle();
			if(result !== MoveResult.CONTINUE) {
				useArray.splice(i, 1);
				i--;
				count--;
			}
		}
		if(useArray.length == 0) {
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;
	},

	drawMainUseCycle: function() {
		var useArray = this._useArray;
		for(var i = 0, count = useArray.length; i < count; i++) {
			useArray[i].drawMainUseCycle();
		}
	},
	
	mainAction: function() {
		var useArray = this._useArray;
		for(var i = 0, count = useArray.length; i < count; i++) {
			useArray[i].mainAction();
		}
	},
	
	getItemAnimePos: function(itemUseParent, animeData) {
		var targetPos = itemUseParent.getItemTargetInfo().targetPos;
		var unit = itemUseParent.getItemTargetInfo().unit;
		var x = LayoutControl.getPixelX(targetPos.x); //targetPos.x
		var y = LayoutControl.getPixelY(targetPos.y)+30; //targetPos.y
		return LayoutControl.getMapAnimationPos(x, y, animeData);
	},

	_prepareData: function(itemUseParent) {
		this._itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._itemUseParent = itemUseParent;
		this._targetPos = this._itemTargetInfo.targetPos;
		this._useArray = AoeParameterInterpreter.getUseArray(this._itemTargetInfo.item);
	}
}
);

(function(){
	var alias0 = ItemPackageControl.getCustomItemUseObject;
	ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
		var result = alias0.call(this, item, keyword);
		if (keyword === AoeItemGetCustomKeyword()) {
			return AoeItemUse;
		}
		return result;
	};
})();