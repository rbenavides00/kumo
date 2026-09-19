import Card from "./ui/Card";

function HomeContent() {
  return (
    <Card>
      <Card.Header
        title="Welcome back"
        subtitle="Manage your files and projects."
      />
      <Card.Body>
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <h2 className="text-lg font-medium">Main content</h2>
          <p className="mt-2 text-sm text-gray-500">Your content goes here.</p>
        </div>
      </Card.Body>
    </Card>
  );
}

export default HomeContent;
