define(function() {

return class SettingsSimulation
{
	constructor(mode, playerSettings){
		this.mode = mode;
		this.hiveSize = 14;
		this.antSize = 5;
		this.antStartNumber = 10;
		this.antStartPositionDistance = 40;
		this.antLife = 100;
		this.antSpeed = 2.5;
		this.antAttackDamage = 1;
		this.antSpeedRotation = 0.2; // radians
		this.antDecayProb = 0.05; // probability of "ageing" -> dying
		this.antFoodBonusProb = -0.005; // bonus probability to reduce "ageing" when carrying food
		this.antSmellingDistance = 50;
		this.antVisibilityDistance = 30;
		this.antVisibilityRange = 0.8;
		this.foodAmount = 250;
		this.foodAmountDeadAnt = 25;
		this.foodAmountDeadSpider = 200;
		this.foodDecayProb = 0.25; // probability of rotting
		this.foodSize = 0.005; // percentage of food amount
		this.foodCreationProbability = 0.05; // chance for each iteration to create food
		this.foodMaxSiteNumber = 10; // maximum number of food sites
		this.foodMaxHive = 100; // food till next ant
		this.foodMaxAnt = 35;
		this.foodMaxHarvestAmountAnt = 1;
		this.spiderSize = 10;
		this.spiderSizeLevelFactor = 3;
		this.spiderLife = 500;
		this.spiderSpeed = 1;
		this.spiderSpeedRotation = 0.05; // radians
		this.spiderAttackDamage = 3;
		this.spiderCreationProb = 0.001;
		this.spiderDecayProb = 0.3;
		this.spiderSmellingDistance = 50;
		this.spiderVisibilityDistance = 30;
		this.spiderVisibilityRange = 0.8;
		this.pheromoneSize = 12; // sets the smelling distance 
		this.pheromoneDecayProb = 0.12; 
		this.sizeSmellingFactor = 6;
		this.interactionDistance = 5;
		this.interactionRange = Math.PI*0.25;
		this.rotationSpeedReduction = 0.5; // 50% of speed is reduced when rotation is max
		this.playerSettings = playerSettings;
		for (var s in playerSettings)
			// check if neural network ants do have a brain
			if (playerSettings[s].antType == AntType.NEURALNET
			&& playerSettings[s].globalMemory == null)
				throw new TypeError("No neural network existing!")

	}
	// attribute related settings
	getMode() { return this.mode; } // SOLO / COMPETETIVE
	getTerrariumWidth(){ return this.terrariumWidth; }
	getTerrariumHeight(){ return this.terrariumHeight; }
	getHiveSize(){ return this.hiveSize; }
	getAntDecayProb(){ return this.antDecayProb; }
	getAntFoodBonusProb(){ return this.antFoodBonusProb; }
	getAntSize(){ return this.antSize; }
	getAntStartNumber(){ return this.antStartNumber; }
	getAntLife(){ return this.antLife; }
	getAntSpeed(){ return this.antSpeed; }
	getAntSpeedRotation(){ return this.antSpeedRotation; }
	getAntAttackDamage() { return this.antAttackDamage; }
	getAntPositionDistance(){ return this.antStartPositionDistance; }
	getAntSmellingDistance() { return this.antSmellingDistance; }
	getAntVisibilityDistance() { return this.antVisibilityDistance; }
	getAntVisibilityRange() { return this.antVisibilityRange; }
	getSpiderSize() { return this.spiderSize; }
	getSpiderSizeLevelFactor() { return this.spiderSizeLevelFactor; }
	getSpiderLife(){ return this.spiderLife; }
	getSpiderSpeed(){ return this.spiderSpeed; }
	getSpiderSpeedRotation(){ return this.spiderSpeedRotation; }
	getSpiderAttackDamage() { return this.spiderAttackDamage; }
	getSpiderCreationProbability() { return this.spiderCreationProb; }
	getSpiderDecayProb(){ return this.spiderDecayProb; }
	getSpiderSmellingDistance() { return this.spiderSmellingDistance; }
	getSpiderVisibilityDistance() { return this.spiderVisibilityDistance; }
	getSpiderVisibilityRange() { return this.spiderVisibilityRange; }
	getFoodSize(){ return this.foodSize; }
	getFoodAmount(){ return this.foodAmount; }
	getFoodAmountDeadAnt(){ return this.foodAmountDeadAnt; }
	getFoodAmountDeadSpider(){ return this.foodAmountDeadSpider; }
	getFoodDecayProb(){ return this.foodDecayProb; }
	getFoodCreationProbability(){ return this.foodCreationProbability; }
	getFoodMaxSiteNumber(){ return this.foodMaxSiteNumber; }
	getFoodMaxHive(){ return this.foodMaxHive; }
	getFoodMaxAnt(){ return this.foodMaxAnt; }
	getFoodMaxHarvestAmountAnt(){ return this.foodMaxHarvestAmountAnt; }
	getPheromoneSize(){ return this.pheromoneSize; }
	getPheromoneDecayProb(){ return this.pheromoneDecayProb; }
	getSizeSmellingFactor() { return this.sizeSmellingFactor; }
	getInteractionDistance() { return this.interactionDistance; }
	getInteractionRange() { return this.interactionRange; }
	getRotationSpeedReduction() { return this.rotationSpeedReduction; }
	getPlayerSettings() { return this.playerSettings; }
}

});