export enum EAQIStatus {
    GOOD = "GOOD",
    MODERATE = "MODERATE",
    UNHEALTHY_FOR_SENSITIVE_GROUPS = "UNHEALTHY_FOR_SENSITIVE_GROUPS",
    UNHEALTHY = "UNHEALTHY",
    VERY_UNHEALTHY = "VERY_UNHEALTHY",
    HAZARDOUS = "HAZARDOUS",
}
export interface AQIStrategy {
    getStatus(aqi: number): EAQIStatus;
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
    getStatus(aqi: number): EAQIStatus {
        if (aqi <= 50) return EAQIStatus.GOOD;
        if (aqi <= 100) return EAQIStatus.MODERATE;
        if (aqi <= 150) return EAQIStatus.UNHEALTHY_FOR_SENSITIVE_GROUPS;
        if (aqi <= 200) return EAQIStatus.UNHEALTHY;
        if (aqi <= 300) return EAQIStatus.VERY_UNHEALTHY;
        return EAQIStatus.HAZARDOUS;
    }
}