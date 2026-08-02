export interface SearchBarProps {
  readonly label: string;
  readonly placeholder?: string;
  readonly queryParam?: string;
  readonly defaultValue?: string;
  readonly action?: string;
}

export function SearchBar({
  label,
  placeholder = "Search records",
  queryParam = "q",
  defaultValue = "",
  action,
}: SearchBarProps) {
  return (
    <form action={action} method="get" role="search">
      <label className="admin-search-bar">
        <span className="admin-search-bar__label">{label}</span>
        <input
          className="admin-search-bar__input"
          defaultValue={defaultValue}
          name={queryParam}
          placeholder={placeholder}
          type="search"
        />
      </label>
    </form>
  );
}
