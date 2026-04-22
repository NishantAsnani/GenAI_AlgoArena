const Joi=require('joi');
const axios=require('axios');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { STATUS_CODE,LANGUAGE_MAP } = require('../utils/constants');
const Groq= require('groq-sdk');
const aiSession=require('../models/AISession');
const submission=require('../models/submission');
const { extractJSON } = require('../utils/helper');

const DSA_SYSTEM_PROMPT = `You are a friendly and knowledgeable DSA (Data Structures & Algorithms) mentor.

SCOPE:
- Primarily help with DSA topics: arrays, linked lists, stacks, queues, trees, graphs, recursion, dynamic programming, greedy, backtracking, sorting, searching, etc.
- You may respond casually to greetings or small talk (e.g., "hi", "hello", "how are you").
- If a question is clearly NOT related to DSA, politely decline with:
  "I'm mainly here to help with DSA-related questions. Try asking something about data structures or algorithms 🙂"

LANGUAGE SUPPORT:
- Use the programming language specified by the user (C++, Java, Python, JavaScript, C).
- If no language is specified, default to C++.

RESPONSE STYLE:
- Do NOT directly give full working solutions unless the user explicitly asks for it after multiple hints.

Follow this teaching flow:
1. Understand & Restate  
   - Briefly restate the problem in simple words.

2. Guide with Questions  
   - Ask 1–2 helpful questions to push their thinking.

3. Hint the Approach  
   - Suggest patterns like two pointers, sliding window, recursion, DP, BFS/DFS, etc.

4. Light Structure (if needed)  
   - Provide pseudocode or a skeleton (not full implementation).

5. Complexity Awareness  
   - Encourage thinking about time and space complexity.

6. Encourage  
   - End with a motivating line (keep it natural, not forced).

FLEXIBILITY:
- If the user is completely stuck or explicitly says "give me the solution", you may provide a full solution with explanation.
- Adjust depth based on user level (beginner → more guidance, advanced → concise hints).

TONE:
- Friendly, supportive, and slightly conversational.
- Avoid sounding robotic or overly strict.`;


const CODE_ANALYSIS_PROMPT = `You are an expert code analyst specializing in algorithmic complexity and code quality.

TASK:
Analyze the provided code and return a structured JSON response ONLY. No extra text, no markdown, no explanation outside the JSON.

ANALYSIS RULES:
- Derive Big-O time complexity by identifying loops, recursion depth, and nested operations
- Derive Big-O space complexity by identifying auxiliary data structures, call stack usage, and allocations
- Be precise: distinguish between best, average, and worst case where they differ significantly
- Code suggestions must be actionable, specific to the given code — not generic advice
- If the code has no improvable issues, say so honestly in suggestions

RESPONSE FORMAT — Return ONLY this JSON structure, nothing else:
{
  "time_complexity": {
    "value": "O(...)",
    "best_case": "O(...)",
    "average_case": "O(...)",
    "worst_case": "O(...)",
    "description": "Plain English explanation of why this complexity arises from the code structure"
  },
  "space_complexity": {
    "value": "O(...)",
    "includes_call_stack": true or false,
    "description": "Plain English explanation of memory usage, auxiliary structures, and recursion stack if any"
  },
  "code_suggestions": 
    {
      "issue": "Short title of the problem",
      "explanation": "Why this is a concern or inefficiency",
      "suggestion": "Concrete fix or alternative approach",
      "impact": "time" or "space" or "readability" or "both"
    }
,
  "overall_rating": {
    "score": 1–10,
    "summary": "One-line verdict on the code's efficiency and quality"
  }
}

STRICT RULES:
- Output ONLY valid JSON — no prose before or after
- Do NOT add markdown code fences around the JSON
- Do NOT invent complexities — if ambiguous, state it clearly in the description field
- Language of the code does not matter — analyze logic, not syntax`


const groq = new Groq({
  apiKey:process.env.GROK_API_KEY,
});

async function chatResponse(req, res) {
  const codeSchema = Joi.object({
    prompt: Joi.string().required(),
  });

  try {

    const { error, value } = codeSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(
        res,
        error.details,
        "Validation error",
        STATUS_CODE.VALIDATION_ERROR
      );
    }

    const { prompt} = value;


    const grokResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: DSA_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
    });

    

    const reply = grokResponse.choices[0].message.content.trim();

    console.log("Grok API Response:", reply);

    if (!reply) {
      return sendErrorResponse(
        res,
        {},
        "No response from Grok API",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }

    return sendSuccessResponse(res, reply , "Mentoring response generated successfully", STATUS_CODE.SUCCESS);

  } catch (err) {
    console.log(err)
    return sendErrorResponse(
      res,
      {},
      `Error Generating Code: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

async function analyzeCode(req, res) {
  const codeSchema = Joi.object({
    submission_id: Joi.string().hex().required(),
  });

  try {

    const { error, value } = codeSchema.validate(req.body);
    if (error) {
      return sendErrorResponse(
        res,
        error.details,
        "Validation error",
        STATUS_CODE.VALIDATION_ERROR
      );
    }

    const { submission_id } = value;


    const existingAnalysis = await aiSession.findOne({ submission_id });

    if (existingAnalysis) {
      return sendSuccessResponse(res, existingAnalysis, "Existing analysis retrieved", STATUS_CODE.SUCCESS);
    }


    const required_submission = await submission.findById(submission_id);

    if (!required_submission) {
      return sendErrorResponse(
        res,
        {},
        "Submission not found",
        STATUS_CODE.NOT_FOUND
      );
    }

    const { code, language_id } = required_submission;

    if (!code || !language_id) {
      return sendErrorResponse(
        res,
        {},
        "Submission is missing code or language fields",
        STATUS_CODE.VALIDATION_ERROR
      );
    }

    const language = LANGUAGE_MAP[language_id];



    const grokResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
          { role: "system", content: CODE_ANALYSIS_PROMPT },
          {
            role: "user",
            content: `Language: ${language}\n\nCode to analyze:\n${code}`,
          },
        ],
      max_tokens: 500,
    });

    
    

    const rawReply = grokResponse.choices[0].message.content;

  

    if (!rawReply) {
      return sendErrorResponse(
        res,
        {},
        "No response from Grok API",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }


    let analysisResult;
    try {
      analysisResult = extractJSON(rawReply);
    } catch (parseErr) {
      console.log("Error parsing Grok response as JSON:", parseErr);
      return sendErrorResponse(
        res,
        { raw: rawReply },
        "Grok returned malformed JSON. Try again.",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }
    


    const aiSessionData = await aiSession.create({
      submission_id,
      user_id:req.user.id,
      time_complexity: analysisResult.time_complexity,
      space_complexity: analysisResult.space_complexity,
      code_suggestions: analysisResult.code_suggestions,
      overall_rating: analysisResult.overall_rating
    });

    return sendSuccessResponse(res, aiSessionData, "Code analyzed successfully", STATUS_CODE.SUCCESS);

  } catch (err) {
    console.log(err);
    return sendErrorResponse(
      res,
      {},
      `Error Analyzing Code: ${err.message}`,
      STATUS_CODE.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports={
    chatResponse,
    analyzeCode
}