import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateNewsletter } from '@/lib/ai/newsletter';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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

    if (!article.content) {
      return NextResponse.json(
        { error: 'Article must have content' },
        { status: 400 }
      );
    }

    const newsletterHtml = await generateNewsletter(
      article.content,
      article.title
    );

    const { error: updateError } = await supabase
      .from('articles')
      .update({ newsletter_html: newsletterHtml })
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json(
        { error: 'Failed to save newsletter' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { html: newsletterHtml } });
  } catch (error) {
    console.error('Error generating newsletter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
