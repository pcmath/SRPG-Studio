//Rewrite the pos menu object to include scroll cursor
//The values for setEdgeRange and drawHorzCursor are a little scuffed.


var AoeItemPosMenu = defineObject(PosMenu,
{
	_scrollCursor: null,
	_showScroll: false,
	
	createPosMenuWindow: function(unit, item, type) {
		var obj = this._getObjectFromType(type);
		
		this._posWindowLeft = createWindowObject(obj, this);
		this._posWindowRight = createWindowObject(obj, this);
		
		this._unit = unit;
		this._item = item;

		this._scrollCursor = createObject(EdgeCursor);
		this._scrollCursor.initialize();
		this._scrollCursor.setEdgeRange(this._posWindowLeft.getWindowWidth()-15, 100);
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
	},

	setShowScroll: function(showScroll) {
		this._showScroll = showScroll;
	}
}
);