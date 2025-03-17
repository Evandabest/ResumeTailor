import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TEMP_DIR = join(process.cwd(), 'tmp', 'latex');

export async function POST(request: NextRequest) {
  try {
    const { latexCode } = await request.json();
    
    if (!latexCode) {
      return NextResponse.json(
        { message: 'LaTeX code is required' },
        { status: 400 }
      );
    }
    
    // Create a unique ID for this compilation
    const compilationId = uuidv4();
    const compilationDir = join(TEMP_DIR, compilationId);
    
    // Create the directory for this compilation
    await mkdir(compilationDir, { recursive: true });
    
    // Write the LaTeX code to a file
    const texFilePath = join(compilationDir, 'document.tex');
    await writeFile(texFilePath, latexCode);
    
    // Compile the LaTeX code
    try {
      await execAsync(`cd ${compilationDir} && pdflatex -interaction=nonstopmode document.tex`);
    } catch (error) {
      // Read the log file to extract the error message
      const logPath = join(compilationDir, 'document.log');
      let errorMessage = 'LaTeX compilation failed';
      
      try {
        const logContent = await readFile(logPath, 'utf8');
        // Extract meaningful error messages from the log
        const errorLines = logContent.split('\n')
          .filter(line => line.includes('!') || line.includes('Error'))
          .slice(0, 5)
          .join('\n');
        
        errorMessage = errorLines || errorMessage;
      } catch (logError) {
        console.error('Error reading log file:', logError);
      }
      
      return NextResponse.json(
        { message: errorMessage },
        { status: 500 }
      );
    }
    
    // Check if the PDF was generated
    const pdfPath = join(compilationDir, 'document.pdf');
    
    // For production, you would want to move this to persistent storage
    // and handle file cleanup. For simplicity, we'll just return a path.
    
    // In a real app, this would be a URL to a stored file
    const pdfUrl = `/api/latex/view/${compilationId}/document.pdf`;
    
    return NextResponse.json({ pdfUrl });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing the LaTeX code' },
      { status: 500 }
    );
  }
}