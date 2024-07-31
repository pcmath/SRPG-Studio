var PosAoeItemWindow = defineObject(PosItemWindow, {
	_targetUnit: null,

	setPosTarget: function(unit, item, targetUnit, targetItem, isSrc) {
		this._useArray = AoeParameterInterpreter.getUseArray(item);
		var sentenceCount = 0;
		for(var i = 0, count = this._useArray.length; i < count; i++) {
			this._useArray[i].potencyArtist.initialize(unit, item, targetUnit);
			sentenceCount += this._useArray[i].potencyArtist.getSentenceCount();
		}
		this._sentenceCount = sentenceCount;
		this.setPosInfo(unit, item, isSrc);
	},

	getWindowHeight: function() {
		return PosItemWindow.getWindowHeight.call(this) + (this._sentenceCount-1) * ItemInfoRenderer.getSpaceY();
	},

	drawInfoBottom: function(xBase, yBase) {
		var y = yBase + 90;
		for(var i = 0, count = this._useArray.length; i < count; i++) {
			this._useArray[i].potencyArtist.draw(xBase, y, this.getWindowTextUI());
			y += this._useArray[i].potencyArtist.getSentenceCount() * ItemInfoRenderer.getSpaceY();
		}
	}
});