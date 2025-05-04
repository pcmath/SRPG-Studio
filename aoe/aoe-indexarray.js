/*
Handles the creation of the AoE index array from a dictionary input
Essentially, this is transforming a set of relative coordinates into map coordinates
*/
var AoeRangeIndexArray = {
	getEffectRangeItemIndexArray: function(x, y, item, unit) {
		var effectRangeType = AoeParameterInterpreter.getEffectRangeType(item);
		if(typeof(effectRangeType) === "function") {
			return effectRangeType(x, y, item, unit);
		}
		return this.getEffectRangeIndexArray(x, y, effectRangeType, unit.getMapX(), unit.getMapY());
	},

	getSelectionRange: function(rangeType, unitX, unitY) {
		return this.getRange(rangeType, unitX, unitY, -1);
	},

	getEffectRangeIndexArray: function(x, y, rangeType, unit_x, unit_y) {
		var direction = this.getUnitDirection(unit_x, unit_y, x, y);
		return this.getRange(rangeType, x, y, direction);
	},

	getRange: function(rangeType, x, y, direction) {
		var coordinateArray = AoeDictionary[rangeType].coordinateArray;
		if(typeof coordinateArray === "function") {
			coordinateArray = coordinateArray(rangeType, x, y, direction);
			if(!coordinateArray[0].length) {
				return coordinateArray;
			}
		}
		return this.getIndexArrayFromCoordinateArray(x, y, coordinateArray, direction);
	},

	getUnitDirection: function(x, y, px, py) {
		var value = 0;
		var pointX = px - x;
		var pointY = py - y;
		if( pointX == 0 && pointY == 0 ) {
			return -1;
		}
		if(Math.abs(pointX) >= Math.abs(pointY)) {
			if( pointX < 0 ) {
				return DirectionType.LEFT;
			}
			else {
				return DirectionType.RIGHT;
			}
		}
		if( pointY < 0 ) {
			return DirectionType.TOP;
		}
		return DirectionType.BOTTOM;
	},

	_getPolarity: function(direction) {
		if(direction == DirectionType.RIGHT || direction == DirectionType.BOTTOM) {
			return 1;
		}
		if(direction == DirectionType.LEFT || direction == DirectionType.TOP) {
			return -1;
		}
		return 1;
	},

	directionMode: {
		LEFTRIGHT: 0,
		UPDOWN: 1
	},

	_getDirectionMode: function(direction) {
		if(direction == DirectionType.LEFT || direction == DirectionType.RIGHT) {
			return this.directionMode.LEFTRIGHT;
		}
		return this.directionMode.UPDOWN;
	},

	getRelativeArray: function(x, y, xyArray) {
		var array = [];
		var direction = this.getUnitDirection(0,0,x,y);
		var directionMode = this._getDirectionMode(direction);
		var polarity = this._getPolarity(direction);
		for(var i = 0, count = xyArray.length; i < count; i++) {
			array.push([
				x + polarity * xyArray[i][directionMode],
				y + polarity * xyArray[i][+(!directionMode)]
			]);
		}
		return array;
	},

	getIndexArrayFromCoordinateArray: function(x, y, xyArray, direction) {
		var array = [];
		var polarity = this._getPolarity(direction);
		var directionMode = this._getDirectionMode(direction);
		var index;
		for(var i = 0, count = xyArray.length; i < count; i++) {
			index = CurrentMap.getIndex(
				x + polarity * xyArray[i][directionMode],
				y + polarity * xyArray[i][+(!directionMode)]
			);
			if(index !== -1) {
				array.push(index);
			}
		}
		return array;
	}
};