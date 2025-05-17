/*
The series sum formula is 		n*(n+1)/2
Therefore the tile graphics height	h = n*(n+1)/2
Quadratic equation 			0 = n^2+n-2*h
Quadratic formula			n=(sqrt(1+8*h)-1)/2
*/

AoeItemInfoOptions = {
	materialFolder: "AoeMaterial",
	image: "tile.png",
	sentenceCount: 3 // number of sentences reserved to draw the tiles
}

var AoeItemInfo = defineObject(BaseItemInfo,
{
	_drawTile: true,

	setInfoItem: function(item) {
		this._item = item;
		this._typeEffect = AoeParameterInterpreter.getEffectRangeType(this._item);
		this._typeSelect = AoeParameterInterpreter.getSelectionRangeType(this._item);
		this._arrayEffect = AoeDictionary[this._typeEffect].coordinateArray;
		this._arraySelect = AoeDictionary[this._typeSelect].coordinateArray;
		if(typeof(this._arrayEffect) == "function" || typeof(this._arraySelect) == "function") {
			this._drawTile = false;
			return ;
		}
		this._tileGraphics = root.getMaterialManager().createImage(
			AoeItemInfoOptions.materialFolder,
			AoeItemInfoOptions.image
		);
		if(!this._tileGraphics) {
			this._drawTile = false;
			return ;
		}
		var span = AoeCalculator.getRangeMetrics(this._item).endRange * 2 + 1;
		var spaceX = ItemRenderer.getItemWindowWidth();
		var spaceY = AoeItemInfoOptions.sentenceCount * ItemInfoRenderer.getSpaceY();
		var maxTileSize = this._getMaxTileSize();
		this._tileSize = Math.min(Math.floor(spaceX / span), Math.floor(spaceY / span), maxTileSize);
		if(this._tileSize <= 0) {
			this._drawTile = false;
			return ;
		}
		this._setTileHeight();
	},

	_getMaxTileSize: function() {
		var h = this._tileGraphics.getHeight();
		return Math.floor((Math.sqrt(1+8*h)-1)/2)
	},

	_setTileHeight: function() { //set the height from which to read tiles
		var n = this._tileSize - 1;
		this._h = n*(n+1)/2;
	},

	drawItemInfoCycle: function(x, y) {
		var isTile = +(this._drawTile);
		var offsetY = isTile * Math.floor(AoeItemInfoOptions.sentenceCount/2 * ItemInfoRenderer.getSpaceY());
		var offsetX = isTile * Math.floor(ItemRenderer.getItemWindowWidth()/2);
		this._drawTitle(x, y);
		y += ItemInfoRenderer.getSpaceY();
		this.drawEffectRange(x + offsetX, y + offsetY);
		y += ItemInfoRenderer.getSpaceY();
		if(isTile) {
			y += ItemInfoRenderer.getSpaceY() * (AoeItemInfoOptions.sentenceCount - 1);
		}
	},
	
	getInfoPartsCount: function() {
		if(!this._drawTile) {
			return 2;
		}
		return 1 + AoeItemInfoOptions.sentenceCount;
	},
	
	_drawTitle: function(x, y) {
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var item = this._item;
		var text = '';
		text += 'Special Attack';
		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		x += 40;
	},

	drawEffectRange: function(x, y) {
		if(!this._drawTile) {
			this._drawEffectRangeDefault(x, y, this._typeEffect);
			return ;
		}
		var h = this._h;
		var n = this._tileSize;
		this._drawEffectRangeTiles(x - n, y - n, this._arraySelect, n * 2, h, n)
		arrayEffect = AoeRangeIndexArray.getRelativeArray(this._arraySelect[0][0], this._arraySelect[0][1], this._arrayEffect);
		this._drawEffectRangeTiles(x - n, y - n, arrayEffect, 0, h, n);
		this._tileGraphics.drawParts(x - n, y - n, n, h, n, n);
	},

	_drawEffectRangeTiles: function(x, y, array, offset, h, n) {
		for(var i = 0, count = array.length; i < count; i++) {
			this._tileGraphics.drawParts(
				x + n * array[i][0],
				y + n * array[i][1],
				offset, h, n, n
			);
		}		
	},

	_drawEffectRangeDefault: function(x, y, type) {
		var text = AoeDictionary[type].name;
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		ItemInfoRenderer.drawKeyword(x, y, 'Shape');
		x += ItemInfoRenderer.getSpaceX();
		text += " ";
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	}
});

(function(){
	var alias0 = ItemPackageControl.getCustomItemInfoObject;
	ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
		var result = alias0.call(this, item, keyword);	
		if (keyword === AoeItemGetCustomKeyword()) {
			return AoeItemInfo;
		}
		return result;
	};

	ItemInfoWindow._isAoeItem = function(item) {
		return (
			item &&
			!item.isWeapon() &&
			(item.getItemType() == ItemType.CUSTOM) &&
			(item.getCustomKeyword() == AoeItemGetCustomKeyword())
		);
	};

	var alias1 = ItemInfoWindow.setInfoItem;
	ItemInfoWindow.setInfoItem = function(item) {
		alias1.call(this, item);
		if(! this._isAoeItem(item)) {
			return ;
		}
		this._itemPartsCount = this._windowHeight/ItemInfoRenderer.getSpaceY();
		var partsCount = 0;
		this._aoeWeapon = AoeParameterInterpreter.getWeapon(item, false);
		this._aoeWeaponArray = [];
		if (!this._aoeWeapon) {
			return ;
		}
		this._configureWeapon(this._aoeWeaponArray);
		for (i = 0, count = this._aoeWeaponArray.length; i < count; i++) {
			this._aoeWeaponArray[i].setParentWindow(this);
			partsCount += this._aoeWeaponArray[i].getItemSentenceCount(this._aoeWeapon);
		}
		this._windowHeight += partsCount * ItemInfoRenderer.getSpaceY();
		this.enableWindow(true);
	};

	var alias2 = ItemInfoWindow.drawWindowContent;
	ItemInfoWindow.drawWindowContent = function(x, y) {
		alias2.call(this, x, y);
		if(! this._isAoeItem(this._item)) {
			return ;
		}
		y += (this._itemPartsCount - 1) * ItemInfoRenderer.getSpaceY();
		var count = this._aoeWeaponArray.length;
		for (var i = 0; i < count; i++) {
			this._aoeWeaponArray[i].drawItemSentence(x, y, this._aoeWeapon);
			y += this._aoeWeaponArray[i].getItemSentenceCount(this._aoeWeapon) * ItemInfoRenderer.getSpaceY();
		}
	}

	var alias3 = ItemSentence.Effective.setParentWindow;
	ItemSentence.Effective.setParentWindow = function(itemInfoWindow) {
		if(!itemInfoWindow._isAoeItem(itemInfoWindow.getInfoItem())) {
			return alias3.call(this, itemInfoWindow);
		}
		var item = itemInfoWindow._aoeWeapon;
		var aggregation = this._getAggregation(item);
		BaseItemSentence.setParentWindow.call(this, itemInfoWindow);
		this._aggregationViewer = createObject(AggregationViewer);
		this._aggregationViewer.setAggregationViewer(aggregation);
	}
})();
