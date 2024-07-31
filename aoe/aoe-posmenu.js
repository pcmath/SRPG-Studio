//Rewrite the pos menu object to include scroll cursor
//The values for setEdgeRange and drawHorzCursor are a little scuffed.


var AoeItemPosMenu = defineObject(PosMenu,
{
	_scrollCursor: null,
	_showScroll: false,
	_artistArray: [],
	
	createPosMenuWindow: function(unit, item, type) {
		var obj = this._getObjectFromType(type);
		this._posWindowLeft = createWindowObject(PosAoeItemWindow, this);
		this._posWindowRight = createWindowObject(obj, this);
		this._unit = unit;
		this._item = item;
		this._scrollCursor = createObject(EdgeCursor);
		this._scrollCursor.initialize();
		this._scrollCursor.setEdgeRange(this._posWindowLeft.getWindowWidth()-15, 100);
		this._artistArray = [];
		var useArray = AoeParameterInterpreter.getUseArray(item);
		for(var i = 0, count = useArray.length; i < count; i++) {
			this._artistArray.push(useArray[i]);
		}
		for(var i = 0, count = this._artistArray.length; i < count; i++) {
			this._artistArray[i].posMenuArtist.initialize();
		}
	},
	
	moveWindowManager: function() {
		var resultLeft = this._posWindowLeft.moveWindow();
		var resultRight = this._posWindowRight.moveWindow();
		this._scrollCursor.moveCursor();
		return resultLeft && resultRight;
	},
	
	drawWindowManager: function() {
		var x, y;
		
		if (this._currentTarget === null) {
			return;
		}
		
		x = this.getPositionWindowX();
		y = this.getPositionWindowY();
		
		this._posWindowLeft.drawWindow(x, y);
		this._posWindowRight.drawWindow(x + this._posWindowLeft.getWindowWidth() + this._getWindowInterval(), y);
		if(this._showScroll) {
			this._scrollCursor.drawHorzCursor(x + this._posWindowLeft.getWindowWidth() + this._getWindowInterval() + 10, y, true, true);
		}
		if(!this._targetList) {
			return alias1.call(this);
		}
		for(var i = 0, count = this._targetList.length; i < count; i++) {
			for(var j = 0, count2 = this._artistArray.length; j < count2; j++) {
				this._artistArray[j].posMenuArtist.draw(this._item, this._unit, this._targetList[i]);
			}
		}
	},

	setShowScroll: function(showScroll) {
		this._showScroll = showScroll;
	}
}
);