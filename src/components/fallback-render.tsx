export function fallbackRender({ error }: { error: Error }) {
  return (
    <div role="alert" className="shadow-none border-none">
      <pre className="text-red-500">{error.message}</pre>
    </div>
  );
}