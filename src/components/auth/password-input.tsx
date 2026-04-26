"use client";

import { useState } from "react";

type PasswordInputProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
};

export function PasswordInput({ id, name, label, placeholder }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center rounded-[1rem] border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-cyan-400">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="ml-3 rounded-full px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
