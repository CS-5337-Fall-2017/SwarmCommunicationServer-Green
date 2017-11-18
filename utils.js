/**
 * Created by samskim on 5/16/16.
 */
var enums = require('./enums');


// update global map with tiles from scanMap
exports.updateGlobalMap = function (map, tiles, rover, rovername, mapDate){
    tiles.forEach(function (tile) {
        
        // validate that data has all attributes and is in correct format
        if (validateTile(tile)) {
            var key = tile.x + "/" + tile.y;

            let mapTile = map[key];

            // ****** this is the science check logic ******
            //  if the tile exists in the map
            if (mapTile) {

                changed = false;
            	
            	// changes tiles to not have a rover if they have the same name
            	if (mapTile.rover == rover.name)  mapTile.rover = "";
                     
                // WTF??
        		mapTile.rover = tile.rover;
            	
            	// changes values of string
            	var scanned = mapTile.scanned;
            	
            	var chem = scanned.charAt(0);
            	var rada = scanned.charAt(1);
            	var radi = scanned.charAt(2);
            	var spec = scanned.charAt(3);
            	
            	if (tile.scanned.charAt(0) == "1") chem = "1";
            	if (tile.scanned.charAt(1) == "1") rada = "1";
            	if (tile.scanned.charAt(2) == "1") radi = "1";
            	if (tile.scanned.charAt(3) == "1") spec = "1";
            	
                mapTile.scanned = chem + rada + radi + spec;

                if (mapTile.scanned != scanned) {
                    changed = true;
                }

                // Stop here if the map is outdated.
                if (mapTile.lastUpdated > mapDate) return;

                // can overwrite only when the this rover is a sensor
                if (rover.sensor !== enums.NONE) {

                    // if sender's tile contains science, overwrite it
                    if (tile.science !== enums.NONE){
                        if (mapTile.science == "CRYSTAL" || tile.science == "CRYSTAL")
                        console.log("\t1 " + rovername + " UPDATED SCIENCE ON (" + tile.x + ", " + tile.y + ")", mapTile.science, "-->", tile.science);
                        mapTile.science = tile.science;
                        changed = true;

                        // else if sender's tile doesn't contain science, it can be two cases:
                        // 1. the science is a type such that can't be detected by sender's sensor - dont overwrite it
                        // 2. the science has been collected and gone. - overwrite it
                    }
                    else {
                        if (mapTile.science === rover.sensor) {
                            if (mapTile.science == "CRYSTAL" || tile.science == "CRYSTAL")
                            console.log("\t2 " + rovername + " UPDATED SCIENCE ON (" + tile.x + ", " + tile.y + ")", mapTile.science, "-->", tile.science, "using", rover.sensor);
                            mapTile.science = tile.science;
                            changed = true;
                        }
                    }

                }
                if (changed) mapTile.lastUpdated = new Date().getTime();
            }
            // if tile doesn't exist in the global map, add it
            else {
                tile.lastUpdated = new Date().getTime();
                if (tile.science == "CRYSTAL")
                console.log("\t3 " + rovername + " DISCOVERED TILE ON (" + tile.x + ", " + tile.y + ") NONE -->", tile.science);
                map[key] = tile;
            }

            // ****** science check logic end
            
        }
    })
}


// convert map object to global array
exports.mapToGlobal = function(map, scienceParam) {
    var key;
    var results = [];
    
    for (key in map) {

        if (map.hasOwnProperty(key)) {

            // if no parameter, just return the global map
            if (!scienceParam) {
                results.push(map[key]);
                // if scienceParam requested
            } else if (scienceParam) {
                // if all
                if (scienceParam === 'all') {
                    if (map[key].science !== enums.NONE) {
                        results.push(map[key]);
                    }

                    // excavate or drill
                } else if (scienceParam === 'excavate') {
                    if ((map[key].terrain === enums.terrain.SAND || map[key].terrain === enums.terrain.SOIL) 
                        && map[key].science !== enums.NONE)
                        results.push(map[key]);
                } else if (scienceParam === 'drill') {
                    if ((map[key].terrain === enums.terrain.GRAVEL || map[key].terrain === enums.terrain.ROCK)
                        && map[key].science !== enums.NONE)
                        results.push(map[key]);
                }
            }
        }
    }
    return results;
}

exports.getKey = function(x, y){
    if (validateXY(x,y))
        return x + '/' + y;

    else
        return false
}

exports.validateScience = function(science){
    if (!science || science !== enums.NONE || science !== enums.science.CRYSTAL || science !== enums.science.ORGANIC
        ||  science !== enums.science.RADIOACTIVE || science !== enums.science.MINERAL) return false;
    return true;
}

var validateXY = function(x, y){
    if (!x || !y) return false;
    if (!isInt(x) || !isInt(y)) return false;
    return true;
}

// object validator
var validateTile = function (tile) {

    if (!isInt(tile.x) || !isInt(tile.y)) return false;

    // validate science
    // validate terrain

    return true;
}

// check if coordinate is an integer
var isInt = function (value) {

    var x;
    if (isNaN(value)) {
        return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
}