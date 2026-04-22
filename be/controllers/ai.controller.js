const Joi=require('joi');
const axios=require('axios');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/response');
const { STATUS_CODE } = require('../utils/constants');
const Groq= require('groq-sdk');



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


module.exports={
    chatResponse,
}