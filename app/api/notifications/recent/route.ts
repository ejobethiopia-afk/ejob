import { NextResponse } from 'next/server';
import { createActionClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createActionClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return NextResponse.json([], { status: 200 });

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('API fetch recent notifications error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('Unexpected error in notifications API:', err);
    return NextResponse.json({ error: 'unexpected' }, { status: 500 });
  }
}
