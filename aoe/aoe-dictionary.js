/*
The coordinate array is an array of arrays.
Each sub array specifies a coordinate affected by the AoE.
In the subarray, the first coordinate is in the direction the unit faces.
The second coordinate is in the direction perpendicular to that.
[[0,0]] is the selected tile
*/

var AoeConstructor = {
	line: function(length) {
		var array = [];
		for(var i = 0; i < length; i++) {
			array.push([i, 0]);
		}
		return array;
	},
	taxicabCoordinates: function(distance) {
		var coordinates = [];
		for (var x = -distance; x <= distance; x++) {
			for (var y = -distance; y <= distance; y++) {
				if (Math.abs(x) + Math.abs(y) <= distance) {
					coordinates.push([x, y]);
				}
			}
		}
		return coordinates;
	}
};

var AoeDictionary = {
	"box": {
		name: "bx",
		coordinateArray: [
			[1,-1],[1,0],[1,1],
			[0,-1],[0,0],[0,1],
			[-1,-1],[-1,0],[-1,1]
		]
	},

	"bs": {
		name: "",
		coordinateArray: AoeConstructor.taxicabCoordinates(4)
	},

	"adjacent": {
		name: "Cross",
		coordinateArray: [[1, 0], [0, 1], [-1, 0], [0, -1]]
	},

	"knight": {
		name: "Knight",
		coordinateArray: [[2,1], [2,-1], [1,2], [1,-2], [-1,2], [-1,-2], [-2,1], [-2,-1]]
	},

	"cross": {
		name: "Cross",
		coordinateArray: [[0,0], [1, 0], [0, 1], [-1, 0], [0, -1]]
	},

	"hurricane": {
		name: "Cross",
		coordinateArray: [[0, 0], [-1, 1], [-2, 0], [-1, -1]]
	},

	2: {
		name: "X-Cross",
		coordinateArray: [[1, 1], [1, -1], [-1, 1], [-1, -1]]
	},

	3: {
		name: "Circle",
		coordinateArray: [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
	},

	"line3": {
		name: "Line",
		coordinateArray: AoeConstructor.line(3)
	},

	"line2": {
		name: "Line",
		coordinateArray: AoeConstructor.line(2)
	},

	"hline3": {
		name: "Horizontal Line",
		coordinateArray: [[0, -1], [0, 0], [0, 1]]

	},

	"fan": {
		name: "Fan",
		coordinateArray: [[0, 0], [1, -1], [1, 0], [1, 1]]
	},

	0: {
		name: null,
		coordinateArray: [[1, 0]]
	},

	"single": {
		name: "Single",
		coordinateArray: [[0,0]]
	}
};