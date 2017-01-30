var character = require('./character').character
var power = require('./power').power
var town = require('./town').town


var populateMonsters = function(){
    console.log("Populating Monsters for round : " + rounds)
    var orcs = Math.ceil(rounds + Math.random() * 2)
    for(i=0;i<orcs;i++){
        monsters.push(new character({name: "Goblin " + i, healthMax: 4}, weapons[4]))
    }
    monsters.push(new character({name: "Ogre Lord", healthMax: rounds*5}, weapons[3]))
    console.log("Monster group size: " + monsters.length)
 }

var generateMonsters = function(d){
    var m = []
    console.log("Generating Monsters for round new Adventure")
    var orcs = Math.ceil(d + Math.random() * 2)
    for(i=0;i<orcs;i++){
        m.push(new character({name: "Goblin " + i, healthMax: 10}, items[4]))
    }
    m.push(new character({name: "Ogre Lord", healthMax: d*5}, items[3]))
    if(d>3){
        m.push(new character({name: "Ogre Mage", healthMax: (d-2)*8}, items[0],powers[3]))
    }
    console.log("This adventure has a group size: " + m.length)
    return m
 }

var adventure = function(n, m, l, o){
    var diffucluty = 0
    if(o && o.diffucluty){ diffucluty = o.diffucluty} else {diffucluty = 1}
    var a = {}
    a.name = n
    a.monsters = generateMonsters(o.diffucluty)
    a.loot = l
    a.other = o
    return a
}


module.exports = {
    adventure: adventure
}