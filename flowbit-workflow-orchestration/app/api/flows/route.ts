import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to the flows directory (relative to project root)
    const flowsDir = path.resolve(process.cwd(), "../backend/flows")
    const files = await fs.readdir(flowsDir)
    const flows = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => ({
        id: file.replace(/\.json$/, ""),
        name: file.replace(/\.json$/, ""),
        fileName: file,
      }))
    return NextResponse.json({ flows })
  } catch (error) {
    return NextResponse.json({ error: "Failed to list flows" }, { status: 500 })
  }
}
