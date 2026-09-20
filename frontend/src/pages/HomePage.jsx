import Card from "../components/ui/Card";
import usePageTitle from "../hooks/usePageTitle";

function HomePage() {
  usePageTitle("Home");

  return (
    <Card>
      <Card.Header
        title="Welcome back"
        subtitle="Manage your files and projects."
      />
      <Card.Body>
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <h2 className="text-lg font-medium text-gray-800">Main content</h2>
          <p className="mt-2 text-sm text-gray-500">Your content goes here.</p>
        </div>
      </Card.Body>
    </Card>
  );
}

export default HomePage;
