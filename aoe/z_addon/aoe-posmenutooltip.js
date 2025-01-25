AoePosMenuTooltipOptions = {
	materialFolder: "AoeMaterial",
	dmgNumber: "smallnumber2.png",
	hitNumber: "smallnumber.png",
	image: "DamageTooltip.png"
};

damagePosMenuArtist = {
	initialize: function() {
		this._tooltipPicture = root.getMaterialManager().createImage(
			AoePosMenuTooltipOptions.materialFolder,
			AoePosMenuTooltipOptions.image
		);
		this._tooltipWidth = this._tooltipPicture.getWidth();
		this._dmgNumber = root.getMaterialManager().createImage(
			AoePosMenuTooltipOptions.materialFolder,
			AoePosMenuTooltipOptions.dmgNumber
		);
		this._hitNumber = root.getMaterialManager().createImage(
			AoePosMenuTooltipOptions.materialFolder,
			AoePosMenuTooltipOptions.hitNumber
		);
		this._dmgNumberWidth = this._dmgNumber.getWidth()/11;
		this._hitNumberWidth = this._hitNumber.getWidth()/11;
		this._dmgNumberHeight = this._dmgNumber.getHeight();
		this._hitNumberHeight = this._hitNumber.getHeight();				
	},

	draw: function(item, unit, targetUnit) {
		var x = LayoutControl.getPixelX(targetUnit.getMapX());
		var y = LayoutControl.getPixelX(targetUnit.getMapY());
		var dx = this._tooltipWidth/2;
		var dmg = AoeCalculator.calculateDamage(item, unit, targetUnit);
		var hit = AoeCalculator.getHit(item, unit, targetUnit);
		this._tooltipPicture.draw(x + 14, y - 14);
		NumberRenderer.drawCustomNumber(
			x + 14 + dx,
			y - 14 + 1,
			dmg,
			this._dmgNumber,
			0,
			this._dmgNumberWidth,
			this._dmgNumberHeight,
			255,
			false
		);
		NumberRenderer.drawCustomNumber(
			x + 14 + dx,
			y - 14 + 1 + 9,
			hit,
			this._hitNumber,
			0,
			this._hitNumberWidth,
			this._hitNumberHeight,
			255,
			true
		);
	}
};

AoeItemDamageUse.posMenuArtist = damagePosMenuArtist;

NumberRenderer.drawCustomNumber = function(x, y, number, pic, ySrc, width, height, alpha, isPercent) {
	var i, n;
	var count = 0;
	var digitArray = [];
	if (pic === null || number < 0) {
		return;
	}
	if (number === 0) {
		pic.setAlpha(alpha);
		pic.drawParts(x, y, 0, ySrc, width, height);
		return;
	}
	if(isPercent) {
		digitArray[0] = 10;
		count++;
	}
	while (number > 0) {
		n = Math.floor(number % 10);
		number = Math.floor(number / 10);
		digitArray[count] = n;
		count++;
	}
	x += Math.floor((width-1) * (count-2)/2);
	for (i = 0; i < count; i++) {
		pic.setAlpha(alpha);
		pic.drawParts(x, y, digitArray[i] * width, ySrc, width, height);
		x -= (width-1);
	}
};


