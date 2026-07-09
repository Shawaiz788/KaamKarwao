const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_URL = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';

export interface Category {
  id: number;
  name: string;
}

export interface PaymentPreference {
  id: number;
  name: string;
}

export interface Task {
  id?: number;
  subject: string;
  body: string;
  attachment_id: number | null;
  price: number;
  created_by: number;
  preferred_time: string;
  location_id: number;
  status_id: number;
  payment_preference_id: number;
  accurately_estimated: number;
  category_id: number;
}

export interface TaskChainInput {
  categoryName: string;
  paymentMethodId: string; // 'cash' | 'jazzcash' | 'easypaisa'
  description: string;
  budget: number;
  userId: number;
  locationId: number;
}

// Fetch categories list
export const getCategoriesFromBackend = async (): Promise<Category[]> => {
  console.log('[task API] Fetching categories list from backend...');
  const response = await fetch(`${API_URL}/category/`);
  const responseText = await response.text();
  console.log('[task API] Get categories response status:', response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch categories. Status: ${response.status}. Response: ${responseText}`);
  }

  return JSON.parse(responseText);
};

// Fetch payment preferences list
export const getPaymentPreferencesFromBackend = async (): Promise<PaymentPreference[]> => {
  console.log('[task API] Fetching payment preferences list from backend...');
  const response = await fetch(`${API_URL}/paymentpref/`);
  const responseText = await response.text();
  console.log('[task API] Get paymentpref response status:', response.status);

  if (!response.ok) {
    throw new Error(`Failed to fetch payment preferences. Status: ${response.status}. Response: ${responseText}`);
  }

  return JSON.parse(responseText);
};

// Send create task request
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  console.log('[task API] Creating task with payload:', JSON.stringify(task, null, 2));
  const response = await fetch(`${API_URL}/task/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  const responseText = await response.text();
  console.log('[task API] Create task response status:', response.status);
  console.log('[task API] Create task response body:', responseText);

  if (!response.ok) {
    throw new Error(`Failed to create task. Status: ${response.status}. Response: ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Failed to parse created task JSON response. Content: ${responseText}`);
  }
};

// Sequential task creation chain:
// 1. Match category ID
// 2. Match payment preference ID
// 3. Assemble inputs (subject, timestamps, location details)
// 4. Send request to endpoint
export const createTaskChain = async (input: TaskChainInput): Promise<Task> => {
  const { categoryName, paymentMethodId, description, budget, userId, locationId } = input;
  console.log('[createTaskChain] Resolving task creation sequence...', input);

  // 1. Get Category ID from backend
  let categoryId = 1; // Default fallback
  try {
    const categories = await getCategoriesFromBackend();
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (matchedCategory) {
      categoryId = matchedCategory.id;
      console.log(`[createTaskChain] Found category match: ${matchedCategory.name} -> ID: ${categoryId}`);
    } else {
      console.warn(`[createTaskChain] No exact category match for "${categoryName}". Using fallback ID 1.`);
    }
  } catch (err) {
    console.error('[createTaskChain] Error fetching categories. Using fallback ID 1.', err);
  }

  // 2. Get Payment Preference ID from backend
  let paymentPreferenceId = 1; // Default fallback
  try {
    const prefs = await getPaymentPreferencesFromBackend();
    const matchedPref = prefs.find((p) => {
      const nameLower = p.name.toLowerCase();
      const methodLower = paymentMethodId.toLowerCase();
      return nameLower.includes(methodLower) || methodLower.includes(nameLower);
    });
    if (matchedPref) {
      paymentPreferenceId = matchedPref.id;
      console.log(`[createTaskChain] Found payment preference match: ${matchedPref.name} -> ID: ${paymentPreferenceId}`);
    } else {
      console.warn(`[createTaskChain] No payment preference match for "${paymentMethodId}". Using fallback ID 1.`);
    }
  } catch (err) {
    console.error('[createTaskChain] Error fetching payment preferences. Using fallback ID 1.', err);
  }

  // 3. Construct Subject line
  const subject = `${categoryName} Service Needed`;

  // 4. Construct timestamp
  const preferredTime = new Date().toISOString();

  // 5. Dispatch task
  const taskPayload = {
    subject,
    body: description,
    attachment_id: null,
    price: budget,
    created_by: userId,
    preferred_time: preferredTime,
    location_id: locationId,
    status_id: 1, // Default status id is 1
    payment_preference_id: paymentPreferenceId,
    accurately_estimated: 0, // Default accurately_estimated
    category_id: categoryId, // Backend uses Django spelling: catergory_id
  };

  return await createTask(taskPayload);
};
