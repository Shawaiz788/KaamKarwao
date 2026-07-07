const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Area {
    id: number;
    name: string;
}

export const getAreasByCity = async (cityId: number): Promise<Area[]> => {
    const response = await fetch(`${API_URL}/cities/${cityId}/areas/`);
    return response.json();
};

export const createArea = async (cityId: number, name: string): Promise<Area> => {
    const response = await fetch(`${API_URL}/cities/${cityId}/areas/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    return response.json();
};
