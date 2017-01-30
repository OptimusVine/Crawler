var power = require('./power').power

var character = function(o, w, p, a){
    if(!o.name){
        console.log("Missing Data")
        return false
    }


    // Declare variables for Variables
        o.armorClass = 10 
        o.toHitBonus = 0 + o.toHitBonus
        o.powers = []
        o.damageDealt = 0
        o.killCredit = 0
        o.priority = 0
        o.health = o.healthMax
        o.equipment = []
        o.attacksPerTurn = 1

    // Define calculating functions

    var calcToHit = function(){
        o.armorClass = 10         
    }
    calcToHit()

    o.printChar = function(){
        console.log("Name: " + o.name + " - Class : " + o.class)
        if(o.armor){console.log("Armor: " + o.armor.name + " adding class " + o.armor.amountPlus)}
        if(o.weapon){console.log("Weapon: " + o.weapon.name + " with bonus " + o.weapon.amountPlus)}
        if(o.power){console.log("Active Power: " + o.power.name + " with uses " + o.power.uses)}
        console.log("Damage Received : " + (o.healthMax - o.health) + " Damage Dealt: " + o.damageDealt)
        console.log("")
    }
    



    // Define Interactions Character takes
    o.attack = function(t){   
        var swings = 0
           while(swings<o.attacksPerTurn){
               var swingAccy = Math.ceil((Math.random() * 20 * o.weapon.percent ))
                if(o.weapon.bonus){ swingAccy += o.weapon.bonus } 
                if(t.health || t.health >0){ 
                    hit = function(){
                        if(t.armorClass < swingAccy || swingAccy == 20 ){ return true} else { 
                            return false }
                    }
                    if(hit()){

                        var dam = Math.ceil(o.weapon.amountPlus + Math.random() * o.weapon.amountMax)
                        if(t.health < dam){dam = t.health}
                        if(swingAccy == 20){ console.log("Critical Hit!"); dam = dam * 2}
                        o.damageDealt += dam
                        t.health -= dam
                        console.log(o.name + " swings at " + t.name + " ["+ t.priority + "] for " + dam)
                     //   return(t)
                    } else {
                        if(o.attacksPerTurn > 1 && swings-1 < o.attacksPerTurn ){
                            console.log("A miss ends the turn for " + o.name)
                        }
                        swings = 100
                        
                    }
                }
          //      if(o.attacksPerTurn > 1){console.log(o.name + " gets multiple swings!")}
                swings++
            }
        }
    o.setPower = function(p){ // Use this to set the power from the list of powers
                if(p){
                    o.power = p
                    }
                }

    o.usePower = function(t){
            if(o.power){
                if(o.power.type == "Resurrection" && o.power.uses > 0 && o.health < 1){
                    console.log(o.name + " uses " + o.power.type + " : " + o.power.name + "!")
                    o.health = o.power.ability()
                    o.power.uses -= 1
                }
                if(o.power.type == "Enchantment" && o.power.uses > 0){
                    console.log(o.name + " uses " + o.power.type + " : " + o.power.name + "!")
                    o.weapon.damageMax += o.power.ability()
                    o.power.uses -= 1
                }
                if(o.power.type == "Damage" && o.power.uses > 0 && t){
                    console.log(o.name + " uses " + o.power.type + " : " + o.power.name + "!")
                    o.power.uses -= 1
                    if(t.health || t.health >0  ){
                        var dam  = Math.ceil(o.power.amountPlus + Math.random() * o.power.amountMax)
                        o.damageDealt += dam
                        t.health -= dam
                        console.log(t.name + " has been damaged for " + dam)
                        return(t)
                    }
                }
                if(o.power.type == "Healing" && o.power.uses > 0 && t){    
                    if(t.health && t.health >0 && (t.health < t.healthMax) ){
                        console.log(o.name + " uses " + o.power.type + " : " + o.power.name + "!")
                        o.power.uses -= 1
                        var heal  = Math.ceil(o.power.amountPlus + Math.random() * o.power.amountMax)
                        o.damageDealt += heal
                        t.health += heal
                        console.log(t.name + " has been healed for " + heal)
                        return(t)
                    } else {
                        // console.log("Not using the spell")
                    }
                }
            }
        }

    o.equip = function(i){
        if(!i.type){
            console.log("There is no type for the item")
            return
        } 
        if(i.type == "Weapon"){
            o.weapon = i
            o.equipment.push(i)
            
            if(o.weapon.attacks){o.attacksPerTurn = o.weapon.attacks}
            console.log(o.name + " has attacks " + o.attacksPerTurn)
        }
        if(i.type == "Armor"){
            o.armor = i
            o.equipment.push(i)
            o.armorClass = 10 + o.armor.amountPlus
        }
    }


    // Create Character
        if(!o.class){o.class = "Fighter"}

        if(w){
            o.weapon = w
        } else {
            o.weapon = weapons[0]
        }
        if (Array.isArray(p)){
            p.forEach(function(pow){
                o.powers.push(new power(pow.name, pow.type, pow.uses, pow.ability, pow.amountMax, pow.amountPlus))
            })
        }else if(p){
            o.power = new power(p.name, p.type, p.uses, p.ability, p.amountMax, p.amountPlus)
        }

       
        
        return o
    
 }

 module.exports = {
     character: character
 }