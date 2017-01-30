 var processing = false
var ready = true
var wins = 0

var rounds = 0
var maxRounds = 3

var partyScore = 0

adventures = []
items = []
weapons = []
monsters = []
characters = []
powers = []

fighters = []

var adventure = require('./adventure').adventure
var character = require('./character').character
var power = require('./power').power
var town = require('./town').town

// POWERS


powers.push(new power("Heal Self", "Resurrection", 1, function(){return this.amountMax}, 8)) 
powers.push(new power("Flame Sword", "Enchantment", 1, function(){return this.amountMax},6, 5))
powers.push(new power("Heal Other", "Healing", 2, function(){},10, 2))
powers.push(new power("Magic Missle", "Damage", 4, function(){},4, 1))
powers.push(new power("Fireball", "Damage", 1, function(){},20, 2))


// ITEMS
var Item = function(o){
    var i = {
        type: o.type,
        subtype: o.subtype,
        name: o.name,
        description: o.description || "No description",
        amountMax: o.amountMax || 0,
        amountPlus: o.amountPlus || 0,
        percent: o.percent || 1,
        attacks: o.attacks,
        bonus: o.bonus,
    }
    return i
}

items.push(new Item({type: "Weapon", name: "None", amountMax: 1, amountPlus: 0, percent: .5}))
items.push(new Item({type: "Weapon", name: "Sword", amountMax: 8, amountPlus: 2, percent: 1, attacks: 2}))
items.push(new Item({type: "Weapon", name: "Hands", amountMax: 4, amountPlus: 0, attacks: 3, bonus: 2}))
items.push(new Item({type: "Weapon", name: "Tree", amountMax: 20, amountPlus: 4, percent: .2}))
items.push(new Item({type: "Weapon", name: "Dagger", amountMax: 4, amountPlus: 1}))
items.push(new Item({type: "Armor", name: "Plate Mail", amountPlus: 7}))
items.push(new Item({type: "Armor", name: "Chain Mail", amountPlus: 3}))


// CHARACTERS


var regenCharacters = function(){
    characters = []
    characters.push(new character({name: "Steve", healthMax: 15}, null, powers[1]))
    characters.push(new character({name: "Garric", healthMax: 20, class: "Paladin"}, null, powers[0]))
    characters.push(new character({name: "Johan", healthMax: 5, class: "Mage"}, null, [powers[3], powers[2], powers[4]]))
    characters.push(new character({name: "Bask", healthMax: 7}, null, powers[3]))
}

var equipCharacters = function(){
    characters[0].equip(items[1])
    characters[0].equip(items[6])
    characters[1].equip(items[5])
    characters[1].equip(items[1])
    characters[2].equip(items[4])
    characters[3].equip(items[2])

}


// MONSTERS




var regenAdventures = function(){
    adventures = []
    adventures.push(new adventure("Golden Hut", null, {gold: 5}, {diffucluty: 1, knowledge: "None"}))
 //   adventures.push(new adventure("Ogre Mountain", null, {gold: 20}, {diffucluty: 8, knowledge: "Lots"}))
 //   adventures.push(new adventure("Cheese Lane", null, {gold: 20}, {diffucluty: 3, knowledge: "None"}))
 //   adventures.push(new adventure("The Way Home", null, {gold: 5}, {diffucluty: 1, knowledge: "None"}))
 }


var usePowers = function(){
    if(monsters.length){
        monsters.forEach(function(m){
            m.usePower()
        })
    }
    if(characters.length){
        characters.forEach(function(c){
            c.usePower()
        })
    }
 }



// GAME 
//      Each turn in BATTLE, both side will go through the attack procedure
var battle = function(){
    if(monsters.length == 0 || characters.length == 0){return}
    attack(characters, monsters)
    attack(monsters, characters)
}

