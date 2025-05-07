const latexContent = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins - slightly less aggressive
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-0.65in}
\\addtolength{\\textheight}{1.25in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-7pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-8pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{#1}\\vspace{-2pt}
}
\\newcommand{\\mycomment}[1]{}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-3pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\vspace{-2pt}
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.10in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, rightmargin=0.1in]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-2pt}}

\\begin{document}

%----------HEADING----------
\\begin{center}  
    \\textbf{\\Huge \\scshape Evan Haque} \\\\ \\vspace{1pt}
    \\small 
    \\href{https://evandabest.us}{\\underline{evandabest.vercel.app}} $|$ 
    \\href{mailto:evanhaque1@gmail.com}{\\underline{evanhaque1@gmail.com}} $|$ 
    \\href{https://www.linkedin.com/in/evanhaque1738/}{\\underline{linkedin.com/in/evanhaque1738}} $|$
    \\href{https://github.com/Evandabest}{\\underline{github.com/Evandabest}}
    \\vspace{-5pt}
\\end{center}

%-----------EDUCATION-----------
\\section{\\textbf{Education}}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {CUNY - City College of New York}{\\textbf{Expected: May 2026}}
      {Bachelor of Science in Computer Science}{New York, NY}
    \\resumeItemListStart
        \\resumeItem{Relevant Coursework: Data Structures and Algorithms, Object-oriented Programming, Discrete Math, Calculus I,II,III}
    \\resumeItemListEnd
  \\resumeSubHeadingListEnd
\\vspace{-15pt}
%-----------EXPERIENCE-----------
\\section{\\textbf{Experience}}
  \\resumeSubHeadingListStart

  \\resumeSubheading
    {Software Engineering Intern}{Feb 2024 -- Present}
    {Forgotten Felines of Sonoma County}{Remote}
    \\resumeItemListStart
    \\resumeItem{Built and styled a responsive frontend using \\textbf{Next.js}, \\textbf{React}, and \\textbf{TypeScript}, for a seamless user experience}
    \\resumeItem{Integrated the frontend with \\textbf{Supabase}, enabling document chunking and embedding, increasing search efficiency by \\textbf{40\\%} and reducing query response time by \\textbf{20\\%}}
    \\resumeItem{Optimized map rendering performance using \\textbf{Leaflet}, reducing map load time by \\textbf{50\\%} and improving interactive responsiveness by \\textbf{30\\%}}
    \\resumeItemListEnd


   \\resumeSubheading
    {Software Engineering Intern}{Jan 2024 -- Present}
    {Easy Meets}{New York, NY}
    \\resumeItemListStart
    \\resumeItem{Built responsive UI components using \\textbf{Expo Go}, achieving full cross-platform compatibility on iOS and Android}
    \\resumeItem{Increased component render efficiency by \\textbf{35\\%} through the use of \\textbf{React Native}'s \\textbf{useMemo} and \\textbf{useCallback} hooks}
    \\resumeItem{Implemented comprehensive unit tests with \\textbf{Jest}, reducing GitHub issues by \\textbf{30\\%} and  improving code coverage}
    \\resumeItemListEnd
      
    \\resumeSubheading
      {Software Engineering Intern}{Jun 2024 -- Aug 2024}
      {Ronshipmon}{New York, NY}
      \\resumeItemListStart
        \\resumeItem{Developed a dynamic, interactive landing page with advanced animations and modular components using \\textbf{React, Tailwind CSS, and Framer Motion}, optimizing performance and enhancing engagement by \\textbf{30\\%}.}
        \\resumeItem {Implemented \\textbf{SEO} strategies in collaboration with the marketing team, exceeding industry standards and achieving \\textbf{1st-page} rankings for targeted search terms.}
      \\resumeItemListEnd
      
  \\resumeSubHeadingListEnd
\\vspace{-15pt}
%-----------PROJECTS-----------
\\section{\\textbf{Projects}}
    \\resumeSubHeadingListStart

      \\resumeProjectHeading
        {\\textbf{Tactical Soccer Advisor} $|$ \\emph{Next.js, React, TypeScript, Weaviate, DeepSeek R1, DSpy, Flask, Python}}{Feb 2025}
        \\resumeItemListStart
            \\resumeItem{Built a full-stack platform for soccer coaches to analyze formational strategies using \\textbf{Next.js, React}, and \\textbf{TypeScript}, reducing analysis time by \\textbf{30\\%} and improving user retention by \\textbf{25\\%}}
            \\resumeItem{Integrated \\textbf{Weaviate}'s vector database to store UEFA manuals and game analytics, improving query accuracy by \\textbf{40\\%}}
            \\resumeItem{Connected \\textbf{DeepSeek R1} via \\textbf{Flask} and \\textbf{Ollama} to generate insights, using \\textbf{DSpy} for contextual validation, increasing response relevance by \\textbf{60\\%} and reducing incorrect responses by \\textbf{40\\%}}
        \\resumeItemListEnd
    
      \\resumeProjectHeading
          {\\textbf{HackHire} $|$ \\emph{React, TypeScript, SQLite, Google Gemini, Python, Flask, Scikit-Learn, Selenium}}{Nov 2024}
          \\resumeItemListStart
            \\resumeItem{Built an ATS-inspired resume grading system that optimized the evaluation process, streamlining resume review.}
            \\resumeItem{ Developed interactive front-end components using\\textbf{ React, Shadcn, and Tailwind CSS}, delivering a seamless, user-friendly interface for recruiters and hiring managers, reducing resume review time by \\textbf{70\\%}}
            
            \\resumeItem{Implemented ML solution with \\textbf{K-means} clustering for candidate analysis, reducing team formation time by \\textbf{60\\%}}
          \\resumeItemListEnd

      \\resumeProjectHeading
          {\\textbf{TeyvatAI} $|$ \\emph{React, Next.js, TypeScript, Python, Selenium, Supabase, LangChain, Vercel}}{May 2024 -- Aug 2024}
          \\resumeItemListStart
            \\resumeItem{Built a social media app using \\textbf{TypeScript, React, and Next.js} for user registration and chat functionality}
            \\resumeItem{Implemented \\textbf{Selenium} scripts to scrape over \\textbf{500} YouTube videos and transcripts for context database enrichment}
            \\resumeItem{Built a \\textbf{Flask API} handling \\textbf{200+} daily requests, achieving\\textbf{ 99\\%} uptime on Google Cloud and Vercel deployment}
          \\resumeItemListEnd

    \\resumeSubHeadingListEnd


\\vspace{-15pt}
%-----------ACTIVITIES AND LEADERSHIP-----------
\\section{\\textbf{Activities and Leadership}}
    \\resumeSubHeadingListStart
      \\resumeSubheading
        {Vice President}{Aug 2024 -- Present}
        {Association of Computing Machinery (ACM) - The City College of New York}{New York, NY}
        \\resumeItemListStart
          \\resumeItem{Coordinated and hosted \\textbf{10}+ bi-weekly technical workshops on \\textbf{AI, cloud computing, web development}, and more collaborating with industry professionals to deliver hands-on learning experiences to \\textbf{50+} students monthly}
        \\resumeItemListEnd
        \\vspace{-5pt}

      \\resumeSubheading
        {Co-Founder/Mentor}{Feb 2024 -- Present}
        {Cracked@Coding}{Remote}
        \\resumeItemListStart
          \\resumeItem{Mentored \\textbf{25+ }students through career growth, resume reviews, interview prep, and technical project guidance}
          \\resumeItem{Led collaborative sessions on \\textbf{Python, React, and JavaScript}, resulting in \\textbf{11} students securing tech interviews}
        \\resumeItemListEnd
    \\resumeSubHeadingListEnd

\\vspace{-15pt}
%-----------TECHNICAL SKILLS-----------
\\section{\\textbf{Technical Skills}}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: TypeScript, JavaScript, Node.js, Python, SQL, PostgreSQL, Go, C++, Java, Scheme} \\\\
     \\textbf{Frameworks}{: Next.js, React, React Native Node.js, Express.js, Flask, Selenium, Jest, Tailwind CSS} \\\\
     \\textbf{Developer Tools}{: Git/GitHub, Ollama, Expo, Docker, LangChain, Postman, Figma}}} \\\\
     \\textbf{Cloud Solutions}{: AWS, GCP, Netlify, Vercel, Firebase, Supabase, PineconeDB}
 \\end{itemize}

\\end{document}`;

export default latexContent;