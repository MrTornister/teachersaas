import { redirect } from "next/navigation";

// Simple redirect to default locale for now
export default function NotFound() {
    redirect('/en');
}
