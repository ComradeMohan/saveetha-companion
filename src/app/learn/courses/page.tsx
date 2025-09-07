
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoursesPage() {
    return (
        <>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Courses</h1>
            </div>
            <div
                className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm"
            >
                <div className="flex flex-col items-center gap-1 text-center">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Courses Page
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        This section is under construction.
                    </p>
                </div>
            </div>
        </>
    )
}
