class AntSimple extends Ant{
	constructor(canvas, position, rotation, settings, collisionObjs, parentHive){
	    super(canvas, position, rotation, settings, collisionObjs, parentHive);
	}

	iterate(){
		var searchForFood = (this.getFoodStorage() > this.getMaxFoodStorage()*0.75);
		var nearestFood = false;
		var hive = false;

		// search for food
		if (!searchForFood){
			// Check if ant can see food
			for(var i=0; i<this.visibleObjs.length; i++){
				if (this.visibleObjs[i] instanceof Food){
					nearestFood = this.visibleObjs[i];
				}
			}

			// food can be seen
			if (nearestFood instanceof Food){
				var canBeHarvested = nearestFood.canInteractWith(this);
				var canHarvestMore = (this.getFoodStorage() < this.getMaxFoodStorage());

				// harvest food if possible
				if(canBeHarvested && canHarvestMore){
					var harvestAmount = this.getMaxFoodStorage() - this.getFoodStorage();
					return [ActionType.HARVEST, nearestFood, harvestAmount];
				}
				// walk towards food
				else if (canHarvestMore){
					var fromObjToDirRad = this.getAngleToObject(nearestFood);
					return [ActionType.WALK, Direction.FORWARD, fromObjToDirRad];
				}
			}
			else {
				// try to smell food and walk towards position
				for (var i=0; i<this.smelledObjs.length; i++){
					if (this.smelledObjs[i] instanceof SmellableObjectProxy
					&& this.smelledObjs[i].getType() == "Food"){
						nearestFood = this.smelledObjs[i];
					}
				}
				if (nearestFood != false){
					var fromObjToDirRad = this.getAngleToObject(nearestFood);
					return [ActionType.WALK, Direction.FORWARD, fromObjToDirRad];
				}
				// search for food
				else{
					return [ActionType.WALK, Direction.FORWARD, rand(-0.5,0.5)];
				}
			}
		}

		// search for hive and return food
		else{

			// Check to kill some ants
			for(var i=0; i<this.visibleObjs.length; i++) {
				if(this.visibleObjs[i] instanceof Ant) {
					var nearAnt = this.visibleObjs[i];
					if (nearAnt[_parentHive] != this[_parentHive]) {
						if (nearAnt[_life] <= this[_life]) {
							if (nearAnt.canInteractWith(this)) {
								return [ActionType.ATTACK, this.visibleObjs[i]]
							}
							else {
								var fromObjToDirRad = this.getAngleToObject(nearAnt);
								return [ActionType.WALK, Direction.FORWARD, fromObjToDirRad];
							}
						}
					}
				}
			}

			// Check what can the ant see
			for(var i=0; i<this.visibleObjs.length; i++)
				if(this.visibleObjs[i] instanceof Hive) {
					// Only bring food to own hive
					if (this.visibleObjs[i].hiveNumber == this[_parentHive])
						hive = this.visibleObjs[i];
				}

			// hive can be seen
			if (hive instanceof Hive){
				var canGiveFood = hive.canInteractWith(this);

				// harvest food if possible
				if(canGiveFood){
					return [ActionType.GIVEFOOD, hive, this.getFoodStorage()*0.75];
				}
				// walk towards food
				else {
					var fromObjToDirRad = this.getAngleToObject(hive);
					return [ActionType.WALK, Direction.FORWARD, fromObjToDirRad];
				}
			}
			else {
				// try to smell hive and walk towards position
				for (var i=0; i<this.smelledObjs.length; i++){
					if (this.smelledObjs[i] instanceof SmellableObjectProxy
					&& this.smelledObjs[i].getType() == "Hive"){
						hive = this.smelledObjs[i];
					}
				}
				if (hive != false){
					var fromObjToDirRad = this.getAngleToObject(hive);
					return [ActionType.WALK, Direction.FORWARD, fromObjToDirRad];
				}
				// search for hive
				else{
					return [ActionType.WALK, Direction.FORWARD, rand(-0.5,0.5)];
				}
			}
		}
	}
}
