/*
Change the AOE selector type to JUMP when the selection array is small
*/
(function(){
	var alias0 = AoeItemSelection.enterItemSelectionCycle;
	AoeItemSelection.enterItemSelectionCycle = function(unit, item) {
		var result = alias0.call(this, unit, item);
		if( AoeDictionary[AoeParameterInterpreter.getSelectionRangeType(item)].coordinateArray.length < 5) {
			root.log("test")
			this._posSelector.setPosSelectorType(PosSelectorType.JUMP);
			result = this.setInitialSelection();
		}
		return result;
	}
})();