import { NextResponse } from "next/server";
import { knowledgePilotGraph } from "@/ai/knowledge-pilot/graph";

export async function POST(req) {
  try {
    
    const formData = await req.formData();

    const file = formData.get("file");
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);


    const difficulty = formData.get("difficulty");
    const assessmentType = formData.get("assessmentType");
    const assessmentLength = formData.get("assessmentLength");
    const instructions = formData.get("instructions");

    // File exists?
    if (!file) {
      return NextResponse.json(
        { success: false, message: "Please upload a PDF." },
        { status: 400 }
      );
    }

    // Only PDF
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // Max Size (10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Maximum file size is 10MB." },
        { status: 400 }
      );
    }

    const result = await knowledgePilotGraph.invoke({
      pdfBuffer,
      difficulty,
      assessmentType,
      assessmentLength,
      instructions,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}