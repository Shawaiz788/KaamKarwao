const API_URL = process.env.EXPO_PUBLIC_API_URL;

import { Country, getCountries, createCountry } from './country';
import { City, getCitiesByCountry, createCity } from './city';
import { Area, getAreasByCity, createArea } from './area';

export { Country, getCountries, createCountry };
export { City, getCitiesByCountry, createCity };
export { Area, getAreasByCity, createArea };

export interface UserLocation {
    id?: number;
    house_number?: number;
    street_number?: string;
    landmark?: string;
    pin_location?: string;
    zip_code?: number;
    area?: Area;
    city: City;
    country: Country;
}

export const createLocation = async (location: UserLocation): Promise<UserLocation> => {
    const response = await fetch(`${API_URL}/Location/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
    });
    return response.json();
};
