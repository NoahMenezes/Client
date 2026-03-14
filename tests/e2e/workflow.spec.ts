import { test, expect } from '@playwright/test';

const ADMIN_USER = {
  name: 'Admin User',
  email: `admin_${Date.now()}@example.com`,
  password: 'password123',
};

test.describe('CRM Workflow', () => {
  // 1. Sign up as an Admin first
  test('01. Sign up as Admin', async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/signup');

    await page.getByLabel('Full name').fill(ADMIN_USER.name);
    await page.getByLabel('Email address').fill(ADMIN_USER.email);
    // Use exact match for Password to avoid matching 'Confirm password'
    await page.getByLabel('Password', { exact: true }).fill(ADMIN_USER.password);
    await page.getByLabel('Confirm password').fill(ADMIN_USER.password);

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Save state for subsequent tests
    await page.context().storageState({ path: 'admin-auth.json' });
    await page.close();
  });

  // 2. Create 5 Employees and verify login
  test('02. Create 5 Employees and verify login', async ({ browser }) => {
    // Reuse admin session
    const context = await browser.newContext({ storageState: 'admin-auth.json' });
    const page = await context.newPage();

    await page.goto('/dashboard/employees');

    const employees = [];

    // Create 5 employees
    for (let i = 0; i < 5; i++) {
      const empData = {
        name: `Employee ${i + 1}`,
        email: `emp${i + 1}_${Date.now()}@test.com`,
        phone: '9876543210',
        role: 'Coordinator',
        department: 'Operations',
        password: 'password123'
      };
      employees.push(empData);

      console.log(`Creating employee: ${empData.name}`);

      await page.getByRole('link', { name: 'Add Employee' }).click();
      await expect(page).toHaveURL(/\/dashboard\/employees\/add/);

      await page.getByLabel('Full Name').fill(empData.name);
      await page.getByLabel('Email Address').fill(empData.email);
      await page.getByLabel('Phone Number').fill(empData.phone);
      await page.getByLabel('Password').fill(empData.password);
      await page.getByLabel('Role').fill(empData.role);
      await page.getByLabel('Department').fill(empData.department);

      await page.getByRole('button', { name: 'Save Employee' }).click();

      // Wait for redirect back to list
      await expect(page).toHaveURL(/\/dashboard\/employees/);
      // Verify employee appears in the list
      await expect(page.getByText(empData.name)).toBeVisible();
    }

    await context.close();

    // Now try to login as the last created employee
    const lastEmp = employees[employees.length - 1];
    const empContext = await browser.newContext();
    const empPage = await empContext.newPage();

    console.log(`Attempting login as: ${lastEmp.name}`);

    await empPage.goto('/login');
    await empPage.getByLabel('Email address').fill(lastEmp.email);
    await empPage.getByLabel('Password').fill(lastEmp.password);
    await empPage.getByRole('button', { name: 'Sign In' }).click();

    await expect(empPage).toHaveURL(/\/dashboard/);
    await expect(empPage.getByText(lastEmp.name)).toBeVisible();

    await empContext.close();
  });

  // 3. Create 5 Leads using the fixed multi-stage form
  test('03. Create 5 Leads and validate data persistence', async ({ browser }) => {
    // Login as admin
    const context = await browser.newContext({ storageState: 'admin-auth.json' });
    const page = await context.newPage();

    await page.goto('/dashboard/leads');

    for (let i = 0; i < 5; i++) {
      const leadData = {
        name: `Couple ${i + 1}`,
        email: `couple${i + 1}_${Date.now()}@test.com`,
        phone: '9876543210',
        budget: '5000000',
        guestCount: '250'
      };

      console.log(`Creating lead: ${leadData.name}`);

      // 1. Click Add Lead -> Redirects to Edit page for new lead
      await page.getByRole('link', { name: 'Add Lead' }).click();
      await expect(page).toHaveURL(/\/dashboard\/leads\/\d+\/edit/);

      // STAGE 1
      await expect(page.getByText('Stage 1')).toBeVisible();
      await page.getByLabel("Couple's Full Name").fill(leadData.name);
      await page.getByLabel('Email Address').fill(leadData.email);
      await page.getByLabel('Contact Number').fill(leadData.phone);
      await page.getByLabel('Budget (₹ numeric)').fill(leadData.budget);

      await page.getByRole('button', { name: 'Next →' }).click();

      // STAGE 2 (Validate persistence of Stage 1 data by not getting redirected back)
      await expect(page.getByText('Stage 2')).toBeVisible();
      await page.getByLabel('Total Number of Guests').fill(leadData.guestCount);
      await page.getByLabel('Destination Wedding?').check();

      await page.getByRole('button', { name: 'Next →' }).click();

      // STAGE 3
      await expect(page.getByText('Stage 3')).toBeVisible();
      // Select items
      await page.getByLabel('End to End Wedding Planning').check();
      await page.getByLabel('Sangeet').check();

      // Submit
      await page.getByRole('button', { name: 'Save Changes ✓' }).click();

      // Verify redirect to Lead Details page
      await expect(page).toHaveURL(/\/dashboard\/leads\/\d+$/);
      await expect(page.getByRole('heading', { name: leadData.name })).toBeVisible();

      // Go back to leads list
      await page.goto('/dashboard/leads');
      await expect(page.getByText(leadData.name)).toBeVisible();
    }

    await context.close();
  });
});
