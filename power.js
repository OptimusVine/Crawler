var power = function(name, type, uses, ability, amountMax, amountPlus){
    var p = {
        name: name,
        type: type,
        uses: uses,
        ability: ability,
        amountMax: amountMax,
        amountPlus: amountPlus
    }
    return p
}

module.exports = {
    power: power
}