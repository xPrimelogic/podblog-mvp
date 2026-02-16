import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSocialContent } from '@/lib/ai/social-content';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    // Fetch article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (!article.transcript || !article.content) {
      return NextResponse.json(
        { error: 'Article must have transcript and content' },
        { status: 400 }
      );
    }

    // Generate social content
    const socialContent = await generateSocialContent(
      article.transcript,
      article.content
    );

    // Update article with social content
    const { error: updateError } = await supabase
      .from('articles')
      .update({ social_content: socialContent })
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json(
        { error: 'Failed to save social content' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: socialContent });
  } catch (error) {
    console.error('Error generating social content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
