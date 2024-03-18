var AoeItemInfo = defineObject(BaseItemInfo,
{	
	drawItemInfoCycle: function(x, y) {
		var px=x, py=y;
		
		this._drawTitle(x, y);
		y += ItemInfoRenderer.getSpaceY();

		this.drawEffectRange(x, y);
		y += ItemInfoRenderer.getSpaceY();
	},
	
	getInfoPartsCount: function() {
		return 2;
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
		var text;
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var type = AoeParameterInterpreter.getEffectRangeType(this._item);
		ItemInfoRenderer.drawKeyword(x, y, 'Shape');
		x += ItemInfoRenderer.getSpaceX();
		text = AoeDictionary[type].name;
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
			item
			&&
			!item.isWeapon()
			&&
			(item.getItemType() == ItemType.CUSTOM)
			&&
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
		var count;
		var partsCount = 0;
		this._aoeWeapon = AoeParameterInterpreter.getWeapon(item, false);
		this._aoeWeaponArray = [];
		if (!this._aoeWeapon) {
			return ;
		}
		this._configureWeapon(this._aoeWeaponArray);
		count = this._aoeWeaponArray.length;
		for (i = 0; i < count; i++) {
			this._aoeWeaponArray[i].setParentWindow(this);
			partsCount += this._aoeWeaponArray[i].getItemSentenceCount(this._aoeWeapon);
		}
		this._windowHeight += (partsCount) * ItemInfoRenderer.getSpaceY();
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