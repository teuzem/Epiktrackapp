/*
          # [SECURITY] Fix Function Search Path
          This migration fixes a security warning by explicitly setting the search_path for database functions. This prevents potential function hijacking by ensuring that functions always execute with a safe and predictable schema search path.

          ## Query Description:
          - This operation modifies the configuration of existing functions (`handle_new_user` and `update_updated_at_column`).
          - It does not alter table structures or data.
          - It is a safe, non-destructive operation that improves the security posture of the database.

          ## Metadata:
          - Schema-Category: "Safe"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Functions affected: `public.handle_new_user`, `public.update_updated_at_column`

          ## Security Implications:
          - RLS Status: Unchanged
          - Policy Changes: No
          - Auth Requirements: Admin privileges to alter functions.
          - This change resolves the "Function Search Path Mutable" warning.

          ## Performance Impact:
          - Indexes: None
          - Triggers: None
          - Estimated Impact: Negligible performance impact.
          */

ALTER FUNCTION public.handle_new_user() SET search_path = public;

ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
