// Manual end-to-end check of the invoice API.
// Usage: set TEST_EMAIL and TEST_PASSWORD (a test account), start the server,
// then run: node scripts/invoice-api-test.js
// Optional: TEST_EMAIL_2 / TEST_PASSWORD_2 (a second account) for ownership checks.

const BASE = process.env.API_URL || "http://localhost:5000/api";
const { TEST_EMAIL, TEST_PASSWORD, TEST_EMAIL_2, TEST_PASSWORD_2 } =
  process.env;

let passed = 0;
let failed = 0;

const call = async (method, path, token, body) => {
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body
  }

  return { status: response.status, data };
};

const check = (name, ok, details = "") => {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name} ${details}`);
  }
};

const expectStatus = (name, res, status) =>
  check(
    name,
    res.status === status,
    `(expected ${status}, got ${res.status}: ${res.data?.message ?? ""})`
  );

const login = async (email, password) => {
  const res = await call("POST", "/auth/login", null, { email, password });

  if (res.status !== 200 || !res.data?.token) {
    throw new Error(
      `Login failed for ${email}: ${res.status} ${res.data?.message ?? ""}`
    );
  }

  return res.data.token;
};

const main = async () => {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.log("Set TEST_EMAIL and TEST_PASSWORD first.");
    process.exit(1);
  }

  const token = await login(TEST_EMAIL, TEST_PASSWORD);

  // We need one customer and one product to build invoices
  let res = await call("GET", "/customers", token);
  let customer = res.data?.customers?.[0];

  if (!customer) {
    res = await call("POST", "/customers", token, {
      name: "Test Customer",
      email: "test.customer@example.com",
    });
    customer = res.data?.customer;
  }

  res = await call("GET", "/products", token);
  let product = res.data?.products?.[0];

  if (!product) {
    res = await call("POST", "/products", token, {
      name: "Test Product",
      price: 19.99,
    });
    product = res.data?.product;
  }

  if (!customer || !product) {
    throw new Error("Could not get a customer and a product to test with");
  }

  const day = 24 * 60 * 60 * 1000;
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * day).toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - day).toISOString().slice(0, 10);

  const valid = {
    customerId: customer._id,
    items: [{ productId: product._id, quantity: 3, unitPrice: 19.99 }],
    currency: "PKR",
    issueDate: today,
    dueDate: nextMonth,
    taxRate: 16,
    notes: "Test invoice",
  };

  // ---------- Create ----------
  console.log("\nCreate");

  res = await call("POST", "/invoices", token, {
    ...valid,
    total: 1,
    status: "paid",
    userId: "000000000000000000000000",
  });
  expectStatus("valid invoice -> 201", res, 201);

  const invoice = res.data?.invoice;
  if (!invoice) throw new Error("Invoice was not created, cannot continue");

  check("status forced to draft", invoice.status === "draft");
  check(
    "server computed totals (59.97 + 9.6 = 69.57)",
    invoice.subtotal === 59.97 &&
      invoice.taxAmount === 9.6 &&
      invoice.total === 69.57,
    JSON.stringify({
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
    })
  );
  check(
    "invoice number format",
    /^INV-\d{4,}$/.test(invoice.invoiceNumber ?? ""),
    invoice.invoiceNumber
  );
  check("currency saved", invoice.currency === "PKR");
  check("customer snapshot saved", invoice.customer?.name === customer.name);
  check("product snapshot saved", invoice.items?.[0]?.name === product.name);
  check("owner not taken from body", invoice.userId !== "000000000000000000000000");

  res = await call("POST", "/invoices", token, {
    customerId: customer._id,
    items: [{ productId: product._id, quantity: 2 }],
    dueDate: nextMonth,
  });
  expectStatus("minimal invoice (no price/currency/tax) -> 201", res, 201);
  const second = res.data?.invoice;
  check(
    "price defaults to product price",
    second?.items?.[0]?.unitPrice === product.price
  );
  check("currency defaults to a 3-letter code", /^[A-Z]{3}$/.test(second?.currency ?? ""));
  check(
    "invoice numbers increase by 1",
    Number(second?.invoiceNumber?.slice(4)) ===
      Number(invoice.invoiceNumber.slice(4)) + 1,
    `${invoice.invoiceNumber} -> ${second?.invoiceNumber}`
  );

  // ---------- Bad input ----------
  console.log("\nBad input");

  const unknownId = "000000000000000000000000";
  const badCases = [
    ["missing due date", { ...valid, dueDate: undefined }, 400],
    ["due date before issue date", { ...valid, issueDate: today, dueDate: yesterday }, 400],
    ["invalid currency", { ...valid, currency: "ABC" }, 400],
    ["tax rate over 100", { ...valid, taxRate: 150 }, 400],
    ["negative tax rate", { ...valid, taxRate: -5 }, 400],
    ["no items", { ...valid, items: [] }, 400],
    ["quantity 0", { ...valid, items: [{ productId: product._id, quantity: 0 }] }, 400],
    ["decimal quantity", { ...valid, items: [{ productId: product._id, quantity: 1.5 }] }, 400],
    ["negative unit price", { ...valid, items: [{ productId: product._id, quantity: 1, unitPrice: -1 }] }, 400],
    ["object instead of customer id", { ...valid, customerId: { $gt: "" } }, 400],
    ["object instead of product id", { ...valid, items: [{ productId: { $gt: "" }, quantity: 1 }] }, 400],
    ["notes too long", { ...valid, notes: "x".repeat(1001) }, 400],
    ["unknown customer", { ...valid, customerId: unknownId }, 404],
    ["unknown product", { ...valid, items: [{ productId: unknownId, quantity: 1 }] }, 404],
  ];

  for (const [name, body, status] of badCases) {
    res = await call("POST", "/invoices", token, body);
    expectStatus(`${name} -> ${status}`, res, status);
  }

  res = await call("GET", "/invoices/not-an-id", token);
  expectStatus("malformed invoice id -> 400", res, 400);

  // ---------- Edit, status rules, delete ----------
  console.log("\nEdit and status rules");

  const id = invoice._id;

  res = await call("PATCH", `/invoices/${id}/status`, token, { status: "paid" });
  expectStatus("draft -> paid rejected", res, 400);

  res = await call("PATCH", `/invoices/${id}/status`, token, { status: "banana" });
  expectStatus("unknown status rejected", res, 400);

  res = await call("PUT", `/invoices/${id}`, token, {
    ...valid,
    items: [{ productId: product._id, quantity: 1, unitPrice: 100 }],
    taxRate: 0,
  });
  expectStatus("edit draft -> 200", res, 200);
  check("edited total is 100", res.data?.invoice?.total === 100);
  check(
    "invoice number unchanged by edit",
    res.data?.invoice?.invoiceNumber === invoice.invoiceNumber
  );

  res = await call("PATCH", `/invoices/${id}/status`, token, { status: "sent" });
  expectStatus("draft -> sent -> 200", res, 200);

  res = await call("PUT", `/invoices/${id}`, token, valid);
  expectStatus("edit sent invoice rejected", res, 400);

  res = await call("DELETE", `/invoices/${id}`, token);
  expectStatus("delete sent invoice rejected", res, 400);

  res = await call("PATCH", `/invoices/${id}/status`, token, { status: "paid" });
  expectStatus("sent -> paid -> 200", res, 200);

  res = await call("PATCH", `/invoices/${id}/status`, token, { status: "cancelled" });
  expectStatus("paid -> cancelled rejected", res, 400);

  res = await call("PATCH", `/invoices/${id}/status`, token, { status: "draft" });
  expectStatus("paid -> draft rejected", res, 400);

  console.log("\nDelete");

  res = await call("DELETE", `/invoices/${second._id}`, token);
  expectStatus("delete draft -> 200", res, 200);

  res = await call("GET", `/invoices/${second._id}`, token);
  expectStatus("deleted invoice -> 404", res, 404);

  res = await call("GET", "/invoices", token);
  check(
    "list contains the paid invoice and not the deleted one",
    res.data?.invoices?.some((i) => i._id === id) &&
      !res.data?.invoices?.some((i) => i._id === second._id)
  );

  // ---------- Auth and ownership ----------
  console.log("\nAuth and ownership");

  res = await call("GET", "/invoices", null);
  expectStatus("no token -> 401", res, 401);

  res = await call("GET", "/invoices", "not-a-real-token");
  expectStatus("bad token -> 401", res, 401);

  if (TEST_EMAIL_2 && TEST_PASSWORD_2) {
    const token2 = await login(TEST_EMAIL_2, TEST_PASSWORD_2);

    res = await call("GET", `/invoices/${id}`, token2);
    expectStatus("other user cannot read it -> 404", res, 404);

    res = await call("PUT", `/invoices/${id}`, token2, valid);
    expectStatus("other user cannot edit it -> 404", res, 404);

    res = await call("PATCH", `/invoices/${id}/status`, token2, { status: "cancelled" });
    expectStatus("other user cannot change status -> 404", res, 404);

    res = await call("DELETE", `/invoices/${id}`, token2);
    expectStatus("other user cannot delete it -> 404", res, 404);

    res = await call("GET", "/invoices", token2);
    check(
      "other user's list does not contain it",
      !res.data?.invoices?.some((i) => i._id === id)
    );

    res = await call("POST", "/invoices", token2, valid);
    expectStatus("other user cannot use my customer/product -> 404", res, 404);
  } else {
    console.log("  (skipped: set TEST_EMAIL_2 and TEST_PASSWORD_2 for ownership checks)");
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
};

main().catch((error) => {
  console.error(`\nTest run stopped: ${error.message}`);
  process.exit(1);
});