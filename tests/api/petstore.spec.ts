import { expect, request as apiRequest, test, type APIRequestContext } from '@playwright/test';
import { petstoreBaseUrl } from '../../config/urls';

interface Pet {
  id: number;
  category: { id: number; name: string };
  name: string;
  photoUrls: string[];
  tags: { id: number; name: string }[];
  status: string;
}

interface StoreOrder {
  id: number;
  petId: number;
  quantity: number;
  shipDate: string;
  status: string;
  complete: boolean;
}

let api: APIRequestContext;

test.describe('Swagger Petstore API @api', () => {
  test.beforeEach(async () => {
    api = await apiRequest.newContext({
      baseURL: `${petstoreBaseUrl.replace(/\/+$/, '')}/`,
      extraHTTPHeaders: { Accept: 'application/json' }
    });
  });

  test.afterEach(async () => {
    await api.dispose();
  });

  test('GET available pets returns a valid non-empty list under two seconds @smoke', async () => {
    const startedAt = Date.now();
    const response = await api.get('pet/findByStatus', {
      params: { status: 'available' }
    });
    const elapsedMs = Date.now() - startedAt;
    expect(response.status(), 'Available-pets lookup should return HTTP 200').toBe(200);
    expect(elapsedMs, 'Available-pets lookup should complete in under 2000 ms').toBeLessThan(2000);

    const pets = await response.json() as Pet[];
    expect(Array.isArray(pets), 'The response body should be an array').toBe(true);
    expect(pets.length, 'At least one available pet should be returned').toBeGreaterThan(0);
    for (const pet of pets) {
      expect(pet.status, `Pet ${pet.id} should have available status`).toBe('available');
      expect(pet.id, 'Each pet should include an id').toBeDefined();
      expect(pet.name, `Pet ${pet.id} should include a name`).toBeTruthy();
      expect(Array.isArray(pet.photoUrls), `Pet ${pet.id} should include photoUrls`).toBe(true);
    }
  });

  test('POST a pet and read it back by id', async () => {
    const petId = Date.now();
    const pet: Pet = {
      id: petId,
      category: { id: 1, name: 'dogs' },
      name: 'Buddy',
      photoUrls: ['https://example.com/buddy.jpg'],
      tags: [{ id: 1, name: 'cute' }],
      status: 'available'
    };

    const createResponse = await api.post('pet', {
      data: pet,
      headers: { 'Content-Type': 'application/json' }
    });
    expect(createResponse.status(), 'Creating a pet should return HTTP 200').toBe(200);
    const createdPet = await createResponse.json() as Pet;
    expect(createdPet.id, 'The created pet should retain the submitted id').toBe(pet.id);
    expect(createdPet.name, 'The created pet should retain the submitted name').toBe(pet.name);
    expect(createdPet.status, 'The created pet should retain available status').toBe('available');

    const readResponse = await api.get(`pet/${pet.id}`);
    expect(readResponse.status(), 'The newly created pet should be readable').toBe(200);
    const readPet = await readResponse.json() as Pet;
    expect(readPet.id).toBe(pet.id);
    expect(readPet.name).toBe(pet.name);
    expect(readPet.status).toBe(pet.status);
  });

  test('POST a store order and read it back by id', async () => {
    const petId = Date.now();
    const pet: Pet = {
      id: petId,
      category: { id: 1, name: 'dogs' },
      name: 'Order test pet',
      photoUrls: ['https://example.com/order-pet.jpg'],
      tags: [{ id: 1, name: 'test' }],
      status: 'available'
    };
    const petResponse = await api.post('pet', { data: pet });
    expect(petResponse.status(), 'Order setup should create the referenced pet').toBe(200);

    const order: StoreOrder = {
      id: Date.now() + 1,
      petId,
      quantity: 1,
      shipDate: '2026-10-28T10:00:00.000Z',
      status: 'placed',
      complete: false
    };
    const createResponse = await api.post('store/order', {
      data: order,
      headers: { 'Content-Type': 'application/json' }
    });
    expect(createResponse.status(), 'Creating a store order should return HTTP 200').toBe(200);
    const createdOrder = await createResponse.json() as StoreOrder;
    expect(createdOrder.petId, 'The order should reference the requested pet').toBe(order.petId);
    expect(createdOrder.status, 'The order status should be placed').toBe('placed');
    expect(Number.isInteger(createdOrder.quantity) && createdOrder.quantity > 0,
      'The order quantity should be a positive integer').toBe(true);

    const readResponse = await api.get(`store/order/${order.id}`);
    expect(readResponse.status(), 'The newly created order should be readable').toBe(200);
    const readOrder = await readResponse.json() as StoreOrder;
    expect(readOrder.id).toBe(order.id);
    expect(readOrder.petId).toBe(order.petId);
    expect(readOrder.quantity).toBe(order.quantity);
    expect(readOrder.status).toBe(order.status);
  });
});
