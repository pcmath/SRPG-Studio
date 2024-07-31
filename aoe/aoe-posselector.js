var AoeEffectRangePosSelector = defineObject(PosSelector,
{
	item: null,
	_index: 0,

	initialize: function() {
		this._mapCursor = createObject(MapCursor);
		this._posMenu = createObject(AoeItemPosMenu);
		this._selectorType = this._getDefaultSelectorType();
	},

	setUnitOnly: function(unit, item, indexArray, type, filter) {
		this._unit = unit;
		this._indexArray = indexArray;
		this._filter = filter;
		this.item = item;
		MapLayer.getMapChipLight().setIndexArray(indexArray);
		this._setPosMenu(unit, item, type);
		this._posCursor = createObject(this._getObjectFromType(this._selectorType));
		this._posCursor.setParentSelector(this);
	},

	_getDefaultSelectorType: function() {
		return PosSelectorType.FREE;
		//PosSelectorType.JUMP;
	},
	
	movePosSelector: function() {
		if (InputControl.isLeftPadAction() || root.isMouseAction(MouseType.UPWHEEL)) {
			this._index ++;
			this.setNewTarget();
		}
		else if (InputControl.isRightPadAction() || root.isMouseAction(MouseType.DOWNWHEEL)) {
			this._index --;
			this.setNewTarget();
		}
		var result = PosSelectorResult.NONE;
		
		if (InputControl.isSelectAction()) {
			this._playSelectSound();
			result = PosSelectorResult.SELECT;
		}
		else if (InputControl.isCancelAction()) {
			this._playCancelSound();
			result = PosSelectorResult.CANCEL;
		}
		else {
			this._posCursor.checkCursorEffectRange();
		}
		this._posMenu.moveWindowManager();
		return result;
	},

	getSelectorTarget: function(isIndexArray) {
		var pos, indexArray, targetList, targetUnit, i, count;
		pos = this.getSelectorPos();
		indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._posCursor.getX(), this._posCursor.getY(), this.item, this._unit);
		targetList = AoeItemDamageUse.getTargetList(indexArray, this.item);
		count = targetList.length;
		this._posMenu._targetList = targetList;
		if(count == 0) {
			return null;
		}
		this._posMenu.setShowScroll(count != 1);
		if(this._index < 0) {
			this._index += (Math.floor(-this._index/count)+1)*count;
		}
		i = this._index % count;
		return targetList[i];
	},

	drawPosSelector: function() {
		if (this._posCursor === null) {
			return;
		}
		this.drawPosCursor();
		this.drawPosMenu();
		MouseControl.drawMapEdge();
	},

	endPosSelector: function() {
		MapLayer.getMapChipLight().endLight();
		MapLayer._getAoeEffectRangePanel().endLight();
	}
}
);

(function() {

PosJumpCursor.checkCursorEffectRange = function() {
	this.checkCursor();
	var item = this._parentSelector.item;
	var unit = this._parentSelector._unit;
	if( this._parentSelector.getSelectorPos(true) ) {
		var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this.getX(), this.getY(), item, unit);
		MapLayer._getAoeEffectRangePanel().setIndexArray(indexArray);
	}
	else {
		MapLayer._getAoeEffectRangePanel().endLight();
	}
};

PosFreeCursor.checkCursorEffectRange = function() {
	this.checkCursor();
	var item = this._parentSelector.item;
	var unit = this._parentSelector._unit;
	if( this._parentSelector.getSelectorPos(true) ) {
		var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this.getX(), this.getY(), item, unit);
		MapLayer._getAoeEffectRangePanel().setIndexArray(indexArray);
	}
	else {
		MapLayer._getAoeEffectRangePanel().endLight();
	}
};

MapLayer._aoeEffectRangePanel = null;

MapLayer._getAoeEffectRangePanel = function() {
	return this._aoeEffectRangePanel;
};

var alias2 = MapLayer.prepareMapLayer;
MapLayer.prepareMapLayer = function() {
	alias2.call(this);
	this._aoeEffectRangePanel = createObject(MapChipLight);
	this._aoeEffectRangePanel.setLightType(MapLightType.RANGE);
};

var alias3 = MapLayer.moveMapLayer;
MapLayer.moveMapLayer = function() {
	this._aoeEffectRangePanel.moveLight();
	return alias3.call(this);
};

var alias4 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer =  function() {
	alias4.call(this);
	this._aoeEffectRangePanel.drawLight();
};
})();