var findLowestAlly = function(team){
    var t = {name: 'None', health: 1, healthMax: 1}
    for(i=0;i<team.length;i++){
        var diff = team[i].healthMax - team[i].health
        if(diff > 0 && diff > (t).healthMax - t.health){
            t = team[i]
        }
    }
    return t
}

var findBestTarget = function(team){
    var t = team[0]
    for(i=0;i<team.length;i++){
        if(t.priority < team[i].priority){
            t = team[i]
        }
    }
    return t
}

var identifyTargets = function(team){
    team.forEach(function(t){
        t.priority = 0
        if(t.weapon.damageMax > 5){
            t.priority += 1
        }
        if(t.healthMax > 20 && t.health < 5){
            t.priority += 1
        }
        if(t.power && t.power.amountMax > 10){
            t.priority += 1
        }
    })

}

var rateTeam = function(team){
    var teamScore = 0
    team.forEach(function(m){
        var rating = 0
        rating = m.healthMax + ((m.weapon.amountMax + (m.weapon.amountPlus || 0 ))* (m.weapon.attacks || 1))
        if(m.powers){ 
            m.powers.forEach(function(p){
                rating += p.amountMax + p.amountPlus
            })
        } else {
            rating += m.power.amountMax + m.power.amountPlus
        }
        if(m.armor){rating += m.armorClass}
        teamScore += rating
    })
    console.log(teamScore + " is the team score")
    partyScore = teamScore
}

var decideNeed = function(c, t1, t2){
    t = {target: null, power: null}
    // Check the team for anyone that we can use healing on
    if(!c.powers || c.powers.length == 0){t.target = t2[0]; t.power = c.power} else {

  //      console.log(c.name + " says ' Which power should I use?'")
        while(t.power == null){
                for(i=0;i<c.powers.length;i++){
                    if(c.powers[i].uses > 0){
                        if(t2.length < 1 && c.powers[i].type == "Damage"){
                            // Skip spells that do damage if there are no enemies
                        } else {
                            t.power = c.powers[i]
                        }
                        
                    }
                }
     //           console.log(t.power)
                if(t.power == null){t.power = "None Left"}
        }
        if(t.power.type == "Healing"){
            t.target = findLowestAlly(t1)
        }
        if(t.power.type == "Damage" || t.power == "None"){
            t.target = findBestTarget(monsters)
        }
    }
    return t
}

var generateOrder = function(a){
    var compare = function (a, b) {
        if (a.order < b.order) {
            return -1;
        }
        if (a.order > b.order) {
            return 1;
        }
        // a must be equal to b
        return 0;
    }
    fighters = []
    for(i=0;i<a.length;i++){
        a[i].forEach(function(p){
            p.team = i
            p.order = Math.ceil(Math.random()*20)
            fighters.push(p)
        })
    }
    fighters.sort(compare)
    for(i=0;i<fighters.length;i++){
    //    console.log(fighters[i].name + " " + fighters[i].order)
    }
}

//      One team attacking the other team, selected in the "BATTLE" function
var attack = function(t1, t2){
    t1.forEach(function(c){
        
        if(c.class == "Mage"){
            // Decide what type of powers to use based on conditions of party")
            var x = decideNeed(c, t1, t2)
        //    console.log(x.target)
            if(x.target && x.target.name == "None" && t2[0]){console.log(c.name + " says, no one needs healing, attack!"); c.attack(t2[0])} else 
            if(x.power == "None"){console.log(c.name + " says, powers expended, attack!");c.attack(x.target)} else {
                c.setPower(x.power)
                c.usePower(x.target)
            } 
            
        }else { // For everyone else by CLASS
            if(t2.length > 0) {
            //    console.log("Attacking!")
                var target = findBestTarget(t2)
                if(c.powers && c.powers.length > 0 ){
                    var x = t.decideNeed(c, t1, t2)
                    c.setPower(x.power)
                }
                
                if(c.power && c.power.type == "Damage" && c.power.uses > 0){ // Use a damage spell if possible
        
                    c.usePower(target)
                } else if(c.power && c.power.type == "Healing" && c.power.uses > 0){ // Use a healing spell if possible
                    t1.forEach(function(p){
                        c.usePower(p)
                        })
                } else {
                    c.attack(target)
                }

                if(target.health < 1){
                    c.killCredit ++
                    console.log( target.name + " Has been killed by " + c.name)
                    try {
                        if(target.power.name == "Heal Self"){
                            target.usePower(0)
                        }
                    }catch(err){  }
                if(target.health < 1){ 
                    for(i=0;i<t2.length;i++){
                        if(t2[i].health < 1){
                            t2.splice(i,1)
                        }
                    }
                 }
                }

                }   
         }
        

    })
}

