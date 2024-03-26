var AoeItemUseMode = {
	START		: 0,
	ANIME		: 1,
	DAMAGE		: 2,
	ERASE		: 3,
	FLOWENTRY	: 4,
	FLOW		: 5,
	USEAFTER	: 8,
	END		: 9
};

var AoeItemDamageUse = defineObject(BaseItemUse,
{
	_dynamicEvent: null,
	_targetPos: null,
	_itemTargetInfo: null,
	_itemUseParent: null,

	_dynamicAnime: Array(),
	_HitUnit: Array(),
	_AvoidUnit: Array(),
	_deadUnit: Array(),
	_HitDamage: Array(),
	_damageHitFlow: Array(),

	_eraseCounter: 0,
	_FrameCount: 0,

	_prepareData: function() {
		this._dynamicAnime = Array();
		this._HitUnit = Array();
		this._AvoidUnit = Array();
		this._deadUnit = Array();
		this._HitDamage = Array();
		this._FrameCount = 0;
		this._eraseCounter = createObject(EraseCounter);
		this._damageHitFlow = null;
	},
	
	enterMainUseCycle: function(itemUseParent) {
		this._prepareData();
		var generator;
		this._itemUseParent = itemUseParent;
		this._itemUseParent.damageCalculation = true;
		this._itemTargetInfo = itemUseParent.getItemTargetInfo();
		this._targetPos = this._itemTargetInfo.targetPos;
		this._itemUseParent._AoeItemExp = 0;
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();
		generator.locationFocus(this._targetPos.x, this._targetPos.y, true);
		this.changeCycleMode(AoeItemUseMode.START);
		this._dynamicEvent.executeDynamicEvent();
		return EnterResult.OK;
	},
	
	_drawFlow: function() {
		this._damageHitFlow.drawDamageHitFlowCycle();
	},
	
	_isLosted: function(unit) {
		return unit.getHp() <= 0;
	},
	
	_setDamage: function(unit, damage) {
		var hp;
		if (damage < 1) {
			return;
		}
		hp = unit.getHp() - damage;
		if(hp > 0) {
			unit.setHp(hp);
			return ;
		}
		if (unit.isImmortal()) {
			unit.setHp(1);
			return ;
		}
		unit.setHp(0);
		DamageControl.setDeathState(unit);
	},

	moveUseAfter: function() {
		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END) {
			this.changeCycleMode(AoeItemUseMode.END);
		}
		return MoveResult.CONTINUE;
	},

	moveMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		
		if (mode === AoeItemUseMode.START) {
			result = this._moveEvent();
			this.changeCycleMode(AoeItemUseMode.ANIME);
		}
		else if (mode === AoeItemUseMode.ANIME) {
			result = this.moveAnime();
		}
		else if (mode === AoeItemUseMode.DAMAGE) {		
			result = this.moveDamage();
		}
		else if (mode === AoeItemUseMode.ERASE) {
			result = this.moveErase();
		}
		else if (mode === AoeItemUseMode.FLOWENTRY) {
			result = this.moveFlowEntry();
		}
		else if (mode === AoeItemUseMode.FLOW) {
			result = this.moveFlow();
		}
		else if (mode === AoeItemUseMode.USEAFTER) {
			result = MoveResult.END;
		}
		else if (mode === AoeItemUseMode.END) {
			result = MoveResult.END;
		}
		return result;
	},

	drawMainUseCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		if (mode === AoeItemUseMode.DAMAGE) {
			this.drawDamage();
		}
		else if (mode === AoeItemUseMode.ERASE) {
			this.drawErase();
		}
		else if (mode === AoeItemUseMode.FLOW) {
			this.drawFlow();
		}
		else if (mode === AoeItemUseMode.STATE) {
			this.drawState();
		}
		
	},

	_moveEvent: function() {
		var item = this._itemTargetInfo.item;
		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END) {
			var generator = this._dynamicEvent.acquireEventGenerator();
			var x = LayoutControl.getPixelX(this._targetPos.x);
			var y = LayoutControl.getPixelY(this._targetPos.y);
			this.changeCycleMode(AoeItemUseMode.ANIME);
			this._dynamicEvent.executeDynamicEvent();
		}
		return MoveResult.CONTINUE;
	},

	getTargetList: function(indexArray, item) {
		var count = indexArray.length;
		var isRecovery = false;
		var friendlyFire = true;
		var targetUnit, x, y;
		var result = [];
		for(var i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if(targetUnit === null) {
				continue;
			}
			if(!friendlyFire && this.getUnitTypeAllowed(this._itemTargetInfo.unit, targetUnit, isRecovery)) {
				continue;
			}
			result.push(targetUnit);
		}
		return result;
	},

	_setHitList: function(indexArray, item) {
		var targetList = this.getTargetList(indexArray, item);
		var count = targetList.length;
		var isRecovery = false;
		var targetUnit;
		if(isRecovery) {
			this._HitUnit.concat(targetList);
			return;
		}
		for(var i = 0; i < count; i++) {
			targetUnit = targetList[i];
			if(AoeCalculator.isHit(item, this._itemTargetInfo.unit, targetUnit) === false ) {
				this._AvoidUnit.push(targetUnit);
				continue;
			}
			this._HitUnit.push(targetUnit);				
		}
	},

	_doHealAction: function(targetUnit, value, generator, x, y) {
		var anime = root.queryAnime('easyrecovery');
		var damagePoint;
		var soundHandle = root.querySoundHandle('gaugechange');
		generator.hpRecovery( targetUnit, anime, value, RecoveryType.SPECIFY, true );
		damagePoint = Calculator.calculateRecoveryValue(targetUnit, value, RecoveryType.SPECIFY, 0) * -1;
		MediaControl.soundPlay(soundHandle);
		this._HitDamage.push( {unit:targetUnit, value:damagePoint, x:x, y:y} );
		return damagePoint;
	},
	
	moveAnime: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		if(this._dynamicEvent.moveDynamicEvent() !== MoveResult.END) {
			this._dynamicEvent.executeDynamicEvent();
			return MoveResult.CONTINUE;
		}

		var generator = this._dynamicEvent.acquireEventGenerator();
		var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, item, this._itemTargetInfo.unit);
		var index, targetUnit;
		var damagePoint = 0;
		var isRecovery = false;
		var x, y, pos;

		this._setHitList(indexArray, item);

		var hitLength = this._HitUnit.length;
		for (var i = 0; i < hitLength; i++ ) {
			targetUnit = this._HitUnit[i];		
			x = LayoutControl.getPixelX( targetUnit.getMapX() );
			y = LayoutControl.getPixelY( targetUnit.getMapY() );
			if(isRecovery) {
				damagePoint = this._doHealAction(targetUnit, damage, generator, x, y);
			}
			else {
				damagePoint = AoeCalculator.getDamage(item, unit, targetUnit);
				damagePoint = AoeCalculator.finalizeDamage(item, unit, targetUnit, damagePoint);
				var soundHandle = root.querySoundHandle('damage');
				MediaControl.soundPlay(soundHandle);
				var anime = root.queryAnime('easydamage');
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
				this._HitDamage.push( {unit:targetUnit, value:damagePoint, x:x, y:y} );						
			}
			this._itemUseParent._AoeItemExp += AoeCalculator.getExp(unit, targetUnit, damagePoint);
		}
		this._itemUseParent.damageCalculation = false;
		this.changeCycleMode(AoeItemUseMode.DAMAGE);
		this._dynamicEvent.executeDynamicEvent();
		return MoveResult.CONTINUE;
	},

	moveDamage: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var length = this._dynamicAnime.length;
		var hitLength = this._HitDamage.length;
		var avoidLength = this._AvoidUnit.length;
		var isEnd = true;

		for ( var i = 0; i < length; i++ ) {
			if (this._dynamicAnime[i].moveDynamicAnime() == MoveResult.CONTINUE) {
				isEnd = false;
				continue;
			}
			this._dynamicAnime[i].endEffect();
		}
		if(!isEnd) {
			return MoveResult.CONTINUE;
		}
		if( this._FrameCount > 50 ) {
			this.changeCycleMode(AoeItemUseMode.USEAFTER);
			for ( var i = 0; i < hitLength; i++ ) {
				var hit = this._HitDamage[i];
				this._setDamage( hit['unit'], hit['value'] );
				if( this._isLosted( hit['unit'] ) ) {
					hit['unit'].setInvisible(true);
					this._deadUnit.push( hit['unit'] );
					this.changeCycleMode(AoeItemUseMode.ERASE);
				}
			}
			this._FrameCount = 0;
		}
		else {
			this._FrameCount++;
		}
		return MoveResult.CONTINUE;
	},

	moveErase: function() {
		if (this._eraseCounter.moveEraseCounter() !== MoveResult.CONTINUE) {
			this.changeCycleMode(AoeItemUseMode.FLOWENTRY);
		}

		return MoveResult.CONTINUE;
	},

	moveFlowEntry: function() {
		var item = this._itemTargetInfo.item;
		var unit = this._itemTargetInfo.unit;
		var targetUnit = this._deadUnit.shift();
		if( targetUnit == null )  {
			this.changeCycleMode(AoeItemUseMode.USEAFTER);
			return MoveResult.CONTINUE;
		}
		this._damageHitFlow = createObject(DamageHitFlow);
		if (this._damageHitFlow.enterDamageHitFlowCycle(unit, targetUnit) === EnterResult.NOTENTER) {
			return MoveResult.CONTINUE;
		}
		this.changeCycleMode(AoeItemUseMode.FLOW);
		return MoveResult.CONTINUE;
	},
		
	moveFlow: function() {
		if( this._damageHitFlow.moveDamageHitFlowCycle() === MoveResult.END ) {
			this.changeCycleMode(AoeItemUseMode.FLOWENTRY);
		}
		return MoveResult.CONTINUE;
	},

	drawDamage: function() {
		var item = this._itemTargetInfo.item;
		var isRecovery = false;
		var length = this._dynamicAnime.length;
		var hitLength = this._HitDamage.length;
		var avoidLength = this._AvoidUnit.length;
		for ( var i = 0; i < length; i++ ) {
			this._dynamicAnime[i].drawDynamicAnime();
		}
		for ( var i = 0; i < hitLength; i++ ) {
			var hit = this._HitDamage[i];
			if( hit['value'] < 0 ) {
				TextRenderer.drawText(hit['x']+1, hit['y']+1, -hit['value'], -1, 0x101010, TextRenderer.getDefaultFont() );
				TextRenderer.drawText(hit['x'], hit['y'], -hit['value'], -1, 0x50ff50, TextRenderer.getDefaultFont() );
			}
			else {
				TextRenderer.drawText(hit['x']+1, hit['y']+1, hit['value'], -1, 0x101010, TextRenderer.getDefaultFont() );
				TextRenderer.drawText(hit['x'], hit['y'], hit['value'], -1, ColorValue.DEFAULT, TextRenderer.getDefaultFont() );
			}
		}
		for ( var i = 0; i < avoidLength; i++ ) {
			var targetUnit = this._AvoidUnit[i];
			var x = LayoutControl.getPixelX( targetUnit.getMapX() );
			var y = LayoutControl.getPixelY( targetUnit.getMapY() );
			TextRenderer.drawText(x+1, y+1, 'MISS', -1, 0x101010, TextRenderer.getDefaultFont() );
			TextRenderer.drawText(x, y, 'MISS', -1, 0x5050ff, TextRenderer.getDefaultFont() );
		}
	},

	drawErase: function() {
		var length = this._deadUnit.length;
		for ( var i = 0; i < length; i++ ) {
			var unit = this._deadUnit[i];
			var x = LayoutControl.getPixelX(unit.getMapX());
			var y = LayoutControl.getPixelY(unit.getMapY());
			var alpha = this._eraseCounter.getEraseAlpha();
			var unitRenderParam = StructureBuilder.buildUnitRenderParam();
			var colorIndex = unit.getUnitType();
			var animationIndex = MapLayer.getAnimationIndexFromUnit(unit);
			if (unit.isWait()) {
				colorIndex = 3;
			}
			if (unit.isActionStop()) {
				animationIndex = 1;
			}
			unitRenderParam.colorIndex = colorIndex;
			unitRenderParam.animationIndex = animationIndex;
			unitRenderParam.alpha = alpha;
			UnitRenderer.drawScrollUnit(unit, x, y, unitRenderParam);
		}
	},
	
	drawFlow: function() {
		if( this._damageHitFlow != null) {
			this._damageHitFlow.drawDamageHitFlowCycle();
		}
	},
	
	drawState: function() {
		var length = this._dynamicAnime.length;
		for ( var i = 0; i < length; i++ ) {
			this._dynamicAnime[i].drawDynamicAnime();
		}
	},

	getUnitTypeAllowed: function(unit, targetUnit, isRecovery) {
		if( isRecovery ) {
			if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === true ) {
				return true;
			}
		}
		else {
			if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === false ) {
				return true;
			}
		}
		return false;
	}
});
