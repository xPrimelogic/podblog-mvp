import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateQuoteCards } from '@/lib/images/quote-cards';

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

    if (!article.transcript) {
      return NextResponse.json(
        { error: 'Article must have transcript' },
        { status: 400 }
      );
    }

    const quoteCards = await generateQuoteCards(article.transcript);

    // Convert buffers to base64 for storage and transmission
    const cardsData = quoteCards.map((card) => ({
      quote: card.quote,
      image: card.imageBuffer.toString('base64'),
      format: card.format,
    }));

    const { error: updateError } = await supabase
      .from('articles')
      .update({ quote_cards: cardsData })
      .eq('id', articleId);

    if (updateError) {
      console.error('Error updating article:', updateError);
      return NextResponse.json(
        { error: 'Failed to save quote cards' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: cardsData });
  } catch (error) {
    console.error('Error generating quote cards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
