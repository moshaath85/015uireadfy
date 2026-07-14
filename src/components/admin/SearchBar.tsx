export interface SearchBarProps {
  readonly label: string;
  readonly placeholder?: string;
  readonly value?: string;
}

export function SearchBar({ label, placeholder = "Search records", value = "" }: SearchBarProps) {
  return (
    <label className="admin-search-bar">
      <span className="admin-search-bar__label">{label}</span>
      <input
        className="admin-search-bar__input"
        type="search"
        placeholder={placeholder}
        value={value}
        readOnly
      />
    </label>
  );
}