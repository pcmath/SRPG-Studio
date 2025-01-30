/*
Modified by Sir Francis of the Filth, thanks Francis!
*/

var AoeItemStatusUse = defineObject(BaseAoeItemUse, {
    _dynamicEvent: null,
    _targetPos: null,
    _itemTargetInfo: null,
    _itemUseParent: null,
    _state: null,
    _item: null,
    _effectArray: null,

    _prepareData: function (itemUseParent) {
        this._itemUseParent = itemUseParent;
        this._itemUseParent.damageCalculation = false;
        this._itemTargetInfo = itemUseParent.getItemTargetInfo();
        this._item = this._itemTargetInfo.item;
        this._state = root.getBaseData().getStateList().getDataFromId(this._item.custom.aoe.stateId);
        this._targetPos = this._itemTargetInfo.targetPos;
        this._registerEffect();
        this._dynamicEvent = createObject(DynamicEvent);
        generator = this._dynamicEvent.acquireEventGenerator();
        generator.locationFocus(this._targetPos.x, this._targetPos.y, true);
        this.changeCycleMode(AoeItemUseMode.START);
        this._dynamicEvent.executeDynamicEvent();
    },

    enterMainUseCycle: function (itemUseParent) {
        this._prepareData(itemUseParent);
        return EnterResult.OK;
    },

    moveMainUseCycle: function () {
        var mode = this.getCycleMode();
        var result = MoveResult.CONTINUE;

        if (mode === AoeItemUseMode.START) {
            result = this._moveEvent();
            this.changeCycleMode(AoeItemUseMode.ANIME);
        } else if (mode === AoeItemUseMode.ANIME) {
            result = this.moveAnime();
        } else if (mode === AoeItemUseMode.USEAFTER) {
            result = this.moveStates();
        }
        return result;
    },

    drawMainUseCycle: function () {
        var mode = this.getCycleMode();
        var result = MoveResult.CONTINUE;
        if (mode === AoeItemUseMode.ANIME) {
            this.drawEffect();
        }
    },

    _registerEffect: function () {
        var effect, pos, i;
        var anime = this._state.getEasyAnime();
        var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, this._item, this._itemTargetInfo.unit);
        var targetArray = this.getTargetList(indexArray);
        this._effectArray = [];

        if (anime !== null) {
            for (i = 0; i < targetArray.length; i++) {
                var unit = targetArray[i];
                pos = LayoutControl.getMapAnimationPos(unit.getMapX() * GraphicsFormat.MAPCHIP_WIDTH, unit.getMapY() * GraphicsFormat.MAPCHIP_HEIGHT, anime);
                effect = createObject(RealEffect);
                effect.setupRealEffect(anime, pos.x, pos.y, true, this);
                effect.setEasyFlag(true);
                effect.setAsync(true);
                this._effectArray.push(effect);
            }
        }
    },

    /*
    moveMainUseCycle: function () {
        if (this._itemUseParent.damageCalculation) {
            return MoveResult.CONTINUE;
        }
        var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, this._item, this._itemTargetInfo.unit);
        var state = this._state;
        var targetArray = this.getTargetList(indexArray);
        for (var i = 0, count = targetArray.length; i < count; i++) {
            StateControl.arrangeState(targetArray[i], state, IncreaseType.INCREASE);
        }
    },
*/
    _moveEvent: function () {
        if (this._dynamicEvent.moveDynamicEvent() == MoveResult.END) {
            var generator = this._dynamicEvent.acquireEventGenerator();
            var x = LayoutControl.getPixelX(this._targetPos.x);
            var y = LayoutControl.getPixelY(this._targetPos.y);
            this.changeCycleMode(AoeItemUseMode.ANIME);
            this._dynamicEvent.executeDynamicEvent();
        }
        return MoveResult.CONTINUE;
    },

    moveAnime: function () {
        if (this._itemUseParent.damageCalculation) {
            return MoveResult.CONTINUE;
        }
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
        if (this._effectArray.length == 0) {
            this.changeCycleMode(AoeItemUseMode.USEAFTER);
        }
        return MoveResult.CONTINUE;
    },

    moveStates: function () {
        if (this._itemUseParent.damageCalculation) {
            return MoveResult.CONTINUE;
        }
        var indexArray = AoeRangeIndexArray.getEffectRangeItemIndexArray(this._targetPos.x, this._targetPos.y, this._item, this._itemTargetInfo.unit);
        var state = this._state;
        var targetArray = this.getTargetList(indexArray);
        for (var i = 0, count = targetArray.length; i < count; i++) {
            StateControl.arrangeState(targetArray[i], state, IncreaseType.INCREASE);
        }
        return MoveResult.END;
    },

    drawEffect: function () {
        var effectArray = this._effectArray;
        for (var i = 0, count = effectArray.length; i < count; i++) {
            effectArray[i].drawEffect(0, 0);
        }
    },

    _moveMainUseCycle: function () {}
});
