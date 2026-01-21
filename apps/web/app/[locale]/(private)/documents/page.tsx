import { DocumentUpload } from "./document-upload";

export default function DocumentsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-bold text-3xl">
          Add Document to Knowledge Base
        </h1>
        <p className="text-muted-foreground">
          Enter a URL to fetch, extract metadata, and embed the document into
          the CityLAB Berlin knowledge base.
        </p>
      </div>
      <DocumentUpload />
    </div>
  );
}
