import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Users,
  Receipt,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Pencil,
  Trash2,
  Minus,
  UserRound,
} from "lucide-react";
import { supabase } from "./lib/supabase";

const menuItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "sales", label: "Sales", icon: ShoppingCart },
  { key: "purchases", label: "Purchases", icon: ShoppingBag },
  { key: "products", label: "Products", icon: Package },
  { key: "customers", label: "Customers", icon: Users },
  { key: "expenses", label: "Expenses", icon: Receipt },
];

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onLogin(data.session);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Package size={30} />
        </div>

        <h1>Hafiz Electronics</h1>
        <p className="login-subtitle">Management System</p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <div className="error-box">{error}</div>}

          <button
            className="primary-btn login-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ profile, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  function openPage(page) {
    setActivePage(page);
    setMobileMenu(false);
  }

  return (
    <div className="app-layout">
      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Package size={24} />
          </div>

          <div>
            <strong>Hafiz Electronics</strong>
            <span>Management</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                className={`nav-item ${
                  activePage === item.key ? "active" : ""
                }`}
                onClick={() => openPage(item.key)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="staff-info">
            <div className="staff-avatar">
              {(profile?.name || "S")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{profile?.name || "Staff"}</strong>
              <span>{profile?.role || "Staff"}</span>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={23} />
          </button>

          <div>
            <h2>
              {menuItems.find(
                (x) => x.key === activePage
              )?.label || "Dashboard"}
            </h2>

            <p>Hafiz Electronics management system</p>
          </div>
        </header>

        {activePage === "dashboard" && (
          <DashboardHome />
        )}

        {activePage === "sales" && <SalesPage />}

        {activePage === "products" && (
          <ProductsPage />
        )}

        {activePage === "customers" && (
          <CustomersPage />
        )}

        {activePage === "purchases" && (
          <ComingSoon title="Purchases" />
        )}

        {activePage === "expenses" && (
          <ExpensesPage currentProfile={profile} />
        )}
      </main>
    </div>
  );
}

function DashboardHome() {
  return (
    <section className="page-section">
      <div className="welcome-card">
        <div>
          <span className="eyebrow">WELCOME</span>

          <h1>Hafiz Electronics</h1>

          <p>
            Your business data is connected to the cloud.
            Use the sidebar to manage sales, products and
            customers.
          </p>
        </div>

        <Package
          size={55}
          strokeWidth={1.3}
        />
      </div>

      <div className="empty-dashboard">
        <LayoutDashboard size={42} />

        <h3>Dashboard statistics coming next</h3>

        <p>
          Real sales, stock, payments and expense
          figures will be connected from your database.
        </p>
      </div>
    </section>
  );
}

/* =========================
   SALES
========================= */

function SalesPage() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [showSaleModal, setShowSaleModal] =
    useState(false);
  const [selectedSale, setSelectedSale] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSales() {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setSales(data || []);
  }

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", {
        ascending: true,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setProducts(data || []);
  }

  async function loadCustomers() {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("name", {
        ascending: true,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setCustomers(data || []);
  }

  async function loadAll() {
    setLoading(true);
    setError("");

    await Promise.all([
      loadSales(),
      loadProducts(),
      loadCustomers(),
    ]);

    setLoading(false);
  }

  useEffect(() => {
    loadAll();

    const salesChannel = supabase
      .channel("sales-page-sales")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales",
        },
        () => loadSales()
      )
      .subscribe();

    const productsChannel = supabase
      .channel("sales-page-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => loadProducts()
      )
      .subscribe();

    const customersChannel = supabase
      .channel("sales-page-customers")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => loadCustomers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(salesChannel);
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(customersChannel);
    };
  }, []);

  const filteredSales = sales.filter((sale) => {
    const customer = customers.find(
      (c) => c.id === sale.customer_id
    );

    const customerName =
      customer?.name || "Walk-in Customer";

    return (
      customerName
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      String(sale.id)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  function getCustomerName(customerId) {
    if (!customerId) {
      return "Walk-in Customer";
    }

    return (
      customers.find(
        (customer) =>
          customer.id === customerId
      )?.name || "Customer"
    );
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            TRANSACTIONS
          </span>

          <h1>Sales</h1>

          <p>
            Create and manage customer sales.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setError("");
            setShowSaleModal(true);
          }}
        >
          <Plus size={18} />
          New Sale
        </button>
      </div>

      {error && (
        <div className="error-box">{error}</div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search sales or customer..."
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            Loading sales...
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={42} />

            <h3>No sales yet</h3>

            <p>
              Create your first sale using the New
              Sale button.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => {
                  const remaining =
                    Number(
                      sale.total_amount || 0
                    ) -
                    Number(
                      sale.paid_amount || 0
                    );

                  return (
                    <tr key={sale.id}>
                      <td>
                        <strong>
                          {getCustomerName(
                            sale.customer_id
                          )}
                        </strong>
                      </td>

                      <td>
                        {sale.sale_date
                          ? new Date(
                              sale.sale_date +
                                "T00:00:00"
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        Rs.{" "}
                        {Number(
                          sale.total_amount || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        Rs.{" "}
                        {Number(
                          sale.paid_amount || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        <span
                          className={
                            remaining > 0
                              ? "badge badge-warning"
                              : "badge badge-success"
                          }
                        >
                          Rs.{" "}
                          {remaining.toLocaleString()}
                        </span>
                      </td>

                      <td>
                        <button
                          className="icon-btn"
                          title="View sale"
                          onClick={() =>
                            setSelectedSale(
                              sale
                            )
                          }
                        >
                          👁
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showSaleModal && (
        <NewSaleModal
          products={products}
          customers={customers}
          onClose={() =>
            setShowSaleModal(false)
          }
          onSaved={() => {
            setShowSaleModal(false);
            loadAll();
          }}
        />
      )}

      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          customerName={getCustomerName(
            selectedSale.customer_id
          )}
          onClose={() =>
            setSelectedSale(null)
          }
        />
      )}
    </section>
  );
}

function NewSaleModal({
  products,
  customers,
  onClose,
  onSaved,
}) {
  const [customerId, setCustomerId] =
    useState("");

  const [saleDate, setSaleDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [notes, setNotes] =
    useState("");

  const [items, setItems] =
    useState([]);

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [paidAmount, setPaidAmount] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const totalAmount = items.reduce(
    (sum, item) =>
      sum +
      Number(item.total_price || 0),
    0
  );

  function addProduct() {
    setError("");

    if (!productId) {
      setError(
        "Please select a product."
      );
      return;
    }

    const product = products.find(
      (p) => p.id === productId
    );

    if (!product) {
      setError(
        "Product not found."
      );
      return;
    }

    const qty = Number(quantity);

    if (
      !Number.isInteger(qty) ||
      qty <= 0
    ) {
      setError(
        "Quantity must be at least 1."
      );
      return;
    }

    if (
      qty >
      Number(product.stock || 0)
    ) {
      setError(
        `Only ${product.stock} units are available.`
      );
      return;
    }

    const existing = items.find(
      (item) =>
        item.product_id ===
        product.id
    );

    if (existing) {
      const newQuantity =
        existing.quantity + qty;

      if (
        newQuantity >
        Number(product.stock || 0)
      ) {
        setError(
          `Only ${product.stock} units are available.`
        );
        return;
      }

      setItems(
        items.map((item) =>
          item.product_id ===
          product.id
            ? {
                ...item,
                quantity:
                  newQuantity,
                total_price:
                  newQuantity *
                  Number(
                    item.unit_price
                  ),
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          product_id:
            product.id,
          product_name:
            product.name,
          quantity: qty,
          unit_price: Number(
            product.sale_price || 0
          ),
          total_price:
            qty *
            Number(
              product.sale_price || 0
            ),
        },
      ]);
    }

    setProductId("");
    setQuantity(1);
  }

  function changeQuantity(
    productId,
    change
  ) {
    setItems((current) =>
      current
        .map((item) => {
          if (
            item.product_id !==
            productId
          ) {
            return item;
          }

          const product =
            products.find(
              (p) =>
                p.id === productId
            );

          const newQuantity =
            item.quantity + change;

          if (newQuantity <= 0) {
            return null;
          }

          if (
            product &&
            newQuantity >
              Number(
                product.stock || 0
              )
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              newQuantity,
            total_price:
              newQuantity *
              Number(
                item.unit_price
              ),
          };
        })
        .filter(Boolean)
    );
  }

  function removeItem(productId) {
    setItems((current) =>
      current.filter(
        (item) =>
          item.product_id !==
          productId
      )
    );
  }

  async function saveSale(e) {
    e.preventDefault();
    setError("");

    if (items.length === 0) {
      setError(
        "Please add at least one product."
      );
      return;
    }

    const paid = Number(
      paidAmount || 0
    );

    if (paid < 0) {
      setError(
        "Paid amount cannot be negative."
      );
      return;
    }

    if (paid > totalAmount) {
      setError(
        "Paid amount cannot be greater than total."
      );
      return;
    }

    setSaving(true);

    const { error } =
      await supabase.rpc(
        "create_sale",
        {
          p_customer_id:
            customerId || null,

          p_total_amount:
            totalAmount,

          p_paid_amount:
            paid,

          p_sale_date:
            saleDate,

          p_notes:
            notes.trim() || null,

          p_items:
            items.map((item) => ({
              product_id:
                item.product_id,
              quantity:
                item.quantity,
              unit_price:
                item.unit_price,
            })),
        }
      );

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    onSaved();
  }

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              NEW TRANSACTION
            </span>

            <h2>Create Sale</h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={saveSale}>
          <div className="form-grid">
            <div className="form-group">
              <label>
                Customer
              </label>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Walk-in Customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                      {customer.phone
                        ? ` — ${customer.phone}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Sale Date
              </label>

              <input
                type="date"
                value={saleDate}
                onChange={(e) =>
                  setSaleDate(
                    e.target.value
                  )
                }
                required
              />
            </div>
          </div>

          <div className="add-product-box">
            <h3>Add Product</h3>

            <div className="product-add-row">
              <select
                value={productId}
                onChange={(e) =>
                  setProductId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select product
                </option>

                {products
                  .filter(
                    (product) =>
                      Number(
                        product.stock || 0
                      ) > 0
                  )
                  .map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} — Rs.{" "}
                      {Number(
                        product.sale_price ||
                          0
                      ).toLocaleString()}{" "}
                      — Stock:{" "}
                      {product.stock}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="secondary-btn"
                onClick={addProduct}
              >
                <Plus size={17} />
                Add
              </button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="sale-items">
              <div className="sale-items-header">
                <strong>
                  Sale Items
                </strong>

                <span>
                  {items.length} product(s)
                </span>
              </div>

              {items.map((item) => (
                <div
                  className="sale-item"
                  key={
                    item.product_id
                  }
                >
                  <div className="sale-item-info">
                    <strong>
                      {item.product_name}
                    </strong>

                    <span>
                      Rs.{" "}
                      {Number(
                        item.unit_price
                      ).toLocaleString()}{" "}
                      each
                    </span>
                  </div>

                  <div className="quantity-controls">
                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          item.product_id,
                          -1
                        )
                      }
                    >
                      <Minus size={15} />
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        changeQuantity(
                          item.product_id,
                          1
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <strong className="item-total">
                    Rs.{" "}
                    {Number(
                      item.total_price
                    ).toLocaleString()}
                  </strong>

                  <button
                    type="button"
                    className="delete-icon-btn"
                    onClick={() =>
                      removeItem(
                        item.product_id
                      )
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="sale-summary">
            <div>
              <span>
                Total Amount
              </span>

              <strong>
                Rs.{" "}
                {totalAmount.toLocaleString()}
              </strong>
            </div>

            <div className="form-group">
              <label>
                Paid Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) =>
                  setPaidAmount(
                    e.target.value
                  )
                }
                placeholder="0"
              />
            </div>

            <div>
              <span>
                Remaining
              </span>

              <strong>
                Rs.{" "}
                {Math.max(
                  0,
                  totalAmount -
                    Number(
                      paidAmount || 0
                    )
                ).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="form-group">
            <label>
              Notes
            </label>

            <textarea
              rows="3"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Optional notes"
            />
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving Sale..."
                : "Save Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SaleDetailsModal({
  sale,
  customerName,
  onClose,
}) {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadItems() {
      const { data, error } =
        await supabase
          .from("sale_items")
          .select("*")
          .eq(
            "sale_id",
            sale.id
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );

      if (error) {
        setError(
          error.message
        );
      } else {
        setItems(data || []);
      }

      setLoading(false);
    }

    loadItems();
  }, [sale.id]);

  const remaining =
    Number(
      sale.total_amount || 0
    ) -
    Number(
      sale.paid_amount || 0
    );

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              SALE DETAILS
            </span>

            <h2>
              {customerName}
            </h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="details-grid">
          <div>
            <span>
              Customer
            </span>

            <strong>
              {customerName}
            </strong>
          </div>

          <div>
            <span>
              Date
            </span>

            <strong>
              {sale.sale_date
                ? new Date(
                    sale.sale_date +
                      "T00:00:00"
                  ).toLocaleDateString()
                : "-"}
            </strong>
          </div>

          <div>
            <span>
              Total
            </span>

            <strong>
              Rs.{" "}
              {Number(
                sale.total_amount || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span>
              Paid
            </span>

            <strong>
              Rs.{" "}
              {Number(
                sale.paid_amount || 0
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span>
              Remaining
            </span>

            <strong>
              Rs.{" "}
              {remaining.toLocaleString()}
            </strong>
          </div>
        </div>

        <h3 className="details-title">
          Products
        </h3>

        {loading ? (
          <div className="loading-state">
            Loading items...
          </div>
        ) : error ? (
          <div className="error-box">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            No items found.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Product
                  </th>

                  <th>
                    Qty
                  </th>

                  <th>
                    Unit Price
                  </th>

                  <th>
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.product_name}
                    </td>

                    <td>
                      {item.quantity}
                    </td>

                    <td>
                      Rs.{" "}
                      {Number(
                        item.unit_price ||
                          0
                      ).toLocaleString()}
                    </td>

                    <td>
                      Rs.{" "}
                      {Number(
                        item.total_price ||
                          0
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {sale.notes && (
          <div className="notes-box">
            <strong>
              Notes
            </strong>

            <p>
              {sale.notes}
            </p>
          </div>
        )}

        <div className="modal-actions">
          <button
            className="secondary-btn"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PRODUCTS
========================= */

function ProductsPage() {
  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadProducts() {
    const { data, error } =
      await supabase
        .from("products")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      setError(
        error.message
      );
      return;
    }

    setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();

    const channel = supabase
      .channel(
        "products-page"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => loadProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, []);

  async function deleteProduct(id) {
    if (
      !window.confirm(
        "Delete this product?"
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
      setError(
        error.message
      );
    }
  }

  const filteredProducts =
    products.filter((product) =>
      `${product.name} ${
        product.category || ""
      }`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            INVENTORY
          </span>

          <h1>
            Products
          </h1>

          <p>
            Manage products and stock.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setEditingProduct(
              null
            );
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search products..."
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            Loading products...
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="empty-state">
            <Package size={42} />

            <h3>
              No products found
            </h3>

            <p>
              Add a product to
              start managing
              inventory.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Purchase
                  </th>

                  <th>
                    Sale
                  </th>

                  <th>
                    Stock
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map(
                  (product) => {
                    const low =
                      Number(
                        product.stock ||
                          0
                      ) <=
                      Number(
                        product.low_stock_limit ||
                          5
                      );

                    return (
                      <tr
                        key={
                          product.id
                        }
                      >
                        <td>
                          <strong>
                            {
                              product.name
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            product.category ||
                            "-"
                          }
                        </td>

                        <td>
                          Rs.{" "}
                          {Number(
                            product.purchase_price ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td>
                          Rs.{" "}
                          {Number(
                            product.sale_price ||
                              0
                          ).toLocaleString()}
                        </td>

                        <td>
                          <span
                            className={
                              low
                                ? "badge badge-warning"
                                : "badge badge-success"
                            }
                          >
                            {
                              product.stock
                            }
                          </span>
                        </td>

                        <td>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              setEditingProduct(
                                product
                              );
                              setShowModal(
                                true
                              );
                            }}
                          >
                            <Pencil
                              size={17}
                            />
                          </button>

                          <button
                            className="icon-btn danger"
                            onClick={() =>
                              deleteProduct(
                                product.id
                              )
                            }
                          >
                            <Trash2
                              size={17}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          product={
            editingProduct
          }
          onClose={() => {
            setShowModal(false);
            setEditingProduct(
              null
            );
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingProduct(
              null
            );
            loadProducts();
          }}
        />
      )}
    </section>
  );
}

function ProductModal({
  product,
  onClose,
  onSaved,
}) {
  const [name, setName] =
    useState(
      product?.name || ""
    );

  const [category, setCategory] =
    useState(
      product?.category || ""
    );

  const [purchasePrice, setPurchasePrice] =
    useState(
      product?.purchase_price ??
        ""
    );

  const [salePrice, setSalePrice] =
    useState(
      product?.sale_price ?? ""
    );

  const [stock, setStock] =
    useState(
      product?.stock ?? 0
    );

  const [lowStockLimit, setLowStockLimit] =
    useState(
      product?.low_stock_limit ??
        5
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function saveProduct(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(
        "Product name is required."
      );
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      category:
        category.trim() || null,

      purchase_price: Number(
        purchasePrice || 0
      ),

      sale_price: Number(
        salePrice || 0
      ),

      stock: Number(
        stock || 0
      ),

      low_stock_limit:
        Number(
          lowStockLimit || 5
        ),
    };

    const result = product
      ? await supabase
          .from("products")
          .update(payload)
          .eq(
            "id",
            product.id
          )
      : await supabase
          .from("products")
          .insert(
            payload
          );

    setSaving(false);

    if (result.error) {
      setError(
        result.error.message
      );
      return;
    }

    onSaved();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              INVENTORY
            </span>

            <h2>
              {product
                ? "Edit Product"
                : "Add Product"}
            </h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={saveProduct}
        >
          <div className="form-group">
            <label>
              Product Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Category
            </label>

            <input
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Purchase Price
              </label>

              <input
                type="number"
                min="0"
                value={
                  purchasePrice
                }
                onChange={(e) =>
                  setPurchasePrice(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Sale Price
              </label>

              <input
                type="number"
                min="0"
                value={
                  salePrice
                }
                onChange={(e) =>
                  setSalePrice(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Low Stock Limit
              </label>

              <input
                type="number"
                min="0"
                value={
                  lowStockLimit
                }
                onChange={(e) =>
                  setLowStockLimit(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   CUSTOMERS
========================= */

function CustomersPage() {
  const [customers, setCustomers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadCustomers() {
    const { data, error } =
      await supabase
        .from("customers")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      setError(
        error.message
      );
      return;
    }

    setCustomers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCustomers();

    const channel = supabase
      .channel(
        "customers-page"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "customers",
        },
        () => loadCustomers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, []);

  async function deleteCustomer(id) {
    if (
      !window.confirm(
        "Delete this customer?"
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("customers")
        .delete()
        .eq("id", id);

    if (error) {
      setError(
        error.message
      );
    }
  }

  const filteredCustomers =
    customers.filter(
      (customer) =>
        `${customer.name || ""} ${
          customer.phone || ""
        } ${
          customer.address || ""
        }`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            CUSTOMERS
          </span>

          <h1>
            Customers
          </h1>

          <p>
            Manage customer
            information and
            balances.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setEditingCustomer(
              null
            );
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search customers..."
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            Loading customers...
          </div>
        ) : filteredCustomers.length ===
          0 ? (
          <div className="empty-state">
            <UserRound size={42} />

            <h3>
              No customers found
            </h3>

            <p>
              Add a customer to
              start keeping
              customer records.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Balance</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={
                        customer.id
                      }
                    >
                      <td>
                        <strong>
                          {
                            customer.name
                          }
                        </strong>
                      </td>

                      <td>
                        {
                          customer.phone ||
                          "-"
                        }
                      </td>

                      <td>
                        {
                          customer.address ||
                          "-"
                        }
                      </td>

                      <td>
                        Rs.{" "}
                        {Number(
                          customer.current_balance ||
                            0
                        ).toLocaleString()}
                      </td>

                      <td>
                        <button
                          className="icon-btn"
                          onClick={() => {
                            setEditingCustomer(
                              customer
                            );
                            setShowModal(
                              true
                            );
                          }}
                        >
                          <Pencil
                            size={17}
                          />
                        </button>

                        <button
                          className="icon-btn danger"
                          onClick={() =>
                            deleteCustomer(
                              customer.id
                            )
                          }
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <CustomerModal
          customer={
            editingCustomer
          }
          onClose={() => {
            setShowModal(false);
            setEditingCustomer(
              null
            );
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingCustomer(
              null
            );
            loadCustomers();
          }}
        />
      )}
    </section>
  );
}

function CustomerModal({
  customer,
  onClose,
  onSaved,
}) {
  const [name, setName] =
    useState(
      customer?.name || ""
    );

  const [phone, setPhone] =
    useState(
      customer?.phone || ""
    );

  const [address, setAddress] =
    useState(
      customer?.address || ""
    );

  const [openingBalance, setOpeningBalance] =
    useState(
      customer?.opening_balance ??
        0
    );

  const [currentBalance, setCurrentBalance] =
    useState(
      customer?.current_balance ??
        0
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function saveCustomer(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(
        "Customer name is required."
      );
      return;
    }

    setSaving(true);

    const payload = {
      name: name.trim(),
      phone:
        phone.trim() || null,

      address:
        address.trim() || null,

      opening_balance:
        Number(
          openingBalance || 0
        ),

      current_balance:
        Number(
          currentBalance || 0
        ),
    };

    const result = customer
      ? await supabase
          .from("customers")
          .update(payload)
          .eq(
            "id",
            customer.id
          )
      : await supabase
          .from("customers")
          .insert(
            payload
          );

    setSaving(false);

    if (result.error) {
      setError(
        result.error.message
      );
      return;
    }

    onSaved();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              CUSTOMER
            </span>

            <h2>
              {customer
                ? "Edit Customer"
                : "Add Customer"}
            </h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={saveCustomer}
        >
          <div className="form-group">
            <label>
              Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div className="form-group">
            <label>
              Phone
            </label>

            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-group">
            <label>
              Address
            </label>

            <textarea
              rows="3"
              value={address}
              onChange={(e) =>
                setAddress(
                  e.target.value
                )
              }
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>
                Opening Balance
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  openingBalance
                }
                onChange={(e) =>
                  setOpeningBalance(
                    e.target.value
                  )
                }
              />
            </div>

            <div className="form-group">
              <label>
                Current Balance
              </label>

              <input
                type="number"
                step="0.01"
                value={
                  currentBalance
                }
                onChange={(e) =>
                  setCurrentBalance(
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   EXPENSES
========================= */

const EXPENSE_CATEGORIES = [
  {
    key: "areeb",
    label: "Areeb Kharchi",
    db: "Areeb Kharchi",
  },
  {
    key: "aman",
    label: "Aman Kharchi",
    db: "Aman Kharchi",
  },
  {
    key: "atif",
    label: "Atif Kharchi",
    db: "Atif Kharchi",
  },
  {
    key: "home",
    label: "Ghar Ka Kharcha",
    db: "Ghar Ka Kharcha",
  },
  {
    key: "shop",
    label: "Dukan Ka Kharcha",
    db: "Dukan Ka Kharcha",
  },
];

function todayDate() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function ExpensesPage({
  currentProfile,
}) {
  const [expenses, setExpenses] =
    useState([]);

  const [staff, setStaff] =
    useState([]);

  const [activeCategory, setActiveCategory] =
    useState("areeb");

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingExpense, setEditingExpense] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadExpenses() {
    const { data, error } =
      await supabase
        .from("expenses")
        .select("*")
        .order(
          "expense_date",
          {
            ascending: false,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      setError(
        error.message
      );
      return;
    }

    setExpenses(data || []);
    setLoading(false);
  }

  /*
    IMPORTANT:
    staff_profiles table does NOT contain
    name/email columns.

    We use the security-definer RPC
    get_active_staff_directory()
    created in Supabase SQL Editor.
  */
  async function loadStaff() {
    const { data, error } =
      await supabase.rpc(
        "get_active_staff_directory"
      );

    if (error) {
      console.error(
        "Staff loading error:",
        error
      );

      setError(
        error.message
      );

      setStaff([]);
      return;
    }

    setStaff(data || []);
  }

  function getStaffDisplayName(
    person
  ) {
    if (!person) {
      return "—";
    }

    const email = String(
      person.email || ""
    )
      .trim()
      .toLowerCase();

    const knownNames = {
      "areeb@gmail.com":
        "Areeb",

      "atifa141008@gmail.com":
        "Atif",

      "aman@gmail.com":
        "Aman",

      "akhtarnaeem725@gmail.com":
        "Papa",
    };

    return (
      knownNames[email] ||
      email ||
      "—"
    );
  }

  useEffect(() => {
    loadExpenses();
    loadStaff();

    const channel = supabase
      .channel(
        "expenses-page"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        () => loadExpenses()
      )
      .subscribe();

    return () =>
      supabase.removeChannel(
        channel
      );
  }, []);

  const totals =
    EXPENSE_CATEGORIES.reduce(
      (result, category) => {
        result[category.key] =
          expenses
            .filter(
              (expense) =>
                expense.category ===
                category.db
            )
            .reduce(
              (sum, expense) =>
                sum +
                Number(
                  expense.amount ||
                    0
                ),
              0
            );

        return result;
      },
      {}
    );

  const active =
    EXPENSE_CATEGORIES.find(
      (x) =>
        x.key ===
        activeCategory
    );

  const filteredExpenses =
    expenses.filter(
      (expense) => {
        if (
          expense.category !==
          active.db
        ) {
          return false;
        }

        const q = search
          .trim()
          .toLowerCase();

        if (!q) {
          return true;
        }

        return (
          String(
            expense.description ||
              ""
          )
            .toLowerCase()
            .includes(q) ||
          String(
            expense.notes || ""
          )
            .toLowerCase()
            .includes(q) ||
          String(
            expense.amount || ""
          ).includes(q)
        );
      }
    );

  function openNewExpense() {
    setEditingExpense(null);
    setError("");
    setShowModal(true);
  }

  function openEditExpense(
    expense
  ) {
    setEditingExpense(expense);
    setError("");
    setShowModal(true);
  }

  async function deleteExpense(
    expense
  ) {
    const ok =
      window.confirm(
        `Delete this ${
          expense.category
        } record of Rs. ${Number(
          expense.amount || 0
        ).toLocaleString()}?`
      );

    if (!ok) {
      return;
    }

    setError("");

    const { error } =
      await supabase
        .from("expenses")
        .delete()
        .eq(
          "id",
          expense.id
        );

    if (error) {
      setError(
        error.message
      );
      return;
    }

    await loadExpenses();
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            EXPENSE MANAGEMENT
          </span>

          <h1>
            Expenses
          </h1>

          <p>
            Five separate expense
            histories for clear
            daily records.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={
            openNewExpense
          }
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="expense-summary-grid">
        {EXPENSE_CATEGORIES.map(
          (category) => (
            <button
              key={
                category.key
              }
              className={`expense-summary-card ${
                activeCategory ===
                category.key
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(
                  category.key
                );

                setSearch("");
              }}
            >
              <span>
                {category.label}
              </span>

              <strong>
                Rs.{" "}
                {totals[
                  category.key
                ].toLocaleString()}
              </strong>
            </button>
          )
        )}
      </div>

      <div className="expense-history-head">
        <div>
          <h3>
            {active.label}
          </h3>

          <span>
            {
              filteredExpenses.length
            }{" "}
            record(s)
          </span>
        </div>

        <div className="search-box expense-search">
          <Search size={18} />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder={`Search ${active.label.toLowerCase()}...`}
          />
        </div>
      </div>

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            Loading expenses...
          </div>
        ) : filteredExpenses.length ===
          0 ? (
          <div className="empty-state">
            <Receipt size={42} />

            <h3>
              No {active.label} records
            </h3>

            <p>
              Use Add Expense to
              create a real record.
              No sample data is
              added.
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>
                    Date
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Paid By
                  </th>

                  <th>
                    Notes
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map(
                  (expense) => {
                    const payer =
                      staff.find(
                        (person) =>
                          person.id ===
                          expense.paid_by
                      );

                    return (
                      <tr
                        key={
                          expense.id
                        }
                      >
                        <td>
                          {expense.expense_date
                            ? new Date(
                                expense.expense_date +
                                  "T00:00:00"
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <strong>
                            {expense.description ||
                              "—"}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            Rs.{" "}
                            {Number(
                              expense.amount ||
                                0
                            ).toLocaleString()}
                          </strong>
                        </td>

                        <td>
                          {getStaffDisplayName(
                            payer
                          )}
                        </td>

                        <td>
                          {expense.notes ||
                            "—"}
                        </td>

                        <td>
                          <button
                            className="icon-btn"
                            title="Edit expense"
                            onClick={() =>
                              openEditExpense(
                                expense
                              )
                            }
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            className="icon-btn danger"
                            title="Delete expense"
                            onClick={() =>
                              deleteExpense(
                                expense
                              )
                            }
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ExpenseModal
          category={active}
          staff={staff}
          currentProfile={
            currentProfile
          }
          expense={
            editingExpense
          }
          onClose={() =>
            setShowModal(false)
          }
          onSaved={async () => {
            setShowModal(false);
            setEditingExpense(
              null
            );

            await loadExpenses();
          }}
        />
      )}
    </section>
  );
}

function ExpenseModal({
  category,
  staff,
  currentProfile,
  expense,
  onClose,
  onSaved,
}) {
  const [expenseDate, setExpenseDate] =
    useState(
      expense?.expense_date ||
        todayDate()
    );

  const [description, setDescription] =
    useState(
      expense?.description ||
        ""
    );

  const [amount, setAmount] =
    useState(
      expense?.amount ?? ""
    );

  const [notes, setNotes] =
    useState(
      expense?.notes || ""
    );

  const [paidBy, setPaidBy] =
    useState(
      expense?.paid_by ||
        currentProfile?.id ||
        ""
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const staffCategory =
    [
      "areeb",
      "aman",
      "atif",
    ].includes(
      category.key
    );

  const targetStaffEmail =
    category.key === "areeb"
      ? "areeb@gmail.com"
      : category.key === "aman"
      ? "aman@gmail.com"
      : category.key === "atif"
      ? "atifa141008@gmail.com"
      : null;

  const targetStaff =
    targetStaffEmail
      ? staff.find(
          (person) =>
            String(
              person.email || ""
            )
              .trim()
              .toLowerCase() ===
            targetStaffEmail
        )
      : null;

  function getStaffDisplayName(
    person
  ) {
    if (!person) {
      return "—";
    }

    const email = String(
      person.email || ""
    )
      .trim()
      .toLowerCase();

    const knownNames = {
      "areeb@gmail.com":
        "Areeb",

      "atifa141008@gmail.com":
        "Atif",

      "aman@gmail.com":
        "Aman",

      "akhtarnaeem725@gmail.com":
        "Papa",
    };

    return (
      knownNames[email] ||
      email ||
      "—"
    );
  }

  const targetStaffName =
    targetStaff
      ? getStaffDisplayName(
          targetStaff
        )
      : category.key ===
        "areeb"
      ? "Areeb"
      : category.key ===
        "aman"
      ? "Aman"
      : category.key ===
        "atif"
      ? "Atif"
      : "—";

  useEffect(() => {
    if (
      staffCategory &&
      targetStaff?.id &&
      !expense
    ) {
      setPaidBy(
        targetStaff.id
      );
    }
  }, [
    staffCategory,
    targetStaff?.id,
    expense,
  ]);

  async function saveExpense(e) {
    e.preventDefault();
    setError("");

    const numericAmount =
      Number(amount);

    if (!expenseDate) {
      return setError(
        "Please select an expense date."
      );
    }

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return setError(
        "Amount must be greater than zero."
      );
    }

    if (!paidBy) {
      return setError(
        "Paid by information is missing."
      );
    }

    if (
      staffCategory &&
      !targetStaff
    ) {
      return setError(
        `The ${targetStaffName} staff profile was not found.`
      );
    }

    setSaving(true);

    const payload = {
      expense_date:
        expenseDate,

      category:
        category.db,

      description:
        description.trim() ||
        null,

      amount:
        numericAmount,

      paid_by:
        staffCategory
          ? targetStaff.id
          : paidBy,

      notes:
        notes.trim() ||
        null,
    };

    const result = expense
      ? await supabase
          .from("expenses")
          .update(payload)
          .eq(
            "id",
            expense.id
          )
      : await supabase
          .from("expenses")
          .insert(
            payload
          );

    setSaving(false);

    if (result.error) {
      setError(
        result.error.message
      );
      return;
    }

    await onSaved();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              {expense
                ? "EDIT EXPENSE"
                : "NEW EXPENSE"}
            </span>

            <h2>
              {category.label}
            </h2>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={saveExpense}
        >
          <div className="form-grid">
            <div className="form-group">
              <label>
                Date
              </label>

              <input
                type="date"
                value={
                  expenseDate
                }
                onChange={(e) =>
                  setExpenseDate(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>
                Amount
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(
                    e.target.value
                  )
                }
                placeholder="Enter amount"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              Description
            </label>

            <input
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="What was this expense for?"
            />
          </div>

          {!staffCategory && (
            <div className="form-group">
              <label>
                Paid By
              </label>

              <select
                value={paidBy}
                onChange={(e) =>
                  setPaidBy(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  Select staff
                </option>

                {staff.map(
                  (person) => (
                    <option
                      key={
                        person.id
                      }
                      value={
                        person.id
                      }
                    >
                      {getStaffDisplayName(
                        person
                      )}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {staffCategory && (
            <div className="fixed-expense-person">
              <UserRound
                size={17}
              />

              <div>
                <span>
                  Expense Person
                </span>

                <strong>
                  {
                    targetStaffName
                  }
                </strong>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>
              Notes
            </label>

            <textarea
              rows="3"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Optional notes"
            />
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : expense
                ? "Update Expense"
                : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComingSoon({
  title,
}) {
  return (
    <section className="page-section">
      <div className="empty-dashboard">
        <Package size={42} />

        <h3>
          {title} module
        </h3>

        <p>
          This module will be
          connected next.
        </p>
      </div>
    </section>
  );
}

/* =========================
   APP
========================= */

export default function App() {
  const [session, setSession] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

  const [checking, setChecking] =
    useState(true);

  async function loadProfile(
    currentSession
  ) {
    if (
      !currentSession?.user
    ) {
      setProfile(null);
      return;
    }

    const { data, error } =
      await supabase
        .from("staff_profiles")
        .select("*")
        .eq(
          "id",
          currentSession.user.id
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

    if (error || !data) {
      await supabase.auth.signOut();

      setSession(null);
      setProfile(null);

      return;
    }

    const email =
      String(
        currentSession.user.email ||
          ""
      )
        .trim()
        .toLowerCase();

    const knownNames = {
      "areeb@gmail.com":
        "Areeb",

      "atifa141008@gmail.com":
        "Atif",

      "aman@gmail.com":
        "Aman",

      "akhtarnaeem725@gmail.com":
        "Papa",
    };

    setProfile({
      ...data,
      name:
        knownNames[email] ||
        email ||
        "Staff",
    });
  }

  useEffect(() => {
    async function init() {
      const { data } =
        await supabase.auth.getSession();

      if (data.session) {
        setSession(
          data.session
        );

        await loadProfile(
          data.session
        );
      }

      setChecking(false);
    }

    init();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          newSession
        ) => {
          setSession(
            newSession
          );

          if (newSession) {
            await loadProfile(
              newSession
            );
          } else {
            setProfile(null);
          }
        }
      );

    return () =>
      subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();

    setSession(null);
    setProfile(null);
  }

  if (checking) {
    return (
      <div className="loading-screen">
        <Package size={34} />

        <span>
          Loading Hafiz Electronics...
        </span>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <Login
        onLogin={(newSession) =>
          setSession(
            newSession
          )
        }
      />
    );
  }

  return (
    <Dashboard
      profile={profile}
      onLogout={logout}
    />
  );
}