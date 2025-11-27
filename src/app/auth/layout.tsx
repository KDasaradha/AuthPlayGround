import BackButton from "@/components/ui/back-button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 ml-[100px]">
        <BackButton href="/" label="Back to Dashboard" />
      </div>
      {children}
    </div>
  );
}
