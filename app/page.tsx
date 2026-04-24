"use client";

import { useEffect, useRef, useState } from "react";

/* ================= TYPES ================= */

type Expense = {
  id: number;
  date: string;
  amount: number;
  category: string;
  subCategory: string;
  type: "Need" | "Want";
  mode: string;
  account: string;
  recurring: boolean;
  notes: string;
};

type Options = {
  categories: string[];
  subCategories: string[];
  modes: string[];
  accounts: string[];
};

/* ================= DEFAULT ================= */

const defaultOptions: Options = {
  categories: ["Food", "Travel"],
  subCategories: ["Swiggy", "Groceries"],
  modes: ["UPI", "Card"],
  accounts: ["ICICI", "Cash"],
};

/* ================= MAIN ================= */

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [options, setOptions] = useState<Options>(defaultOptions);

  const [form, setForm] = useState({
    id: null as number | null,
    date: "",
    amount: "",
    category: "",
    subCategory: "",
    type: "Need",
    mode: "",
    account: "",
    recurring: false,
    notes: "",
  });

  const dateRef = useRef<HTMLInputElement>(null);

  /* ================= STORAGE ================= */

  useEffect(() => {
    const e = localStorage.getItem("expenses");
    const o = localStorage.getItem("options");

    if (e) setExpenses(JSON.parse(e));

    if (o) {
      try {
        const parsed = JSON.parse(o);
        setOptions({
          categories: parsed.categories || defaultOptions.categories,
          subCategories: parsed.subCategories || defaultOptions.subCategories,
          modes: parsed.modes || defaultOptions.modes,
          accounts: parsed.accounts || defaultOptions.accounts,
        });
      } catch {
        setOptions(defaultOptions);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("options", JSON.stringify(options));
  }, [expenses, options]);

  /* ================= ACTIONS ================= */

  const saveExpense = () => {
    if (!form.date || !form.amount) {
      alert("Date & Amount required");
      return;
    }

    if (form.id) {
      setExpenses(
        expenses.map((e) =>
          e.id === form.id
            ? { ...form, amount: Number(form.amount) }
            : e
        )
      );
    } else {
      setExpenses([
        ...expenses,
        {
          ...form,
          amount: Number(form.amount),
          id: Date.now(),
        },
      ]);
    }

    resetForm();
  };

  const editExpense = (e: Expense) => {
    setForm({ ...e, amount: String(e.amount) });
  };

  const deleteExpense = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const resetForm = () => {
    setForm({
      id: null,
      date: "",
      amount: "",
      category: "",
      subCategory: "",
      type: "Need",
      mode: "",
      account: "",
      recurring: false,
      notes: "",
    });
  };

  /* ================= SORT ================= */

  const sortedExpenses = [...expenses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime() ||
    b.id - a.id
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      <h1 className="text-3xl font-bold">💸 Expense Logger</h1>

      {/* FORM */}
      <div className="bg-white p-5 rounded-xl shadow grid grid-cols-4 gap-3">

        <div onClick={() => dateRef.current?.showPicker()}>
          <Label text="Date" />
          <input
            ref={dateRef}
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm({ ...form, date: e.target.value })
            }
            className="border p-2 rounded w-full cursor-pointer"
          />
        </div>

        <Input label="Amount" type="number" value={form.amount}
          onChange={(v: string) => setForm({ ...form, amount: v })}
        />

        <Select label="Category" options={options.categories}
          value={form.category}
          onChange={(v: string) => setForm({ ...form, category: v })}
        />

        <Select label="SubCategory" options={options.subCategories}
          value={form.subCategory}
          onChange={(v: string) => setForm({ ...form, subCategory: v })}
        />

        <Select label="Need / Want" options={["Need", "Want"]}
          value={form.type}
          onChange={(v: string) => setForm({ ...form, type: v as any })}
        />

        <Select label="Mode" options={options.modes}
          value={form.mode}
          onChange={(v: string) => setForm({ ...form, mode: v })}
        />

        <Select label="Account" options={options.accounts}
          value={form.account}
          onChange={(v: string) => setForm({ ...form, account: v })}
        />

        <label className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={(e) =>
              setForm({ ...form, recurring: e.target.checked })
            }
          />
          Recurring
        </label>

        <Input label="Notes" className="col-span-3"
          value={form.notes}
          onChange={(v: string) => setForm({ ...form, notes: v })}
        />

        <button
          onClick={saveExpense}
          className="bg-blue-600 text-white rounded-lg mt-6"
        >
          {form.id ? "Update Expense" : "Add Expense"}
        </button>

        {form.id && (
          <button
            onClick={resetForm}
            className="bg-gray-400 text-white rounded-lg mt-6"
          >
            Cancel
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="grid grid-cols-10 bg-gray-100 p-3 text-sm font-semibold">
          <div>Date</div>
          <div>Amount</div>
          <div>Category</div>
          <div>SubCategory</div>
          <div>Type</div>
          <div>Account</div>
          <div>Mode</div>
          <div>Notes</div>
          <div className="text-center">Edit</div>
          <div className="text-center">Delete</div>
        </div>

        {sortedExpenses.map((e) => (
          <div key={e.id} className="grid grid-cols-10 p-3 text-sm items-center border-t">

            <div>{e.date}</div>
            <div className="font-semibold">₹{e.amount}</div>
            <div>{e.category}</div>
            <div>{e.subCategory}</div>

            <div className="text-xs">
              {e.type}
              {e.recurring && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px]">
                  Recurring
                </span>
              )}
            </div>

            <div>{e.account}</div>
            <div>{e.mode}</div>

            <div className="truncate text-xs max-w-[120px]" title={e.notes}>
              {e.notes || "-"}
            </div>

            <button
              onClick={() => editExpense(e)}
              className="text-blue-500 text-center"
            >
              Edit
            </button>

            <button
              onClick={() => deleteExpense(e.id)}
              className="text-red-500 text-center"
            >
              ✕
            </button>

          </div>
        ))}
      </div>

      {/* OPTIONS */}
      <div className="grid grid-cols-2 gap-4">
        <OptionManager title="Categories" values={options.categories} setValues={(v) => setOptions({ ...options, categories: v })} />
        <OptionManager title="SubCategories" values={options.subCategories} setValues={(v) => setOptions({ ...options, subCategories: v })} />
        <OptionManager title="Modes" values={options.modes} setValues={(v) => setOptions({ ...options, modes: v })} />
        <OptionManager title="Accounts" values={options.accounts} setValues={(v) => setOptions({ ...options, accounts: v })} />
      </div>

    </div>
  );
}

/* ================= COMPONENTS ================= */

function Label({ text }: any) {
  return <div className="text-xs text-gray-500 mb-1">{text}</div>;
}

function Input({ label, onChange, value, ...props }: any) {
  return (
    <div>
      <Label text={label} />
      <input {...props} value={value} onChange={(e) => onChange(e.target.value)} className="border p-2 rounded w-full" />
    </div>
  );
}

function Select({ label, options, value, onChange }: any) {
  return (
    <div>
      <Label text={label} />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="border p-2 rounded w-full">
        <option value="">Select</option>
        {(options || []).map((o: string) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function OptionManager({ title, values, setValues }: any) {
  const [input, setInput] = useState("");

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <div className="font-semibold mb-2">{title}</div>

      <div className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="border p-2 rounded flex-1" />
        <button
          onClick={() => {
            if (!input.trim()) return;
            setValues([...(values || []), input]);
            setInput("");
          }}
          className="bg-blue-500 text-white px-3 rounded"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(values || []).map((v: string) => (
          <span key={v} className="bg-blue-100 px-3 py-1 rounded-full flex items-center gap-2">
            {v}
            <button onClick={() => setValues(values.filter((x: string) => x !== v))} className="text-red-500">
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}