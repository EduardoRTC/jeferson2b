import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          Inventory Management
        </Link>
      </div>
    </header>
  );
}