var neuralNetworkAntCode = `
this.minimumFoodStorage = this.getMaxFoodStorage() * 0.14;

const NetworkAction = {
	WALK_FORWARD : 0,
	WALK_LEFT : 1,
	WALK_RIGHT : 2,
	ATTACK_NEAREST_ANT : 3,
	HARVEST_NEAREST_FOOD : 4,
	GIVE_FOOD_TO_HIVE : 5,
	ATTACK_SPIDER : 6
};

var _networkOutputSize = Object.keys(NetworkAction).length

function createFeatureVector() {
	
	var visibleObjects = this.getVisibleObjs();
	var smellableObjects = this.getSmelledObjs();

	var degreePerArea = 60;
	var degreeShift = degreePerArea / 2;
	var subAreas = 360/degreePerArea;

	var antList = new Array(subAreas);
	var foodList = new Array(subAreas);
	var hiveList = new Array(subAreas);
	var spiderList = new Array(subAreas);

	for (var i = 0; i < subAreas; ++i)
		antList[i] = foodList[i] = hiveList[i] = spiderList[i] = 0;
	
	var objsCategories = [this.visibleObjs, this.smelledObjs];
	for (var objs in objsCategories) {
		for (var id in objsCategories[objs]) {
			var rotation = objsCategories[objs][id].getRotationToObj() + degreeShift;
			while (rotation < 0) rotation += 360;
			while (rotation >= 360) rotation -= 360;
			var targetArea = Math.floor(rotation / degreePerArea);
			var isEnemy = objsCategories[objs][id].getParentID() != this.getParentID();

			if(objsCategories[objs][id].getObjectType() == ObjectType.ANT) {
				antList[targetArea] += (isEnemy) ? 1 : 0;
			} else if (objsCategories[objs][id].getObjectType() == ObjectType.FOOD) {
				foodList[targetArea] += 1;
			} else if (objsCategories[objs][id].getObjectType() == ObjectType.HIVE) {
				hiveList[targetArea] += (isEnemy) ? 0 : 1;
			} else if (objsCategories[objs][id].getObjectType() == ObjectType.SPIDER) {
				spiderList[targetArea] += 1;
			}
		}
	}
	
	// Normalization
	for (var i = 0; i < antList.length; ++i) {
		antList[i] = Math.min(antList[i],20)/20.;
		foodList[i] = Math.min(foodList[i],8)/8.;
		hiveList[i] = Math.min(hiveList[i],2)/2.;
		spiderList[i] = Math.min(spiderList[i],2)/2.;
	}

	var additionalList = [(this.hasCollidedWithID() == -1) ? 1 : 0, this.getFoodStorage()/this.getMaxFoodStorage(), (this.wasAttacked ? 0 : 1)];
	var inputSet = antList.concat(foodList.concat(hiveList.concat(spiderList.concat(additionalList))));
	return inputSet;
}

function chooseAction(networkOutput){
	// Chose action
	
	// Sort actions by value
	var actionList = []
	for (var i=0; i < _networkOutputSize; i++)
		actionList.push(i);
	actionList.sort(function(a,b){return networkOutput[b] - networkOutput[a];});

	var continiousSum = 0;
	for (var i = 0; i < networkOutput.length; ++i)
		continiousSum += networkOutput[i];

	var randomChosen = rand(0,1) * continiousSum;
	//console.log(randomChosen)

	var actionTuple = null;

	var currentSum = 0;
	for (var j = 0; j < actionList.length; ++j) {

		var action = actionList[j];

		// Randomly chosen action
		currentSum += networkOutput[j];
		if (currentSum < randomChosen)
			continue;
		
		//console.log("Chosen action: " + action);
		if (action == NetworkAction.WALK_FORWARD)
			actionTuple = [ActionType.MOVE, DirectionType.FORWARD, 0];
		else if (action == NetworkAction.WALK_LEFT)
			actionTuple = [ActionType.MOVE, DirectionType.FORWARD, -30];
		else if (action == NetworkAction.WALK_RIGHT)
			actionTuple = [ActionType.MOVE, DirectionType.FORWARD, 30];		
		else if (action == NetworkAction.ATTACK_NEAREST_ANT) {
			var prey = this.getNearestEnemyAnt();
			if (prey != null) {
				if (prey.canBeInteractedWith(this)) {
					actionTuple = [ActionType.ATTACK, prey]
				} else {
					var fromObjToDirRad = prey.getRotationToObj();
					actionTuple = [ActionType.MOVE, DirectionType.FORWARD, fromObjToDirRad];
				}
			}
		} else if (action == NetworkAction.HARVEST_NEAREST_FOOD) {

			var nearestFood = this.getNearestObjectType(ObjectType.FOOD);
			var canHarvestMore = (this.getFoodStorage() < this.getMaxFoodStorage());
			if (nearestFood != null && canHarvestMore) {
				var canBeHarvested = nearestFood.canBeInteractedWith(this);

				// harvest food if possible
				if (canHarvestMore) {
					if(canBeHarvested){
						actionTuple = [ActionType.HARVEST, nearestFood];
					} else {
						// MOVE towards food
						var fromObjToDirRad = nearestFood.getRotationToObj();
						actionTuple = [ActionType.MOVE, DirectionType.FORWARD, fromObjToDirRad];
					}
				}
			}
		} else if (action == NetworkAction.GIVE_FOOD_TO_HIVE) {

			var hive = this.getOwnHive();
			var shouldReturnFood = this.getFoodStorage() > this.minimumFoodStorage;
			if (hive != null && shouldReturnFood){

				// harvest food if possible
				if(hive.canBeInteractedWith(this)){
					var foodGivingToHive = Math.max(this.getFoodStorage() - this.minimumFoodStorage,0);
					actionTuple = [ActionType.TRANSFER, hive, foodGivingToHive];
				} else {
					// MOVE towards hive
					var fromObjToDirRad = hive.getRotationToObj();
					actionTuple = [ActionType.MOVE, DirectionType.FORWARD, fromObjToDirRad];
				}
			}
		}
		else if (action == NetworkAction.ATTACK_SPIDER) {

			var spider = this.getNearestObjectType(ObjectType.SPIDER);
			if (spider != null){

				// attack spider if possible
				if (spider.canBeInteractedWith(this)) {
					actionTuple = [ActionType.ATTACK, spider]
				} else {
					var fromObjToDirRad = spider.getRotationToObj();
					actionTuple = [ActionType.MOVE, DirectionType.FORWARD, fromObjToDirRad];
				}
			}
		}
		else {
			throw new TypeError("invalid action")
		}

		if (actionTuple != null) {
			break;
		}

	}
	
	return [action, actionTuple];
}

function determineReward(){
	// Reward and reinforcement learning
	var reward = 0;

	if (this.memory.lastLife == -1)
		this.memory.lastLife = this.getLife();

	// were hit
	if (this.getLife() < this.memory.lastLife - 5) {
		reward -= 3;
		this.memory.lastLife = this.getLife();
	}
	
	// ant walks? Great!
	//reward += this.getLastDistanceWalked() / 10;
	
	// food was harvested
	if (this.getFoodStorage() > this.memory.lastFoodStorage)
		reward += 0.5;
	
	// food was given to hive
	else if (this.getFoodStorage() < this.memory.lastFoodStorage - 5
	&& this.networkMemory[this.networkMemory.length-1].chosenAction == NetworkAction.GIVE_FOOD_TO_HIVE)
		reward += 0.3;
		
	// collided with sth
	if (this.hasCollidedWithID() != -1)
		reward -= 0.5;
	// Reward for incoming ants of same type?

	// Update food storage
	this.memory.lastFoodStorage = this.getFoodStorage();
	return reward;
}

function reinforcementLearning(reward, networkOutput){

	var qLearningAlpha = 0.05;
	var qLearningGamma = 0.9;
	var learningRate = 0.001;

	if (reward != 0 && this.networkMemory.length >= this.batchSize && this.neuralNetwork.shouldTrain) {
		var lastBest = maxElement(networkOutput);
		for (var i = this.networkMemory.length - 1; i >= 0; --i) {

			var originalOutput = this.networkMemory[i].output;
			var modifiedOutput = originalOutput;
			var maxIdx = argmax(originalOutput);
			var chosenAction = this.networkMemory[i].chosenAction;

			if (chosenAction != -1 && modifiedOutput[chosenAction] > 0.2)
				var useless = 0;

			if (chosenAction != -1)
				modifiedOutput[chosenAction] = modifiedOutput[chosenAction] + qLearningAlpha * (reward + qLearningGamma * lastBest - modifiedOutput[chosenAction]);

			// Normalize vector and clip to [learningRate,inf.)
			var sum = 0;
			for (var j = 0; j < modifiedOutput.length; ++j)
				modifiedOutput[j] = Math.max(modifiedOutput[j], learningRate);
			for (var j = 0; j < modifiedOutput.length; ++j)
				sum += modifiedOutput[j];
			for (var j = 0; j < modifiedOutput.length; ++j)
				modifiedOutput[j] = (modifiedOutput[j]) / sum;

			lastBest = maxElement(modifiedOutput);

			this.networkMemory[i].output = modifiedOutput;

		}

		this.trainSet = this.trainSet.concat(this.networkMemory);

		if (this.trainSet.length >= this.minTrainSet) {

			if (this.trainSet.length > this.minTrainSet)
				this.trainSet.shift(this.trainSet.length - this.minTrainSet);

			var showDebug = true;
			if (showDebug)
				console.log("Starting training...");
			var data = this.neuralNetwork.trainer.train(this.trainSet,{iterations: 100, rate: learningRate, error: 1e-10, shuffle: true, log: showDebug ? 10 : 1e8});
			this.trainSet = [];

			if (showDebug){
				console.dir(data);
				console.log("Finished.");
				console.log("Error: "+data.error);
				console.log("Its: "+data.iterations);
			}

		}

	}
}


var featureVector = createFeatureVector.call(this);
// check and create network if not created already
// Create network here to use length of featureVector as input layer
if (this.neuralNetwork.network == null) {
	this.neuralNetwork.initNetwork(featureVector.length, 10,10, _networkOutputSize);
}

var networkOutput = this.neuralNetwork.network.activate(featureVector);
var reward = determineReward.call(this);
reinforcementLearning.call(this, reward, networkOutput);

// check for valid network output
if (networkOutput.length == 0 || networkOutput[0].isNaN)
	throw new TypeError("Network input incorrect! (" + networkAnswer.input + ")")

var [action, actionTuple] = chooseAction.call(this, networkOutput);

// remember firstChoice
var maxAction = argmax(networkOutput);
this.neuralNetwork.firstChoice.push(action == maxAction);

// Push decision into memory
if (actionTuple != null) {
	var networkAnswer = {input: featureVector, output: networkOutput, chosenAction: actionTuple};
	this.networkMemory.push(networkAnswer);
	if (this.networkMemory.length > this.batchSize)
		this.networkMemory.shift(1);
	this.neuralNetwork.realChosen.push(true);
} else {
	this.neuralNetwork.realChosen.push(false);
	// search around
	actionTuple = [ActionType.MOVE, DirectionType.FORWARD, rand(-30,30)];
}

// After 500 choices -> reset choices
if (this.neuralNetwork.realChosen.length > 500) {
	var chosenPart = 0.;
	var firstChoicePart = 0.;
	for (var i = 0; i < this.neuralNetwork.realChosen.length; ++i) {
		chosenPart += this.neuralNetwork.realChosen[i] ? 1. : 0.;
		firstChoicePart += this.neuralNetwork.firstChoice[i] ? 1. : 0.;
	}
	chosenPart /= this.neuralNetwork.realChosen.length;
	firstChoicePart /= this.neuralNetwork.realChosen.length;
	console.log("Actively chosen %: "+chosenPart*100+"%");
	console.log("First choice %:    "+firstChoicePart*100+"%");
	this.neuralNetwork.realChosen = [];
	this.neuralNetwork.firstChoice = [];
}


//Return value
	//console.log("Chose action: " + actionTuple)

if (actionTuple != null)
	return actionTuple;
else{
	return [ActionType.MOVE, DirectionType.NONE, 0];
}`