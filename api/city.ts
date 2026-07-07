const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface City {
    id: number;
    name: string;
}

export const getCitiesByCountry = async (countryId: number): Promise<City[]> => {
    const response = await fetch(`${API_URL}/countries/${countryId}/cities/`);
    return response.json();
};

export const createCity = async (countryId: number, name: string): Promise<City> => {
    const response = await fetch(`${API_URL}/countries/${countryId}/cities/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    return response.json();
};