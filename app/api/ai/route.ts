import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreatorAIService } from '@/lib/ai/openai';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request payload
    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }

    // 3. Fetch file details from database
    const { data: file, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', user.id) // Ensure security check
      .single();

    if (dbError || !file) {
      return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 });
    }

    // 4. Generate AI insights from the AI Service
    const aiAnalysis = await CreatorAIService.analyzeAsset(
      file.storage_url,
      file.file_name,
      file.file_type,
      file.category
    );

    // Format analysis nicely as markdown summary
    const formattedSummary = `
### 📝 Asset Executive Summary
${aiAnalysis.summary}

### 📊 Strategic Outline
${aiAnalysis.outline.map(pt => `- ${pt}`).join('\n')}

### 💡 High-CTR Title Concepts
${aiAnalysis.suggestedTitles.map(t => `- **"${t}"**`).join('\n')}

### 🚀 Creative CTR Insights
> [!TIP]
> ${aiAnalysis.ctrInsights}
    `.trim();

    // 5. Save summary back to database
    const { error: updateError } = await supabase
      .from('files')
      .update({ ai_summary: formattedSummary })
      .eq('id', fileId);

    if (updateError) {
      console.error('Failed to update AI summary in database:', updateError);
    }

    return NextResponse.json({
      success: true,
      aiSummary: formattedSummary
    });
  } catch (error: unknown) {
    console.error('API Error in AI analysis endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
