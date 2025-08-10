
'use server';

export type AddressScreeningResult = {
    address: string;
    isSanctioned: boolean;
};

/**
 * Screens a single Bitcoin address using the TRM Labs public API.
 */
export async function screenAddress(address: string): Promise<{ data: AddressScreeningResult | null; error: string | null; }> {
    const API_URL = `https://api.trmlabs.com/public/v1/sanctions/screening`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            signal: AbortSignal.timeout(20000), // 20-second timeout
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ address }]),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`TRM Labs API request to ${API_URL} failed with status ${response.status}:`, errorBody);
            try {
                const errorJson = JSON.parse(errorBody);
                throw new Error(errorJson.message || `TRM Labs API returned an error (status: ${response.status}).`);
            } catch (e) {
                 throw new Error(`TRM Labs API returned a non-JSON error (status: ${response.status}).`);
            }
        }
        
        const responseData = await response.json();
        
        if (!responseData || !Array.isArray(responseData) || responseData.length === 0) {
            return { data: null, error: 'The TRM Labs API returned an invalid response format.' };
        }

        const result: AddressScreeningResult = {
            address: responseData[0].address,
            isSanctioned: responseData[0].isSanctioned,
        };

        return { data: result, error: null };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred while screening the address.';
        return { data: null, error: message };
    }
}
