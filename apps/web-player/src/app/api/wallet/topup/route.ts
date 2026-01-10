import { NextResponse } from 'next/server';
import { Xendit } from 'xendit-node';
import { supabase } from '@arenax/database';

const xenditClient = new Xendit({
    secretKey: process.env.XENDIT_SECRET_KEY || 'xnd_development_...', // Placeholder for development
});

const { Invoice } = xenditClient;

export async function POST(request: Request) {
    try {
        const { userId, amount } = await request.json();

        if (!userId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
        }

        // 1. Get user profile for email
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }

        // 2. Create a pending transaction in our database
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                amount: amount,
                type: 'topup',
                status: 'pending',
                payment_method: 'xendit',
                description: `Wallet Top Up - RM ${amount}`,
            })
            .select()
            .single();

        if (txError) {
            console.error('Error creating transaction:', txError);
            return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
        }

        // 3. Create Xendit Invoice
        const invoiceResponse = await Invoice.createInvoice({
            data: {
                externalId: transaction.id, // Use our transaction ID as Xendit's external ID
                amount: amount,
                payerEmail: profile.email,
                description: `ArenaX Wallet Top Up - ${profile.full_name}`,
                currency: 'MYR',
                successRedirectUrl: `${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${userId}?status=success`,
                failureRedirectUrl: `${process.env.NEXT_PUBLIC_PLAYER_URL || 'http://localhost:3001'}/${userId}?status=failure`,
            }
        });

        // 4. Update transaction with Xendit external ID (Invoice ID)
        await supabase
            .from('transactions')
            .update({ external_id: invoiceResponse.id })
            .eq('id', transaction.id);

        return NextResponse.json({
            invoiceUrl: invoiceResponse.invoiceUrl,
            invoiceId: invoiceResponse.id
        });

    } catch (error: any) {
        console.error('Xendit Top Up Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
