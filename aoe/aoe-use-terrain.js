/*
Transform terrain based on item.custom.aoe.terrainTransform
terrainTransform should be either null, a string or transformData
If terrainTransform is a string, the transformData will be taken from terrain.custom.transform[key],
Where key is the string.
Examples of transformData are in the TransformData object below.
I suggest using referring to this object for your trasnformData.
Example for terrain transform data in terrain custom parameters to change to forest for terrainTransform "grow":
{
	transform: {
		"grow": TransformData.RTPforest
	}
}
Example for item to match this:
{
	aoe: {
		//usual AoE stuff here
		terrainTransform:"grow"
	}
}
Example for item using direct transform data:
{
	aoe: {
		//usualAoe stuff here
		terrainTransform: TransformData.RTPforest
	}
}
You can block a terrain's transformation using terrain.custom.noTransform {noTransform:true}
*/

TransformData = {
	RTPplain: {
		xSrc: 0,	//x position in sheet
		ySrc: 0,	//y position in sheet
		id: 0,		//sheet id
		rtp: true,	//if the sheet is RTP
		transparent: false
	},

	RTPforest: {
		xSrc:0,
		ySrc:5,
		id:0,
		rtp:true,
		transparent: false
	}
}

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
			transformData = this._getTransformData(terrain, this._transformType);
			if(!transformData) {
				continue ;
			}
			handle = root.createResourceHandle(transformData.rtp, transformData.id, 0, transformData.xSrc, transformData.ySrc);
			root.getCurrentSession().setMapChipGraphicsHandle(x, y, transformData.transparent, handle)
		}
	},

	_getTransformData: function(terrain, transformType) {
		if(!terrain || terrain.custom.noTransform) {
			return null;
		}
		if(typeof(transformType) == "string") {
			return this._getDynamicTransformData(terrain, transformType);
		}
		return this._getStaticTransformData(terrain, transformType);
	},

	_getDynamicTransformData: function(terrain, transformType) {
		if(terrain.custom.transform && terrain.custom.transform[this._transformType]) {
			return terrain.custom.transform[this._transformType];
		}
		return null;
	},

	_getStaticTransformData: function(terrain, transformType) {
		return transformType;
	},

	_moveMainUseCycle: function() {

	},

	drawMainUseCycle: function() {
		//var mode = this.getCycleMode();
		//var result = MoveResult.CONTINUE;
	}
});