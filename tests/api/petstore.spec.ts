import { expect, request as apiRequest, test, type APIRequestContext } from '@playwright/test';
import { petstoreBaseUrl } from '../../config/urls';
import {
  availablePetStatus,
  createPetPayload,
  createStoreOrderPayload,
  type Pet,
  type StoreOrder
} from '../../test-data/petstore';

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
      params: { status: availablePetStatus }
    });
    const elapsedMs = Date.now() - startedAt;
    expect(response.status(), 'Available-pets lookup should return HTTP 200').toBe(200);
    expect(elapsedMs, 'Available-pets lookup should complete in under 2000 ms').toBeLessThan(2000);

    const pets = await response.json() as Pet[];
    expect(Array.isArray(pets), 'The response body should be an array').toBe(true);
    expect(pets.length, 'At least one available pet should be returned').toBeGreaterThan(0);
    for (const pet of pets) {
      expect(pet.status, `Pet ${pet.id} should have available status`).toBe(availablePetStatus);
      expect(pet.id, 'Each pet should include an id').toBeDefined();
      expect(pet.name, `Pet ${pet.id} should include a name`).toBeTruthy();
      expect(Array.isArray(pet.photoUrls), `Pet ${pet.id} should include photoUrls`).toBe(true);
    }
  });

  test('POST a pet and read it back by id', async () => {
    const petId = Date.now();
    const pet = createPetPayload(petId, 'Buddy');

    const createResponse = await api.post('pet', {
      data: pet,
      headers: { 'Content-Type': 'application/json' }
    });
    expect(createResponse.status(), 'Creating a pet should return HTTP 200').toBe(200);
    const createdPet = await createResponse.json() as Pet;
    expect(createdPet.id, 'The created pet should retain the submitted id').toBe(pet.id);
    expect(createdPet.name, 'The created pet should retain the submitted name').toBe(pet.name);
    expect(createdPet.status, 'The created pet should retain available status').toBe(availablePetStatus);

    const readResponse = await api.get(`pet/${pet.id}`);
    expect(readResponse.status(), 'The newly created pet should be readable').toBe(200);
    const readPet = await readResponse.json() as Pet;
    expect(readPet.id).toBe(pet.id);
    expect(readPet.name).toBe(pet.name);
    expect(readPet.status).toBe(pet.status);
  });

  test('POST a store order and read it back by id', async () => {
    const petId = Date.now();
    const pet: Pet = createPetPayload(petId, 'Order test pet');
    const petResponse = await api.post('pet', { data: pet });
    expect(petResponse.status(), 'Order setup should create the referenced pet').toBe(200);

    const order: StoreOrder = createStoreOrderPayload(Date.now() + 1, petId);
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
