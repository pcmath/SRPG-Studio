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

var AoeItemDamageUse = defineObject(BaseAoeItemUse,
{
	_dynamicEvent: null,
	_targetPos: null,
	_itemTargetInfo: null,
	_itemUseParent: null,
	_dynamicAnime: Array(),
	_deadUnit: Array(),
	_damageHitFlow: Array(),
	_entry: Array(),
	_effectArray: Array(),
	_eraseCounter: 0,

	_prepareData: function() {
		this._dynamicAnime = Array();
		this._entry = Array();
		this._deadUnit = Array();
		this._eraseCounter = createObject(EraseCounter);
		this._damageHitFlow = null;
		this._effectArray = Array();
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
		if (damage < 1 || !damage) {
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
			result = this.moveEffect();
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
	},

	_moveEvent: function() {
		if(this._dynamicEvent.moveDynamicEvent() == MoveResult.END) {
			var generator = this._dynamicEvent.acquireEventGenerator();
			var x = LayoutControl.getPixelX(this._targetPos.x);
			var y = LayoutControl.getPixelY(this._targetPos.y);
			this.changeCycleMode(AoeItemUseMode.ANIME);
			this._dynamicEvent.executeDynamicEvent();
		}
		return MoveResult.CONTINUE;
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
		var targetUnit;
		var soundHandle = root.querySoundHandle('damage');
		var anime = root.queryAnime('easydamage');
		var targetArray = this.getTargetList(indexArray, item);
		var x, y, pos, entry;
		for(var i = 0, count = targetArray.length; i < count; i++) {
			targetUnit = targetArray[i];		
			x = LayoutControl.getPixelX( targetUnit.getMapX() );
			y = LayoutControl.getPixelY( targetUnit.getMapY() );
			entry = {
				x: x,
				y: y,
				targetUnit: targetUnit,
				attackEntry: AoeCalculator.calculateAttackEntry(unit, targetUnit, item)
			};
			if(entry.attackEntry.isHit) {
				MediaControl.soundPlay(soundHandle);
				pos = LayoutControl.getMapAnimationPos(x, y, anime);
				var dynamicAnime = createObject(DynamicAnime);
				dynamicAnime.startDynamicAnime(anime, pos.x, pos.y);
				this._dynamicAnime.push(dynamicAnime);
			}
			this._entry.push(entry);
			this._itemUseParent._AoeItemExp += AoeCalculator.getExp(
				unit,
				targetUnit,
				this._entry[this._entry.length-1].attackEntry.passiveDamageFull
			);
			this._registerEntryEffect(entry);
		}
		this._itemUseParent.damageCalculation = false;
		this.changeCycleMode(AoeItemUseMode.DAMAGE);
		this._dynamicEvent.executeDynamicEvent();
		return MoveResult.CONTINUE;
	},

	_registerEntryEffect: function(entry) {
		var anime, effect, pos;
		var isNoDamage = !entry.attackEntry.damagePassiveFull;
		if (isNoDamage) {
			if(entry.attackEntry.isHit) {
				anime = root.queryAnime('easynodamage');
			}
			else {
				var anime = root.queryAnime('easyavoid');
			}
		}
		else if (entry.attackEntry.isCritical) {
			anime = root.queryAnime('easycriticalhit');
		}
		else {
			anime = null;
		}
		if (anime !== null) {
			pos = LayoutControl.getMapAnimationPos(entry.x, entry.y, anime);
			effect = createObject(RealEffect);
			effect.setupRealEffect(anime, pos.x, pos.y, true, this);
			effect.setEasyFlag(true);
			effect.setAsync(true);
			this._effectArray.push(effect);
		}
		if (!isNoDamage && EnvironmentControl.isDamagePopup()) {
			this._registerDamageEffect(entry);
		}
	},

	_registerDamageEffect: function(entry) {
		var dx = Math.floor((DamagePopup.WIDTH - GraphicsFormat.CHARCHIP_WIDTH) / 2);
		var dy = Math.floor((DamagePopup.HEIGHT - GraphicsFormat.CHARCHIP_HEIGHT) / 2);
		var direction = AoeRangeIndexArray.getUnitDirection(
			this._itemTargetInfo.unit.getMapX(),
			this._itemTargetInfo.unit.getMapY(),
			entry.targetUnit.getMapX(),
			entry.targetUnit.getMapY()
		);
		if (direction === DirectionType.TOP || direction === DirectionType.BOTTOM) {
			if (entry.x >= root.getGameAreaWidth() - 64) {
				dx -= 64;
			}
		}
		else if (direction === DirectionType.LEFT || direction === DirectionType.RIGHT) {
			dx -= 32;
			if (entry.y >= root.getGameAreaHeight() - 32) {
				dy -= 32;
			}
			else {
				dy += 32;
			}
		}
		var effect = createObject(DamagePopupEffect);
		effect.setPos(entry.x + dx, entry.y + dy, entry.attackEntry.damagePassiveFull);
		effect.setAsync(true);
		effect.setCritical(entry.attackEntry.isCritical);
		this._effectArray.push(effect);
	},

	moveDamage: function() {
		var length = this._dynamicAnime.length;
		var isEnd = true;
		for ( var i = 0; i < length; i++ ) {
			if (this._dynamicAnime[i].moveDynamicAnime() == MoveResult.CONTINUE) {
				isEnd = false;
				continue;
			}
			this._dynamicAnime[i].endEffect();
		}
		if(this.moveEffect() == MoveResult.CONTINUE) {
			return MoveResult.CONTINUE;
		}
		if(!isEnd) {
			return MoveResult.CONTINUE;
		}
		for (var i = 0, count = this._entry.length; i < count; i++ ) {
			var entry = this._entry[i];
			this._setDamage( entry.targetUnit, entry.attackEntry.damagePassiveFull );
			if( this._isLosted(entry.targetUnit) ) {
				entry.targetUnit.setInvisible(true);
				this._deadUnit.push( entry.targetUnit );
				this.changeCycleMode(AoeItemUseMode.ERASE);
			}
		}
		this.changeCycleMode(AoeItemUseMode.USEAFTER);
		return MoveResult.CONTINUE;
	},

	moveEffect: function() {
		var effect;
		for (var i = 0, count = this._effectArray.length; i < count; i++) {
			effect = this._effectArray[i];
			effect.moveEffect();
			if (effect.isEffectLast()) {
				this._effectArray.splice(i, 1);
				i--;
				count--;
			}
		}
		if(this._effectArray.length == 0) {
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;
	},

	drawDamage: function() {
		var effect, effectArray = this._effectArray;
		for (var i = 0, count = effectArray.length; i < count; i++) {
			effectArray[i].drawEffect(0, 0);
		}
	},

	moveErase: function() {
		if (this._eraseCounter.moveEraseCounter() !== MoveResult.CONTINUE) {
			this.changeCycleMode(AoeItemUseMode.FLOWENTRY);
		}
		return MoveResult.CONTINUE;
	},

	moveFlowEntry: function() {
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

	getUnitTypeAllowed: function(unit, targetUnit) {
		if( FilterControl.isReverseUnitTypeAllowed(unit, targetUnit) === false ) {
			return true;
		}
		return false;
	},

	potencyArtist: {
		_textUi: null,
		_statusArray: null,
		initialize: function(unit, item, targetUnit) {
			this._statusArray = AttackChecker.getAttackStatusInternal(unit, AoeCalculator.getWeapon(item, unit), targetUnit);
		},
		getWindowTextUI: function() {
			return this._textui;
		},
		getSentenceCount: function() {
			return 1;
		},
		draw: function(x, y, textui) {
			this._textui = textui;
			PosAttackWindow.drawInfoBottom.call(this, x, y - 90);
		}
	}
});