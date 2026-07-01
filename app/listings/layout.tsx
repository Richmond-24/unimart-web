export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="listing-full-bleed w-full max-w-none px-0 -mx-4 sm:-mx-6 lg:-mx-8">
      {children}
    </div>
  );
}
