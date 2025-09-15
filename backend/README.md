### Setting up/updating the database.types.ts

1. `npx supabase login`

2. `npx supabase gen types typescript --project-id "<PROJECT_REF>" --schema public > src/util/database.types.ts`
   > _`project-ref` is the unique identifier for the project, which can be found in the `NEXT_PUBLIC_SUPABASE_URL` in the env file.  
   > Format: https://<project_ref>.supabase.co_
