declare module 'garmin-connect' {
    export interface GarminConnectOptions {
        username: string;
        password: string;
    }

    export interface GarminActivity {
        activityId: number;
        activityName: string;
        beginTimestamp: number;
        pr: boolean;
        distance: number;
        averageSpeed: number;
        duration: number;
        averageHR: number;
        calories: number;
        elevationGain: number;
        avgPower: number;
        locationName: string;
        [key: string]: unknown;
    }

    export class GarminConnect {
        constructor(options: GarminConnectOptions);
        login(): Promise<void>;
        getActivities(
            start: number,
            limit: number | undefined,
            activityType: string,
        ): Promise<GarminActivity[]>;
    }

    export default { GarminConnect };
}
