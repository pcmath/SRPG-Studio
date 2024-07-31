var getDirectionTypeAngle = function(direction) {
	return direction * 90;
};

(function(){
	var alias0 = ItemMainFlowEntry._completeMemberData;
	ItemMainFlowEntry._completeMemberData = function(itemUseParent) {
		var result = alias0.call(this, itemUseParent); 
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		//this._dynamicAnime._motion is null when skipping the animation
		if (itemTargetInfo.angle != null && this._dynamicAnime._motion != null) {
			this._dynamicAnime._motion._animeSimple._angle = itemTargetInfo.angle;
		}
		return result;
	}

	var alias1 = AnimeSimple.drawMotion;
	AnimeSimple.drawMotion = function(frameIndex, i, animeRenderParam, animeCoordinates) {
		if(this._angle == null) {
			return alias1.call(this, frameIndex, i, animeRenderParam, animeCoordinates);
		}
		var pic, srcWidth, srcHeight;
		var x = this._animeData.getSpriteX(this._motionId, frameIndex, i);
		var y = this._animeData.getSpriteY(this._motionId, frameIndex, i);
		var width = this._animeData.getSpriteWidth(this._motionId, frameIndex, i);
		var height = this._animeData.getSpriteHeight(this._motionId, frameIndex, i);
		var degree = this._animeData.getSpriteDegree(this._motionId, frameIndex, i) + this._angle;
		var handle = this._animeData.getSpriteGraphicsHandle(this._motionId, frameIndex, i);
		var xSrc = handle.getSrcX();
		var ySrc = handle.getSrcY();
		var isAbsolute = this._animeData.isAbsoluteMotion(this._motionId);
		var obj = this._checkReverseInfo(frameIndex, i, animeRenderParam, animeCoordinates);
		var alpha = obj.alpha;
		var isRight = obj.isRight;
		var isReverse = obj.isReverse;
		
		pic = this._getMotionPicture(frameIndex, i, animeRenderParam);
		if (pic !== null) {
			if (alpha !== 0 && typeof obj.color !== 'undefined') {
				pic.setColor(obj.color, alpha);
			}
			else {
				pic.setAlpha(alpha);
			}
			pic.setDegree(degree);
			if (this._animeData.isMirrorAllowed()) {
				pic.setReverse(isReverse);
			}
			pic.setInterpolationMode(this._interpolationMode);
			
			if (this._animeData.getSpriteGraphicsType(this._motionId, frameIndex, i) === GraphicsType.PICTURE) {
				srcWidth = pic.getWidth();
				srcHeight = pic.getHeight();
			}
			else {
				srcWidth = GraphicsFormat.MOTION_WIDTH;
				srcHeight = GraphicsFormat.MOTION_HEIGHT;
			}
			
			this._drawSprite(x, y, width, height, pic, isAbsolute, isRight, xSrc, ySrc, srcWidth, srcHeight, animeCoordinates);
		}
	}
})();