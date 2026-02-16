import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publishToWordPress } from '@/lib/integrations/wordpress';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId, wordpressConfig } = await request.json();

    if (!articleId || !wordpressConfig) {
      return NextResponse.json(
        { error: 'Article ID and WordPress config are required' },
        { status: 400 }
      );
    }

    // Validate WordPress config
    if (!wordpressConfig.siteUrl || !wordpressConfig.username || !wordpressConfig.password) {
      return NextResponse.json(
        { error: 'WordPress site URL, username, and password are required' },
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

    if (!article.content || !article.title) {
      return NextResponse.json(
        { error: 'Article must have title and content' },
        { status: 400 }
      );
    }

    // Get featured image if quote cards exist
    let featuredImage: Buffer | undefined;
    if (article.quote_cards && article.quote_cards.length > 0) {
      const firstCard = article.quote_cards[0];
      if (firstCard.image) {
        featuredImage = Buffer.from(firstCard.image, 'base64');
      }
    }

    // Publish to WordPress
    const result = await publishToWordPress(wordpressConfig, {
      title: article.title,
      content: article.content,
      featuredImage,
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        wordpressId: result.id,
        wordpressLink: result.link,
        status: result.status,
      }
    });
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
