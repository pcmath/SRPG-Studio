/*
place this plugin in a folder inside the aoe plugin folder, otherwise the reading order will not be correct
In the item custom parameters, use "animeDirection:true" OUTSIDE of the AOE custom parameter object to enable the animation direction to switch
Example:
{
	aoe: {
		//stuff goes here
	},
	animeDirection:true
}


*/

(function(){
	var alias0 = AoeItemSelection.getResultItemTargetInfo;
	AoeItemSelection.getResultItemTargetInfo = function() {
		var itemTargetInfo = alias0.call(this);
		if(this._item.custom.animeDirection) {
			itemTargetInfo.angle = getDirectionTypeAngle(this._animeDirection);
		}
		return itemTargetInfo;
	}

	var alias1 = AoeItemSelection.isPosSelectable;
	AoeItemSelection.isPosSelectable = function() {
		var result = alias1.call(this);
		if(this._targetPos != null) {
			this._updateDirection();
		}
		return result;
	}

	AoeItemSelection._animeDirection = null;

	AoeItemSelection._updateDirection = function() {
		this._animeDirection = AoeRangeIndexArray.getUnitDirection(
			this._unit.getMapX(),
			this._unit.getMapY(),
			this._targetPos.x,
			this._targetPos.y
		);
	}
})();