var determineMVP = function(team){
    var pos = 0
    for(i=1;i<team.length;i++){
        if(team[pos].killCredit < team[i].killCredit){
            pos = i
        }
    }
    console.log(team[pos].name + " is the MVP having Total Kills : " + team[pos].killCredit)
    team[pos].printChar()
    
 }

 //      Confirms the end of the game and announces the winner
var determineWinner = function(){
    if(monsters.length > 0){
        console.log("Monsters Win! \n \n \n")
        monsters.forEach(function(m){
            console.log(m.name + " lost " + (m.healthMax - m.health) + " health and dealt "+ m.damageDealt + " damage")
        })
        determineMVP(monsters)
        return false
    } else {
        console.log("Characters Win! \n \n \n")
        if(characters[0]){determineMVP(characters)}
        characters.forEach(function(m){
            console.log(m.name + " lost " + (m.healthMax - m.health) + " health and dealt "+ m.damageDealt + " damage")
            if(m.powers.length>0){
                m.powers.forEach(function(p){
                    console.log(p.name + " " + p.uses)
                })
            } else
            if(m.power){console.log(m.power.name + " " + m.power.uses)}
        })
        return true
    }
 }

var round = function(){
    rounds++
 //   populateMonsters()
 }

var headToTown = function(){
    
    if(characters.length == 1){
        var c = characters[0]
        console.log("We're down to a single survivor\n ... he has to decide what to do")
        if(Math.random() < .5){
            console.log("... He's calling it day \n" + c.name + " heads home")
            console.log("Kills : " + c.killCredit)
            console.log("Damage: "+ c.damageDealt)
            characters.splice(0,1)

        } else {
            console.log(characters[0].name + " screams 'FOR TRITHEREON!' and charges in to certain death")
            if(characters[0].power.uses == 0){
                characters[0].power.uses = 1
            }
        }
    }
}

var game = function(){
    regenAdventures()
    regenCharacters()
    equipCharacters()
    rateTeam(characters)
     console.log(characters)
    // console.log(monsters)
    // console.log(weapons)
    // console.log(powers)
    while(characters.length > 0 && rounds < adventures.length ){
             
        console.log("\n\n ***** NEW ROUND " + (rounds) + "*****\n\n")
        if(adventures[rounds]){
            console.log("Starting new Adventure : " + adventures[rounds].name)
            monsters = adventures[rounds].monsters
            teams = [characters, monsters]
            generateOrder(teams)
            //    console.log("\nOur party comes across ") 
            monsters.forEach(function(m){
            //    console.log(m.name + " with health " + m.health)
            })
        }
        headToTown()
     
        while(monsters.length>0 && characters.length>0){
        //    console.log("\n** NEW TURN **")
        //    console.log("Characters : " + characters.length + " vs. Monsters : " + monsters.length + "\n")
            identifyTargets(monsters)
            usePowers()
            battle()
            
        }
        if(monsters.length == 0){console.log("\n Adventure Cleared! \n")}
         round()   
    }
    if(rounds = maxRounds){console.log("\n\nThey have reached the END!")}
    console.log(partyScore)
    return determineWinner()
}

var play = function(){
        new game()
}

play()



