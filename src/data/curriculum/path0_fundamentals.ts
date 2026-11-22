import type { LearningPath } from '../../types/curriculum';

export const path0Fundamentals: LearningPath = {
  id: 'path-0',
  slug: 'computer-web-fundamentals',
  orderIndex: 0,
  title: 'Path 0: Computer & Web Fundamentals',
  subtitle: 'Zero-to-One Orientation',
  description:
    'Start here if you have never written a single line of code. Understand files, extensions, text editors, browsers, terminals, and how websites actually reach your screen.',
  difficulty: 'Beginner',
  estimatedHours: 4,
  published: true,
  courses: [
    {
      id: 'course-0',
      learningPathId: 'path-0',
      slug: 'digital-foundations',
      orderIndex: 1,
      title: 'Digital & Web Foundations',
      description: 'Build absolute confidence with how computers, files, browsers, and developer tools work together.',
      published: true,
      modules: [
        {
          id: 'mod-0-1',
          courseId: 'course-0',
          orderIndex: 1,
          title: 'How Computers, Files & Code Editors Work',
          summary: 'Files, folders, extensions, operating systems, text editors vs word processors, and basic terminal commands.',
          published: true,
          lessons: [
            {
              id: 'lesson-0-1-1',
              moduleId: 'mod-0-1',
              orderIndex: 1,
              title: 'Files, Folders & File Extensions Explained Slowly',
              durationMinutes: 12,
              xpReward: 50,
              published: true,
              objectives: [
                'Understand what a file and a folder actually represent inside an operating system.',
                'Read file extensions such as .html, .css, .js, and .png to know what program opens them.',
                'Explain why developers write code in plain text editors instead of Microsoft Word.',
              ],
              prerequisites: ['None — designed for complete beginners.'],
              intro:
                'Before writing your first line of code, you need a clear mental model of where code lives on your computer or phone. Websites are not mysterious floating clouds—they are simply organized folders full of plain text files.',
              glossaryTerms: [
                { term: 'File Extension', plainDefinition: 'The letters after the dot in a file name (like .html or .jpg) that tell your computer what kind of data is inside.' },
                { term: 'Plain Text File', plainDefinition: 'A file containing only raw characters with no hidden bold, font, or page-margin formatting.' },
                { term: 'Operating System', plainDefinition: 'The master software (Windows, macOS, Linux, Android, iOS) that manages files, memory, and hardware.' },
              ],
              breakItDownSteps: [
                {
                  stepNumber: 1,
                  title: 'A computer stores everything as named files',
                  plainExplanation:
                    'Think of a file as a single sheet of paper with information written on it—a photo, a song, or a webpage.',
                  deeperExplanation:
                    'At the hardware level, files are sequences of bytes stored on SSD or flash storage, indexed by the file system.',
                  analogy: 'A file is like a single printed page; a folder is like a cardboard manila folder that groups related pages together.',
                },
                {
                  stepNumber: 2,
                  title: 'The extension tells the computer what kind of file it is',
                  plainExplanation:
                    'Look at the end of "index.html". The ".html" part is the file extension. It tells your operating system: "This is a webpage—open me in a web browser!"',
                  deeperExplanation:
                    'Extensions map to MIME types and default file handlers. Changing .txt to .html does not change the characters inside, only how software interprets them.',
                  codeSnippet: 'my-portfolio/\n├── index.html   (Webpage structure)\n├── styles.css   (Visual design)\n└── app.js       (Interactive behavior)',
                  codeLanguage: 'bash',
                  whatIfMissing: 'If you name a webpage "index.txt" instead of "index.html", the browser displays raw code text instead of rendering a visual page.',
                  whyItMatters: 'Every front-end project relies on exact file names and extensions so browsers know which file handles structure, styling, and logic.',
                },
                {
                  stepNumber: 3,
                  title: 'Why we use Code Editors (like VS Code) instead of Word',
                  plainExplanation:
                    'Word processors add invisible formatting codes for fonts and margins. Browsers choke on those hidden codes. A code editor writes pure, clean text.',
                  deeperExplanation:
                    'Code editors such as VS Code add syntax highlighting, bracket matching, and file-tree navigation while saving UTF-8 plain text.',
                  whatIfMissing: 'Saving HTML inside a .docx file wraps your tags in XML formatting, preventing browsers from reading your webpage.',
                },
              ],
              contentBlocks: [
                {
                  type: 'markdown',
                  heading: 'Your First Mental Model: The Project Folder',
                  body: 'Every website—from a simple personal bio to a massive e-commerce store—starts as one folder on a computer. Inside that folder, you create plain text files with specific extensions:\n\n- **`.html`** defines the content and structure.\n- **`.css`** controls colors, fonts, spacing, and layout.\n- **`.js`** adds interactivity when users click, type, or fetch data.',
                },
                {
                  type: 'callout',
                  variant: 'tip',
                  title: 'Lowercase, No Spaces Rule',
                  body: 'Always name web files in lowercase with hyphens instead of spaces (for example, `about-me.html` instead of `About Me.html`). Spaces turn into ugly `%20` characters in web addresses.',
                },
                {
                  type: 'tabs',
                  title: 'Comparing Everyday Apps vs Developer Tools',
                  tabs: [
                    {
                      label: 'Text Editor (VS Code)',
                      body: 'Writes pure characters in UTF-8 without hidden styling. Ideal for HTML, CSS, and JavaScript.',
                      code: '<h1>Welcome to my site</h1>',
                      language: 'html',
                    },
                    {
                      label: 'Web Browser (Chrome / Firefox / Safari)',
                      body: 'Reads your .html, .css, and .js files and paints pixels onto the screen for humans to interact with.',
                    },
                    {
                      label: 'Terminal (Command Line)',
                      body: 'A text-based window where you type short commands like mkdir (make folder) or ls (list files) to work faster.',
                    },
                  ],
                },
              ],
              commonMistakes: [
                {
                  mistake: 'Naming a file index.html.txt on Windows or macOS',
                  whyItHappens: 'Operating systems sometimes hide known extensions, so typing ".html" creates "index.html.txt".',
                  fix: 'Turn on "Show file extensions" in your file explorer or create files directly inside VS Code.',
                },
              ],
              summary: 'Websites are organized project folders containing plain text files (.html, .css, .js) edited in a code editor and opened in a browser.',
              keyTakeaways: [
                'File extensions (.html, .css, .js) tell software how to interpret a file.',
                'Always use a plain-text code editor, never a word processor.',
                'Use lowercase filenames with hyphens and no spaces.',
              ],
              exerciseId: 'ex-0-1-1',
            },
            {
              id: 'lesson-0-1-2',
              moduleId: 'mod-0-1',
              orderIndex: 2,
              title: 'Websites vs Web Applications & Front-End vs Back-End',
              durationMinutes: 14,
              xpReward: 60,
              published: true,
              objectives: [
                'Distinguish between a static website and an interactive web application.',
                'Understand the responsibilities of Front-End vs Back-End engineering.',
                'Learn what Browser Developer Tools (DevTools) do.',
              ],
              prerequisites: ['Lesson 1: Files, Folders & File Extensions'],
              intro:
                'People use the words "website", "web app", "front-end", and "back-end" constantly. Let us clarify every single one using a restaurant analogy that makes it effortless to remember.',
              glossaryTerms: [
                { term: 'Front-End', plainDefinition: 'Everything the user sees and interacts with inside the browser (HTML, CSS, JavaScript).' },
                { term: 'Back-End', plainDefinition: 'The hidden server, database, and business logic that stores data and verifies permissions.' },
                { term: 'DevTools', plainDefinition: 'Built-in inspector tools inside Chrome, Firefox, Edge, and Safari for debugging code.' },
              ],
              breakItDownSteps: [
                {
                  stepNumber: 1,
                  title: 'The Restaurant Analogy',
                  plainExplanation:
                    'Imagine walking into a restaurant. The dining room, menu, tables, and lighting are the Front-End. The kitchen, pantry, and recipe vault are the Back-End.',
                  deeperExplanation:
                    'In software, the browser (client) renders the presentation layer, while servers and databases process secure state and persistence.',
                },
                {
                  stepNumber: 2,
                  title: 'Websites vs Web Applications',
                  plainExplanation:
                    'A website primarily presents information to read (like a portfolio or news article). A web application lets you create, edit, save, and manipulate data (like Ludek Tech Hub or Gmail).',
                  deeperExplanation:
                    'Modern web apps manage client state, asynchronous API calls, authentication sessions, and dynamic DOM updates.',
                },
                {
                  stepNumber: 3,
                  title: 'Inspecting any webpage with DevTools',
                  plainExplanation:
                    'Right-click almost any element on the web and choose "Inspect". The browser opens Developer Tools showing the exact HTML and CSS behind that element.',
                  deeperExplanation:
                    'DevTools also includes the Console tab for JavaScript logs and the Network tab for inspecting HTTP requests.',
                  codeSnippet: '<h1>Hello Developer!</h1>\n<p>Inspect me in any browser.</p>',
                  codeLanguage: 'html',
                },
              ],
              contentBlocks: [
                {
                  type: 'markdown',
                  heading: 'What a Front-End Developer Actually Builds',
                  body: 'As a front-end developer, your job is to translate ideas and designs into clean, fast, accessible interfaces that work on phones, tablets, and desktops.\n\n1. **Structure** content meaningfully with HTML.\n2. **Style** layouts responsively with CSS.\n3. **Connect** interactions and real data with JavaScript and APIs.',
                },
                {
                  type: 'reveal',
                  prompt: 'Quick Check: When you click "Save Profile" and the site remembers your name on another device, is that Front-End alone or Front-End + Back-End?',
                  answerTitle: 'Front-End + Back-End working together',
                  answerBody:
                    'The form you type into is Front-End. Sending your updated name across the network to be stored safely in a database is Back-End persistence.',
                },
              ],
              commonMistakes: [
                {
                  mistake: 'Thinking DevTools edits permanently change a live website',
                  whyItHappens: 'Editing text in Chrome DevTools changes your local browser copy temporarily.',
                  fix: 'Refresh the page and it resets. Permanent changes must be saved in your source files.',
                },
              ],
              summary: 'Front-end code runs in the user’s browser to render the interface; back-end systems run on servers to store data and enforce security.',
              keyTakeaways: [
                'Front-end = Browser UI (HTML, CSS, JavaScript).',
                'Back-end = Servers, databases, authentication, and business rules.',
                'Browser DevTools let you inspect HTML, CSS, Console errors, and Network traffic.',
              ],
              exerciseId: 'ex-0-1-2',
            },
          ],
          exercises: [
            {
              id: 'ex-0-1-1',
              moduleId: 'mod-0-1',
              lessonId: 'lesson-0-1-1',
              title: 'Identify the Right File Extension',
              difficulty: 'Beginner',
              challengeType: 'multiple-choice',
              instructions:
                'You are starting a brand-new website project folder. Which file name and extension should hold the main page structure that a browser opens first?',
              objectives: ['Recognize standard web entry filenames and extensions.'],
              starterHtml: '',
              starterCss: '',
              starterJs: '',
              solutionHtml: '',
              solutionCss: '',
              solutionJs: '',
              hints: ['Webpages use HyperText Markup Language (.html), and browsers look for "index" by convention.'],
              tests: [],
              choices: ['homepage.docx', 'index.html', 'styles.txt', 'website.png'],
              correctChoiceIndex: 1,
              explanation: 'index.html is the universal plain-text entry file that web browsers and servers look for first.',
              xpReward: 50,
            },
            {
              id: 'ex-0-1-2',
              moduleId: 'mod-0-1',
              lessonId: 'lesson-0-1-2',
              title: 'Create Your First Running HTML File',
              difficulty: 'Beginner',
              challengeType: 'write-code',
              instructions:
                'Inside the HTML editor below, write an <h1> heading that says "My First Website" and a <p> paragraph beneath it introducing yourself.',
              objectives: ['Write valid HTML tags in the live sandbox and verify the browser renders them.'],
              starterHtml: '<!-- Write your heading and paragraph below -->\n<h1></h1>\n<p></p>',
              starterCss: 'body { font-family: sans-serif; padding: 24px; }',
              starterJs: '',
              solutionHtml: '<h1>My First Website</h1>\n<p>I am learning front-end development at Ludek Tech Hub.</p>',
              solutionCss: 'body { font-family: sans-serif; padding: 24px; }',
              solutionJs: '',
              hints: [
                'Put the exact text My First Website between <h1> and </h1>.',
                'Add at least a few words inside <p> and </p>.',
              ],
              tests: [
                {
                  id: 't1',
                  description: 'Contains an <h1> element',
                  assertionType: 'dom-exists',
                  target: 'h1',
                  expected: 'true',
                  failureFeedback: 'Add an <h1>...</h1> element in the HTML editor.',
                },
                {
                  id: 't2',
                  description: '<h1> displays "My First Website"',
                  assertionType: 'dom-text',
                  target: 'h1',
                  expected: 'My First Website',
                  failureFeedback: 'Make sure your <h1> contains the text "My First Website".',
                },
                {
                  id: 't3',
                  description: 'Contains a non-empty <p> paragraph',
                  assertionType: 'dom-text',
                  target: 'p',
                  expected: ' ',
                  failureFeedback: 'Write a short sentence inside your <p>...</p> tag.',
                },
              ],
              explanation: 'Great start! You just wrote plain-text HTML tags and watched the browser render them as real page elements.',
              xpReward: 75,
            },
            {
              id: 'ex-0-1-3',
              moduleId: 'mod-0-1',
              title: 'Order the Website Creation Workflow',
              difficulty: 'Beginner',
              challengeType: 'order-steps',
              instructions: 'Arrange these steps in the logical order a developer follows when starting a brand-new local project.',
              objectives: ['Sequence project folder setup from creation to browser preview.'],
              starterHtml: '',
              starterCss: '',
              starterJs: '',
              solutionHtml: '',
              solutionCss: '',
              solutionJs: '',
              hints: ['You need a folder before you can create a file inside it, and a file before opening it in a browser.'],
              tests: [],
              orderedSteps: [
                'Create a lowercase project folder (e.g. my-site)',
                'Open the folder in a code editor like VS Code',
                'Create an index.html file and write HTML tags',
                'Open index.html in a web browser to preview',
              ],
              explanation: 'Folder -> Editor -> Code File -> Browser Preview is the universal workflow for local front-end development.',
              xpReward: 60,
            },
          ],
          quiz: {
            id: 'quiz-0-1',
            moduleId: 'mod-0-1',
            title: 'Module 0 Assessment: Computer & Web Basics',
            description: 'Verify your understanding of files, extensions, editors, and front-end vs back-end roles.',
            passingScorePercent: 70,
            xpReward: 100,
            questions: [
              {
                id: 'q-0-1-1',
                questionType: 'multiple-choice',
                prompt: 'Which file extension tells the browser a file contains visual styling rules (colors, fonts, layout)?',
                options: ['.html', '.css', '.js', '.docx'],
                correctOptionIndex: 1,
                explanation: '.css stands for Cascading Style Sheets, which controls visual presentation.',
              },
              {
                id: 'q-0-1-2',
                questionType: 'true-false',
                prompt: 'True or False: Editing text inside Browser DevTools permanently updates the website for everyone on the internet.',
                options: ['True', 'False'],
                correctOptionIndex: 1,
                explanation: 'False. DevTools only modifies the temporary copy loaded in your local browser memory.',
              },
              {
                id: 'q-0-1-3',
                questionType: 'multiple-choice',
                prompt: 'Why should developers avoid writing HTML inside Microsoft Word?',
                options: [
                  'Microsoft Word cannot type angle brackets',
                  'Word inserts hidden formatting metadata that breaks plain-text code',
                  'Browsers refuse to open files larger than 1KB',
                  'Word only supports JavaScript',
                ],
                correctOptionIndex: 1,
                explanation: 'Word processors save rich formatting markup rather than clean UTF-8 plain text.',
              },
            ],
          },
        },
      ],
    },
  ],
};
