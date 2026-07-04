# AI Interview Coach

A resume-ready AI project for fresh graduates. The app creates role-based mock interviews, accepts resume or job description context, evaluates answers, and produces a final coaching report.

## Features

- Role-based technical and HR interview questions
- Resume or job description based personalization
- Mock interview session with timer
- Answer scoring for clarity, relevance, structure, confidence, and technical depth
- Improved sample answer after each response
- Final session report with strengths and weak areas
- Voice answer input using the browser Speech Recognition API when supported

## Run in VS Code

1. Open this folder in VS Code.
2. Open the terminal.
3. Run:

```bash
npm start
```

4. Open `http://localhost:5173` in your browser.

You can also use the VS Code debugger configuration named `Run AI Interview Coach`.

## Resume Bullet

Built an AI-powered interview coaching platform that generates personalized technical and HR mock interviews from resume or job description context, evaluates responses across multiple communication and technical dimensions, and produces session-level improvement reports using rule-based NLP with an extensible LLM integration layer.

## Future Enhancements

- Connect OpenAI or Gemini API for stronger answer evaluation
- Add login and interview history database
- Add PDF resume parsing
- Add webcam-based confidence and posture analysis
- Export final report as PDF
