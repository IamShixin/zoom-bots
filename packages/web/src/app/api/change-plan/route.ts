import { getServerSession } from 'next-auth/next';
import type { PlanName } from 'tier';
import { z } from 'zod';

import { env } from '@/env.mjs';
import { authOptions } from '@/lib/auth';
import { tier } from '@/lib/tier';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response('Unauthorized', { status: 403 });
    }

    const { user } = session;
    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan') as PlanName;

    const paymentMethod = await tier.lookupPaymentMethods(`org:${user?.id}`);

    if (paymentMethod.methods[0] === undefined) {
      console.log('set up mode checkout');
      const successUrl = new URL(
        `/api/subscribe?plan=${plan}`,
        env.NEXT_PUBLIC_APP_URL,
      ).toString();
      const cancelUrl = new URL('/billing', env.NEXT_PUBLIC_APP_URL).toString();

      const checkout = await tier.checkout(`org:${user?.id}`, successUrl, {
        cancelUrl,
      });

      return new Response(JSON.stringify({ url: checkout.url }));
    } else {
      console.log('subscribe');
      try {
        await tier.subscribe(`org:${user?.id}`, plan);
      } catch (error) {
        console.log(error);
      }
      return new Response(
        JSON.stringify({
          url: new URL('/translator', env.NEXT_PUBLIC_APP_URL),
        }),
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }

    return new Response(
      'Something really bad happened when trying to subscribe',
      { status: 500 },
    );
  }
}
