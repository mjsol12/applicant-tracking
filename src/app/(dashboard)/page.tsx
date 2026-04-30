import Container from "@/components/container";

export default function Home() {
  return (
    <div>
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-3 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-4 laptop:col-span-2">
          Testing
        </Container>
      </div>
    </div>
  );
}
