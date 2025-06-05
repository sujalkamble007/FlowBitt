import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to the flows directory (relative to project root)
    const flowsDir = path.resolve(process.cwd(), "../backend/flows")
    const files = await fs.readdir(flowsDir)
    const flows = await Promise.all(
      files
        .filter((file) => file.endsWith(".json"))
        .map(async (file) => {
          const filePath = path.join(flowsDir, file)
          let uuid = null
          try {
            const content = await fs.readFile(filePath, "utf-8")
            const json = JSON.parse(content)
            uuid = json.id || null
          } catch (e) {
            uuid = null
          }
          return {
            id: file.replace(/\.json$/, ""),
            name: file.replace(/\.json$/, ""),
            fileName: file,
            uuid,
          }
        })
    )
    return NextResponse.json({ flows })
  } catch (error) {
    return NextResponse.json({ error: "Failed to list flows" }, { status: 500 })
  }
}
