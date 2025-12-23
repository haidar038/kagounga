-- Add UPDATE policy for admins on orders table
-- This allows admins to update order status and shipping information

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;

-- Create UPDATE policy for admins
CREATE POLICY "Admin can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Also add SELECT policy for admins to view all orders
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;

CREATE POLICY "Admin can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Add UPDATE policy for order_items (in case admins need to update items)
DROP POLICY IF EXISTS "Admin can update order items" ON public.order_items;

CREATE POLICY "Admin can update order items"
ON public.order_items
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

-- Add SELECT policy for admins to view all order items
DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;

CREATE POLICY "Admin can view all order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
);

COMMENT ON POLICY "Admin can update orders" ON public.orders IS 'Allows administrators to update order status, shipping info, and other fields';
COMMENT ON POLICY "Admin can view all orders" ON public.orders IS 'Allows administrators to view all orders regardless of user_id';
