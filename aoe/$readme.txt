This plugin is built off the version https://srpg-studio.fandom.com/wiki/Splash_Damage_Plugin of O-To's AoE plugin.
Up to date translation of O-To's plugin is available: https://github.com/Anarch16Sync/SRPG-Studio-Translated-Plugins/blob/O-to_Plugins/AoE%20Pack/

Original plugin: O-To
Modified version: PCMath

example custom parameter for AoE item:

{
	weapon: 4,
	aoe: {
		selectionRange: {
			rangeType: "adjacent"
		},
		effectRange: {
			rangeType: "line3"
		}
	}
}

adjacent selection, and line3 Aoe shape
The weapon will override to the specified Id if provided.
Set the item keyword to "AOE".
You can view and add AoE shapes in the aoe-dictionary.
Please note that skills are not passed from the override weapon.
The z_addon folder needs to be after the aoe scripts in reading order