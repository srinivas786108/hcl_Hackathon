export interface Pet {
  id: number;
  category: { id: number; name: string };
  name: string;
  photoUrls: string[];
  tags: { id: number; name: string }[];
  status: string;
}

export interface StoreOrder {
  id: number;
  petId: number;
  quantity: number;
  shipDate: string;
  status: string;
  complete: boolean;
}

export const availablePetStatus = 'available';

export function createPetPayload(id: number, name: string): Pet {
  return {
    id,
    category: { id: 1, name: 'dogs' },
    name,
    photoUrls: ['https://example.com/buddy.jpg'],
    tags: [{ id: 1, name: 'cute' }],
    status: availablePetStatus
  };
}

export function createStoreOrderPayload(id: number, petId: number): StoreOrder {
  return {
    id,
    petId,
    quantity: 1,
    shipDate: '2026-10-28T10:00:00.000Z',
    status: 'placed',
    complete: false
  };
}
