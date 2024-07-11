export enum EAQIStatus {
	GOOD = "جيدة",
	MODERATE = "معتدلة",
	UNHEALTHY_FOR_SENSITIVE_GROUPS = "غير صحي للأشخاص الحساسة",
	UNHEALTHY = "غير صحي",
	VERY_UNHEALTHY = "غير صحي جدا",
	HAZARDOUS = "خطير جداً",
}
export interface AQIStrategy {
	getStatus(aqi: number): EAQIStatus;
}

class GoodAQIStrategy implements AQIStrategy {
	getStatus(aqi: number): EAQIStatus {
		return EAQIStatus.GOOD;
	}
}

class ModerateAQIStrategy implements AQIStrategy {
	getStatus(aqi: number): EAQIStatus {
		return EAQIStatus.MODERATE;
	}
}

class UnhealthyForSensitiveGroupsAQIStrategy implements AQIStrategy {
	getStatus(aqi: number): EAQIStatus {
		return EAQIStatus.UNHEALTHY_FOR_SENSITIVE_GROUPS;
	}
}

class UnhealthyAQIStrategy implements AQIStrategy {
	getStatus(aqi: number): EAQIStatus {
		return EAQIStatus.UNHEALTHY;
	}
}

class VeryUnhealthyAQIStrategy implements AQIStrategy {
	getStatus(aqi: number): EAQIStatus {
		return EAQIStatus.VERY_UNHEALTHY;
	}
}

class HazardousAQIStrategy implements AQIStrategy {
	getStatus(aqi: number): EAQIStatus {
		return EAQIStatus.HAZARDOUS;
	}
}

class AQIContext {
	private strategy: AQIStrategy;

	constructor(strategy: AQIStrategy) {
		this.strategy = strategy;
	}

	setStrategy(strategy: AQIStrategy) {
		this.strategy = strategy;
	}

	executeStrategy(aqi: number): EAQIStatus {
		return this.strategy.getStatus(aqi);
	}
}

export class DefaultAQIStrategy implements AQIStrategy {
	private getStrategy(aqi: number): AQIStrategy {
		if (aqi <= 50) return new GoodAQIStrategy();
		if (aqi <= 100) return new ModerateAQIStrategy();
		if (aqi <= 150) return new UnhealthyForSensitiveGroupsAQIStrategy();
		if (aqi <= 200) return new UnhealthyAQIStrategy();
		if (aqi <= 300) return new VeryUnhealthyAQIStrategy();
		return new HazardousAQIStrategy();
	}
	getStatus(aqi: number): EAQIStatus {
		const strategy = this.getStrategy(aqi);

		const context = new AQIContext(strategy);
		return context.executeStrategy(aqi);
	}
}
