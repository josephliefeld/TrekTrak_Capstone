import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Welcome to TrekTrak!</h1>
      <p>Discover fitness events near you.</p>
      <Button variant="outline">Click here for nothing</Button>
    </div>
  );
}