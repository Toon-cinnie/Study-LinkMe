import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'suggest_freelancers':
        systemPrompt = 'You are an AI assistant that matches tasks with the best freelancers based on skills and requirements.';
        userPrompt = `Based on this task: "${data.taskTitle}" with description: "${data.taskDescription}" and required skills: ${data.skills?.join(', ')}, suggest 3-5 key criteria to look for in a freelancer.`;
        break;
      
      case 'suggest_collaborators':
        systemPrompt = 'You are an AI assistant that helps researchers find potential collaborators.';
        userPrompt = `Based on this research topic: "${data.researchTitle}" in the field of ${data.field}, suggest 3-5 key areas of expertise to look for in potential collaborators.`;
        break;
      
      case 'grammar_check':
        systemPrompt = 'You are an AI assistant that provides grammar and structure feedback for academic writing.';
        userPrompt = `Review this text and provide constructive feedback: "${data.text}"`;
        break;
      
      case 'summarize':
        systemPrompt = 'You are an AI assistant that creates concise, academic summaries.';
        userPrompt = `Summarize this text in 2-3 sentences: "${data.text}"`;
        break;
      
      default:
        throw new Error('Invalid request type');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI Gateway error:', error);
      throw new Error('AI request failed');
    }

    const aiData = await response.json();
    const result = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in ai-assistant function:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});