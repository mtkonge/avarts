export type HTMLGeolocationElement = HTMLElement & {
    isValid: boolean;
    invalidReason: string;
    position: {
        coords: {
            longitude: number;
            latitude: number;
        };
    } | null;
};
