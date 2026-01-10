-- Create Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    balance NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'MYR',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL, -- 'topup', 'payment', 'withdrawal', 'refund'
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'expired'
    payment_method TEXT, -- 'xendit', 'manual', etc.
    external_id TEXT, -- Xendit Invoice ID or Reference
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to initialize wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create wallet on profile creation
DROP TRIGGER IF EXISTS on_profile_created_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_wallet
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- Initialize wallets for existing users
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;
