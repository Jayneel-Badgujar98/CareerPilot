// app/api/ai/knowledge-pilot/route.js
import { NextResponse } from "next/server";
import { knowledgePilotGraph } from "./graph.js";
import { checkUser } from "@/lib/checkUser";
import { saveAssessment } from "@/lib/assessment";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

export async function POST(req) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a PDF.",
        },
        {
          status: 400,
        }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are supported.",
        },
        {
          status: 400,
        }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Maximum file size is 10MB.",
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    const difficulty = formData.get("difficulty");
    const assessmentType = formData.get("assessmentType");
    const assessmentLength = formData.get("assessmentLength");
    const instructions = formData.get("instructions");

    const graphResult = await knowledgePilotGraph.invoke({
      pdfBuffer,
      difficulty,
      assessmentType,
      assessmentLength,
      instructions,
    });

    const assessment = await saveAssessment({
      userId: user.id,
      documentName: file.name,
      graphResult,
    });

    return NextResponse.json({
      success: true,
      sessionId: assessment.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}